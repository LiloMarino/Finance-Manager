"""Posição e preço médio, recalculados das operações a cada consulta.

Funções puras sobre `OperationRecord`: servem as telas, a transferência, a checagem
de posição negativa e a apuração fiscal. A ordem das contas faz parte do resultado:
no contexto Decimal padrão (28 dígitos), outra ordem muda o último dígito do PM.

O PM é o custo fiscal: compra e venda do mesmo ativo no mesmo dia se pareiam como day
trade (Perguntas e Respostas IRPF 2026, pergunta 705) e só as sobras movem a posição.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable, Iterator, Sequence
from dataclasses import dataclass, replace
from datetime import date
from decimal import Decimal

from backend.core.enum import OperationType
from backend.core.errors import FinanceError

ZERO = Decimal(0)


@dataclass(frozen=True, slots=True, kw_only=True)
class Position:
    quantity: Decimal = ZERO
    average_price: Decimal = ZERO

    @property
    def total_cost(self) -> Decimal:
        return self.quantity * self.average_price


@dataclass(frozen=True, slots=True, kw_only=True)
class OperationRecord:
    """Uma operação como o motor a lê. O `id` desempata operações do mesmo dia: a
    ordem de gravação é a ordem em que aconteceram."""

    id: int
    ticker: str
    operation_date: date
    operation_type: OperationType
    quantity: Decimal
    unit_price: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class DayTrade:
    """Compra e venda do mesmo ativo no mesmo dia, pareadas pela ordem: a 1ª compra
    com a 1ª venda, e assim em diante, até a menor das duas quantidades."""

    ticker: str
    trade_date: date
    quantity: Decimal
    cost: Decimal
    proceeds: Decimal

    @property
    def result(self) -> Decimal:
        return self.proceeds - self.cost


@dataclass(frozen=True, slots=True, kw_only=True)
class Step:
    """Uma operação assentada e a posição do ativo logo antes e logo depois dela."""

    operation: OperationRecord
    before: Position
    after: Position


class NegativePositionError(FinanceError):
    status = 422


def _acquire(position: Position, quantity: Decimal, unit_price: Decimal) -> Position:
    denominator = position.quantity + quantity
    if denominator == ZERO:
        return Position(quantity=denominator, average_price=position.average_price)
    total_cost = (position.average_price * position.quantity) + (quantity * unit_price)
    return Position(quantity=denominator, average_price=total_cost / denominator)


def _release(position: Position, quantity: Decimal) -> Position:
    remaining = position.quantity - quantity
    if remaining == ZERO:
        return Position()
    return Position(quantity=remaining, average_price=position.average_price)


def _rescale(position: Position, quantity: Decimal) -> Position:
    """Mesmo custo total dividido por outra quantidade."""
    if quantity == ZERO:
        return Position(quantity=quantity, average_price=position.average_price)
    total_cost = position.average_price * position.quantity
    return Position(quantity=quantity, average_price=total_cost / quantity)


def apply(position: Position, operation: OperationRecord) -> Position:
    match operation.operation_type:
        case OperationType.BUY:
            return _acquire(position, operation.quantity, operation.unit_price)
        case OperationType.SELL | OperationType.TRANSFER_OUT:
            return _release(position, operation.quantity)
        case OperationType.BONUS | OperationType.SPLIT:
            return _rescale(position, position.quantity + operation.quantity)
        case OperationType.REVERSE_SPLIT:
            # `quantity` é o fator do grupamento
            return _rescale(position, position.quantity * operation.quantity)
        case OperationType.TRANSFER_IN:
            if position.quantity + operation.quantity == ZERO:
                return position
            return _acquire(position, operation.quantity, operation.unit_price)


def _chronological(operations: Iterable[OperationRecord]) -> list[OperationRecord]:
    """Por data e, no mesmo dia, pela ordem de gravação."""
    return sorted(operations, key=lambda op: (op.operation_date, op.id))


def _consume(
    legs: Sequence[OperationRecord], quantity: Decimal, matched: dict[int, Decimal]
) -> Decimal:
    """Consome `quantity` das pernas pela ordem e devolve o valor financeiro delas."""
    value = ZERO
    for leg in legs:
        if quantity == ZERO:
            break
        taken = min(leg.quantity, quantity)
        matched[leg.id] = taken
        value += taken * leg.unit_price
        quantity -= taken
    return value


def settle_day_trades(
    operations: Iterable[OperationRecord],
) -> tuple[list[OperationRecord], list[DayTrade]]:
    """Separa o day trade do resto: devolve as operações com a parte pareada
    descontada, em ordem, e os day trades de cada (ativo, dia)."""
    ordered = _chronological(operations)
    by_day: defaultdict[tuple[str, date], list[OperationRecord]] = defaultdict(list)
    for operation in ordered:
        if operation.operation_type in (OperationType.BUY, OperationType.SELL):
            by_day[(operation.ticker, operation.operation_date)].append(operation)

    matched: dict[int, Decimal] = {}
    day_trades: list[DayTrade] = []
    for (ticker, trade_date), trades in by_day.items():
        buys = [op for op in trades if op.operation_type is OperationType.BUY]
        sells = [op for op in trades if op.operation_type is OperationType.SELL]
        quantity = min(
            sum((op.quantity for op in buys), ZERO),
            sum((op.quantity for op in sells), ZERO),
        )
        if quantity == ZERO:
            continue
        day_trades.append(
            DayTrade(
                ticker=ticker,
                trade_date=trade_date,
                quantity=quantity,
                cost=_consume(buys, quantity, matched),
                proceeds=_consume(sells, quantity, matched),
            )
        )

    settled = [
        replace(operation, quantity=operation.quantity - matched[operation.id])
        if operation.id in matched
        else operation
        for operation in ordered
        if matched.get(operation.id) != operation.quantity
    ]
    return settled, day_trades


def steps(operations: Iterable[OperationRecord]) -> Iterator[Step]:
    """Cada operação assentada com a posição do ativo antes e depois dela."""
    positions: dict[str, Position] = {}
    settled, _ = settle_day_trades(operations)
    for operation in settled:
        before = positions.get(operation.ticker, Position())
        after = apply(before, operation)
        positions[operation.ticker] = after
        yield Step(operation=operation, before=before, after=after)


def replay(
    operations: Iterable[OperationRecord],
) -> Iterator[tuple[OperationRecord, Position]]:
    """A posição do ativo logo depois de cada operação assentada."""
    for step in steps(operations):
        yield step.operation, step.after


def current_positions(operations: Iterable[OperationRecord]) -> dict[str, Position]:
    return {operation.ticker: position for operation, position in replay(operations)}


def position_at(
    operations: Iterable[OperationRecord], ticker: str, until: date
) -> Position:
    """Posição de `ticker` no fim do dia `until`, com as operações desse dia."""
    return current_positions(
        op for op in operations if op.ticker == ticker and op.operation_date <= until
    ).get(ticker, Position())


def check_non_negative(operations: Iterable[OperationRecord]) -> None:
    """Nenhuma posição fica negativa em data nenhuma do histórico."""
    for operation, position in replay(operations):
        if position.quantity < ZERO:
            raise NegativePositionError(
                f"A posição de {operation.ticker} ficaria negativa em "
                f"{operation.operation_date:%d/%m/%Y}"
            )
