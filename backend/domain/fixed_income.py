"""Marcação de renda fixa pela curva do indexador, recalculada a cada consulta.

O valor de cada fluxo cresce por um fator acumulado `F`, que é o mesmo para todos os
fluxos do título. Por isso o saldo bruto é linear, `Σ aplicação * F(t)/F(a) -
Σ resgate * F(t)/F(r)`, e independe de qual aplicação o resgate consumiu. Os lotes
existem só para o IR regressivo, que depende da idade de cada aplicação.
"""

from __future__ import annotations

import calendar
from bisect import bisect_right
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, replace
from datetime import date, timedelta
from decimal import Decimal

from backend.core.enum import FixedIncomeMovementType, Indexer, IndexSeries
from backend.domain.business_days import BusinessCalendar
from backend.domain.index_series import DailyRate

ZERO = Decimal(0)
ONE = Decimal(1)
HUNDRED = Decimal(100)
BUSINESS_DAYS_PER_YEAR = Decimal(252)
DAY = timedelta(days=1)

# IR regressivo: até N dias corridos da aplicação, a alíquota ao lado
TAX_BRACKETS = (
    (180, Decimal("0.225")),
    (360, Decimal("0.20")),
    (720, Decimal("0.175")),
)
LONG_TERM_TAX = Decimal("0.15")

INDEX_SERIES = {
    Indexer.CDI: IndexSeries.CDI,
    Indexer.SELIC: IndexSeries.SELIC,
    Indexer.IPCA: IndexSeries.IPCA,
}


@dataclass(frozen=True, slots=True, kw_only=True)
class FixedIncomeTerms:
    """`rate` segue o indexador: % do CDI ou da Selic; taxa real somada ao IPCA;
    taxa anual no pré. Tudo em %."""

    indexer: Indexer
    rate: Decimal
    maturity_date: date | None
    tax_exempt: bool


@dataclass(frozen=True, slots=True, kw_only=True)
class Movement:
    movement_date: date
    movement_type: FixedIncomeMovementType
    amount: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class Marking:
    """`invested` é o principal ainda aplicado; `series_date` é o último dado real
    do indexador usado, e depois dele o último valor se repete."""

    invested: Decimal
    gross_value: Decimal
    estimated_tax: Decimal
    as_of: date
    series_date: date | None

    @property
    def net_value(self) -> Decimal:
        return self.gross_value - self.estimated_tax


@dataclass(frozen=True, slots=True, kw_only=True)
class _Lot:
    """Uma aplicação em unidades do fator acumulado: vale `units * F(t)`."""

    opened: date
    units: Decimal
    principal: Decimal


class _Series:
    """Valor publicado de uma série numa data: o último até ela, inclusive."""

    def __init__(self, rates: Sequence[DailyRate]) -> None:
        self._dates = [rate.rate_date for rate in rates]
        self._values = [rate.value for rate in rates]

    def at(self, day: date) -> Decimal | None:
        index = bisect_right(self._dates, day)
        return self._values[index - 1] if index else None

    @property
    def last_date(self) -> date | None:
        return self._dates[-1] if self._dates else None


def tax_rate(days: int) -> Decimal:
    for limit, rate in TAX_BRACKETS:
        if days <= limit:
            return rate
    return LONG_TERM_TAX


def _daily_factor(
    terms: FixedIncomeTerms,
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
) -> Callable[[date], Decimal]:
    """O quanto o título rende do dia `d` para o dia seguinte. Um dia útil carrega
    a taxa de um dia útil; o IPCA rende por dia corrido, pró-rata no mês."""
    business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    share = terms.rate / HUNDRED

    match terms.indexer:
        case Indexer.CDI | Indexer.SELIC:
            series = _Series(rates.get(INDEX_SERIES[terms.indexer], ()))

            def floating(day: date) -> Decimal:
                value = series.at(day)
                if value is None or not business.is_business_day(day):
                    return ONE
                return ONE + value / HUNDRED * share

            return floating

        case Indexer.PREFIXED:
            prefixed = (ONE + share) ** (ONE / BUSINESS_DAYS_PER_YEAR)
            return lambda day: prefixed if business.is_business_day(day) else ONE

        case Indexer.IPCA:
            ipca = _Series(rates.get(IndexSeries.IPCA, ()))
            real = (ONE + share) ** (ONE / BUSINESS_DAYS_PER_YEAR)

            def inflation(day: date) -> Decimal:
                monthly = ipca.at(day)
                factor = ONE
                if monthly is not None:
                    days_in_month = calendar.monthrange(day.year, day.month)[1]
                    factor = (ONE + monthly / HUNDRED) ** (ONE / Decimal(days_in_month))
                return factor * real if business.is_business_day(day) else factor

            return inflation


def _accumulation(
    daily: Callable[[date], Decimal], start: date, end: date
) -> Callable[[date], Decimal]:
    """`F(d)`, com `F(start) = 1`. Fora de [start, end], vale o da ponta: depois do
    vencimento o título para de render."""
    cumulative = {start: ONE}
    current = ONE
    day = start
    while day < end:
        current *= daily(day)
        day += DAY
        cumulative[day] = current
    last = max(start, end)
    return lambda d: cumulative[min(max(d, start), last)]


def _redeem(lots: list[_Lot], units: Decimal) -> list[_Lot]:
    """Consome as unidades das aplicações mais antigas primeiro. Resgate maior que
    o saldo zera o título: a diferença é o erro da estimativa."""
    remaining = units
    result: list[_Lot] = []
    for lot in lots:
        taken = min(lot.units, remaining)
        remaining -= taken
        if taken == lot.units:
            continue
        kept = lot.units - taken
        result.append(
            replace(lot, units=kept, principal=lot.principal * kept / lot.units)
        )
    return result


def mark(
    terms: FixedIncomeTerms,
    movements: Sequence[Movement],
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    today: date,
) -> Marking:
    """Saldo bruto, principal e IR estimado do título em `today`, ou no vencimento
    se ele já passou. `movements` vem na ordem de gravação; o IOF não entra."""
    as_of = min(today, terms.maturity_date) if terms.maturity_date else today
    series = INDEX_SERIES.get(terms.indexer)
    series_date = _Series(rates.get(series, ())).last_date if series else None

    ordered = sorted(movements, key=lambda movement: movement.movement_date)
    if not ordered:
        return Marking(
            invested=ZERO,
            gross_value=ZERO,
            estimated_tax=ZERO,
            as_of=as_of,
            series_date=series_date,
        )

    factor = _accumulation(_daily_factor(terms, rates), ordered[0].movement_date, as_of)
    lots: list[_Lot] = []
    for movement in ordered:
        units = movement.amount / factor(movement.movement_date)
        if movement.movement_type is FixedIncomeMovementType.APPLICATION:
            lots.append(
                _Lot(
                    opened=movement.movement_date,
                    units=units,
                    principal=movement.amount,
                )
            )
        else:
            lots = _redeem(lots, units)

    now = factor(as_of)
    gains = [(lot, lot.units * now - lot.principal) for lot in lots]
    estimated_tax = (
        ZERO
        if terms.tax_exempt
        else sum(
            (
                gain * tax_rate((as_of - lot.opened).days)
                for lot, gain in gains
                if gain > ZERO
            ),
            ZERO,
        )
    )
    return Marking(
        invested=sum((lot.principal for lot in lots), ZERO),
        gross_value=sum((lot.units * now for lot in lots), ZERO),
        estimated_tax=estimated_tax,
        as_of=as_of,
        series_date=series_date,
    )
