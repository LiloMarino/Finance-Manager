"""Posição e preço médio, recalculados das operações a cada consulta.

Funções puras sobre `OperationRecord`: servem as telas, a transferência e a checagem
de posição negativa, e rodam headless na paridade com o IR-Helper. As regras de cada
tipo e a ordem das contas reproduzem as do IR-Helper, então o PM bate dígito a
dígito no contexto Decimal padrão (28 dígitos).
"""

from __future__ import annotations

from collections.abc import Iterable, Iterator
from dataclasses import dataclass
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


def replay(
    operations: Iterable[OperationRecord],
) -> Iterator[tuple[OperationRecord, Position]]:
    """A posição do ativo logo depois de cada operação, por data e ordem de gravação."""
    positions: dict[str, Position] = {}
    for operation in sorted(operations, key=lambda op: (op.operation_date, op.id)):
        position = apply(positions.get(operation.ticker, Position()), operation)
        positions[operation.ticker] = position
        yield operation, position


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
