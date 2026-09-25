"""Série diária: o valor de cada ativo e de cada título no fim de cada dia útil, com o
dinheiro que entrou e saiu dele no dia. Recalculada a cada consulta, das operações,
das movimentações e dos caches de mercado.

Somar as linhas certas dá a carteira, uma categoria ou um ativo. Toda linha de uma
série cobre os mesmos dias, então somar é somar posição a posição.
"""

from __future__ import annotations

import calendar
from bisect import bisect_left, bisect_right
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from backend.core.enum import OperationType, PortfolioCategory
from backend.core.errors import FinanceError
from backend.domain.market_data import DailyClose
from backend.domain.position import (
    CORPORATE_EVENTS,
    OperationRecord,
    Position,
    steps,
)

ZERO = Decimal(0)
ONE = Decimal(1)


class InvalidPeriodError(FinanceError):
    status = 422


@dataclass(frozen=True, slots=True, kw_only=True)
class DailyLine:
    """Um ativo (`asset_id`) ou um título (`investment_id`). `values[i]` é o valor no
    fim de `days[i]` da série; entrada é compra ou aplicação, saída é venda ou
    resgate, e provento é o líquido recebido no dia, em reais. O provento fica fora
    da saída porque não devolve o que foi investido."""

    category: PortfolioCategory
    asset_id: int | None
    investment_id: int | None
    values: list[Decimal]
    inflows: list[Decimal]
    outflows: list[Decimal]
    income: list[Decimal]


@dataclass(frozen=True, slots=True, kw_only=True)
class DailyPoint:
    day: date
    value: Decimal
    inflow: Decimal
    outflow: Decimal
    income: Decimal


def flow_index(days: Sequence[date], day: date) -> int:
    """O dia da série em que entra um fluxo de `day`: ele mesmo, ou o dia útil
    seguinte; depois do último dia da série, o último."""
    return min(bisect_left(days, day), len(days) - 1)


def _event_factors(
    ordered: Sequence[tuple[date, Decimal]],
) -> tuple[list[date], list[Decimal]]:
    """As datas dos eventos e, para cada índice `i`, o produto dos fatores do
    evento `i` em diante."""
    dates = [day for day, _ in ordered]
    suffix = [ONE] * (len(ordered) + 1)
    for index in range(len(ordered) - 1, -1, -1):
        suffix[index] = suffix[index + 1] * ordered[index][1]
    return dates, suffix


def equity_line(
    operations: Sequence[OperationRecord],
    closes: Sequence[DailyClose],
    days: Sequence[date],
) -> tuple[list[Decimal], list[Decimal], list[Decimal]]:
    """Valor, entrada e saída de um ativo em cada um dos `days`.

    O fechamento em cache vem ajustado por desdobro, grupamento e bonificação, na
    base de quantidade de hoje, e a fonte aplica o ajuste até a véspera da data
    gravada do evento. Por isso a quantidade de um dia é multiplicada pelo fator de
    cada evento com data posterior a ele. Sem fechamento até o dia, o ativo vale o
    custo; depois do último, o último se repete.

    A quantidade é a posição assentada, com o day trade pareado; entrada e saída são
    cada compra e cada venda pelo valor dela."""
    count = len(days)
    values = [ZERO] * count
    inflows = [ZERO] * count
    outflows = [ZERO] * count
    if not count:
        return values, inflows, outflows

    for operation in operations:
        amount = operation.quantity * operation.unit_price
        if operation.operation_type is OperationType.BUY:
            inflows[flow_index(days, operation.operation_date)] += amount
        elif operation.operation_type is OperationType.SELL:
            outflows[flow_index(days, operation.operation_date)] += amount

    settled = list(steps(operations))
    event_dates, suffix = _event_factors(
        [
            (step.operation.operation_date, step.after.quantity / step.before.quantity)
            for step in settled
            if step.operation.operation_type in CORPORATE_EVENTS
            and step.before.quantity
        ]
    )
    close_dates = [close.price_date for close in closes]

    position = Position()
    cursor = 0
    for index, day in enumerate(days):
        while cursor < len(settled) and settled[cursor].operation.operation_date <= day:
            position = settled[cursor].after
            cursor += 1
        if not position.quantity:
            continue
        found = bisect_right(close_dates, day)
        if not found:
            values[index] = position.total_cost
            continue
        factor = suffix[bisect_right(event_dates, day)]
        values[index] = position.quantity * factor * closes[found - 1].close
    return values, inflows, outflows


def aggregate(days: Sequence[date], lines: Iterable[DailyLine]) -> list[DailyPoint]:
    """A soma das `lines` em cada dia, a partir do primeiro dia com valor ou fluxo."""
    count = len(days)
    values = [ZERO] * count
    inflows = [ZERO] * count
    outflows = [ZERO] * count
    income = [ZERO] * count
    for line in lines:
        for index in range(count):
            values[index] += line.values[index]
            inflows[index] += line.inflows[index]
            outflows[index] += line.outflows[index]
            income[index] += line.income[index]
    first = next(
        (
            index
            for index in range(count)
            if values[index] or inflows[index] or outflows[index]
        ),
        count,
    )
    return [
        DailyPoint(
            day=days[index],
            value=values[index],
            inflow=inflows[index],
            outflow=outflows[index],
            income=income[index],
        )
        for index in range(first, count)
    ]


def months_before(day: date, months: int) -> date:
    """O mesmo dia `months` meses antes; num mês mais curto, o último dia dele."""
    total = day.year * 12 + day.month - 1 - months
    year, month = divmod(total, 12)
    month += 1
    return date(year, month, min(day.day, calendar.monthrange(year, month)[1]))


def on_or_before(days: Sequence[date], day: date) -> int | None:
    """O índice do último dia da série até `day`, inclusive; nulo antes do primeiro."""
    index = bisect_right(days, day)
    return index - 1 if index else None


def period_bounds(
    days: Sequence[date], start: date | None, end: date | None
) -> tuple[int, int] | None:
    """Os índices do primeiro e do último dia da série em [`start`, `end`], com as
    pontas abertas quando nulas; nulo quando nenhum dia da série cai no período."""
    if start is not None and end is not None and start > end:
        raise InvalidPeriodError("O início do período é depois do fim.")
    first = bisect_left(days, start) if start is not None else 0
    last = bisect_right(days, end) - 1 if end is not None else len(days) - 1
    return (first, last) if first <= last else None


# Até um ano de período, o gráfico mostra todo dia; acima, um ponto por mês
DAILY_SPAN_DAYS = 366


def chart_indices(days: Sequence[date]) -> list[int]:
    """Os pontos do gráfico: todos num período curto; no longo, o primeiro, o último
    dia de cada mês e o último da série."""
    if not days or (days[-1] - days[0]).days <= DAILY_SPAN_DAYS:
        return list(range(len(days)))
    kept = [0]
    for index in range(1, len(days)):
        last = index == len(days) - 1
        if last or (days[index].year, days[index].month) != (
            days[index + 1].year,
            days[index + 1].month,
        ):
            kept.append(index)
    return kept
