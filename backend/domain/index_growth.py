"""O quanto um indexador rende por dia e o fator acumulado dele: a curva que marca a
renda fixa e a que mede o CDI e o IPCA como referência da rentabilidade."""

from __future__ import annotations

import calendar
from bisect import bisect_right
from collections.abc import Callable, Mapping, Sequence
from datetime import date, timedelta
from decimal import Decimal

from backend.core.enum import Indexer, IndexSeries
from backend.domain.business_days import BusinessCalendar
from backend.domain.index_series import DailyRate

ONE = Decimal(1)
HUNDRED = Decimal(100)
BUSINESS_DAYS_PER_YEAR = Decimal(252)
DAY = timedelta(days=1)


class PublishedSeries:
    """Valor publicado de uma série numa data: o último até ela, inclusive."""

    def __init__(self, rates: Sequence[DailyRate]) -> None:
        self._dates = [rate.rate_date for rate in rates]
        self._values = [rate.value for rate in rates]

    def at(self, day: date) -> Decimal | None:
        index = bisect_right(self._dates, day)
        return self._values[index - 1] if index else None

    @property
    def first_date(self) -> date | None:
        return self._dates[0] if self._dates else None

    @property
    def last_date(self) -> date | None:
        return self._dates[-1] if self._dates else None


def daily_factor(
    indexer: Indexer,
    rate: Decimal,
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    business: BusinessCalendar,
) -> Callable[[date], Decimal]:
    """O quanto se rende do dia `d` para o dia seguinte. `rate` segue o indexador: %
    do CDI; spread anual somado à Selic; taxa real somada ao IPCA; taxa anual no pré.
    Um dia útil carrega a taxa de um dia útil; o IPCA rende por dia corrido, pró-rata
    no mês."""
    share = rate / HUNDRED

    match indexer:
        case Indexer.CDI:
            cdi = PublishedSeries(rates.get(IndexSeries.CDI, ()))

            def percentage(day: date) -> Decimal:
                value = cdi.at(day)
                if value is None or not business.is_business_day(day):
                    return ONE
                return ONE + value / HUNDRED * share

            return percentage

        case Indexer.SELIC:
            selic = PublishedSeries(rates.get(IndexSeries.SELIC, ()))
            spread = (ONE + share) ** (ONE / BUSINESS_DAYS_PER_YEAR)

            def plus_spread(day: date) -> Decimal:
                value = selic.at(day)
                if value is None or not business.is_business_day(day):
                    return ONE
                return (ONE + value / HUNDRED) * spread

            return plus_spread

        case Indexer.PREFIXED:
            prefixed = (ONE + share) ** (ONE / BUSINESS_DAYS_PER_YEAR)
            return lambda day: prefixed if business.is_business_day(day) else ONE

        case Indexer.IPCA:
            ipca = PublishedSeries(rates.get(IndexSeries.IPCA, ()))
            real = (ONE + share) ** (ONE / BUSINESS_DAYS_PER_YEAR)

            def inflation(day: date) -> Decimal:
                monthly = ipca.at(day)
                factor = ONE
                if monthly is not None:
                    days_in_month = calendar.monthrange(day.year, day.month)[1]
                    factor = (ONE + monthly / HUNDRED) ** (ONE / Decimal(days_in_month))
                return factor * real if business.is_business_day(day) else factor

            return inflation


def accumulation(
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
