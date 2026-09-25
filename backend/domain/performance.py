"""Rentabilidade por cota, a mesma conta da cota de um fundo.

A cota começa em 1 e, a cada dia, é multiplicada por
`(valor de hoje + saídas do dia) / (valor da véspera + entradas do dia)`. A entrada
compra cotas pelo valor do dia e a saída as vende, então aporte e resgate mudam o
número de cotas e deixam o valor da cota como está. A entrada soma embaixo e a saída
em cima, e assim a primeira compra (véspera zerada) e a venda total (hoje zerado)
fecham sem divisão por zero.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from itertools import groupby

from backend.domain.daily_series import DailyPoint

ONE = Decimal(1)
ZERO = Decimal(0)


def quota_series(points: Sequence[DailyPoint]) -> list[Decimal]:
    """A cota no fim de cada dia. Dia sem posição na véspera e sem entrada não mexe
    nela."""
    quotas: list[Decimal] = []
    quota = ONE
    previous = ZERO
    for point in points:
        base = previous + point.inflow
        if base > ZERO:
            quota *= (point.value + point.outflow) / base
        quotas.append(quota)
        previous = point.value
    return quotas


def period_return(quotas: Sequence[Decimal], base: int | None, end: int) -> Decimal:
    """A variação da cota do fim do dia `base` ao fim do dia `end`; sem `base`, desde
    antes do primeiro dia, quando a cota valia 1."""
    start = quotas[base] if base is not None else ONE
    return quotas[end] / start - ONE


@dataclass(frozen=True, slots=True, kw_only=True)
class YearReturns:
    """`months` tem os 12 meses do ano, nulos fora da série. O ano e o acumulado
    compõem os meses, que é como a cota compõe."""

    year: int
    months: list[Decimal | None]
    year_return: Decimal
    accumulated: Decimal


def monthly_returns(
    days: Sequence[date], quotas: Sequence[Decimal]
) -> list[YearReturns]:
    """A variação da cota em cada mês e em cada ano, de fechamento a fechamento: do
    último dia do mês anterior ao último do mês. O primeiro mês parte de antes do
    primeiro dia, e o mês corrente vai até o último dia da série."""
    month_ends: dict[tuple[int, int], int] = {}
    for index, day in enumerate(days):
        month_ends[(day.year, day.month)] = index

    years: list[YearReturns] = []
    previous: int | None = None
    for year, found in groupby(sorted(month_ends.items()), key=lambda item: item[0][0]):
        ends = list(found)
        year_base = previous
        months: list[Decimal | None] = [None] * 12
        for (_, month), end in ends:
            months[month - 1] = period_return(quotas, previous, end)
            previous = end
        year_end = ends[-1][1]
        years.append(
            YearReturns(
                year=year,
                months=months,
                year_return=period_return(quotas, year_base, year_end),
                accumulated=period_return(quotas, None, year_end),
            )
        )
    return years
