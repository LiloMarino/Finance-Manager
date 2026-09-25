"""Opções de renda fixa lado a lado, cada uma aplicada e resgatada uma vez, sobre as
séries já projetadas: o que cada uma entrega líquido e quanto isso vale em CDI."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from backend.core.enum import FixedIncomeType, Indexer, IndexSeries
from backend.domain.break_even import solve
from backend.domain.business_days import BusinessCalendar
from backend.domain.fixed_income import (
    Application,
    FixedIncomeTerms,
    Redemption,
    iof_rate,
    tax_rate,
)
from backend.domain.index_series import DailyRate

ONE = Decimal(1)
HUNDRED = Decimal(100)
BUSINESS_DAYS_PER_YEAR = Decimal(252)
WEEK = timedelta(days=7)
DAY = timedelta(days=1)


@dataclass(frozen=True, slots=True, kw_only=True)
class Option:
    terms: FixedIncomeTerms
    amount: Decimal
    applied_on: date
    redeemed_on: date


@dataclass(frozen=True, slots=True, kw_only=True)
class OptionResult:
    """`net_annual_return` em fração (0,1 é 10%), nulo sem dia útil no prazo.
    `cdi_equivalent` em % do CDI: o de um CDB tributado que empata no líquido."""

    calendar_days: int
    business_days: int
    redemption: Redemption
    income_tax_rate: Decimal | None
    iof_rate: Decimal
    net_annual_return: Decimal | None
    cdi_equivalent: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class ComparisonPoint:
    """O líquido de cada opção no dia, na ordem das opções: nulo antes da aplicação,
    e o resgatado depois do resgate."""

    day: date
    net_values: list[Decimal | None]


@dataclass(frozen=True, slots=True, kw_only=True)
class Comparison:
    results: list[OptionResult]
    points: list[ComparisonPoint]


def _business_days(calendar: BusinessCalendar, start: date, end: date) -> int:
    """Os dias úteis que rendem de `start` a `end`: o da aplicação entra, e o do
    resgate não."""
    count = 0
    day = start
    while day < end:
        count += calendar.is_business_day(day)
        day += DAY
    return count


def _cdi_equivalent(
    option: Option, net: Decimal, rates: Mapping[IndexSeries, Sequence[DailyRate]]
) -> Decimal | None:
    def gap(rate: Decimal) -> Decimal:
        cdb = FixedIncomeTerms(
            product_type=FixedIncomeType.CDB,
            indexer=Indexer.CDI,
            rate=rate,
            maturity_date=option.redeemed_on,
        )
        application = Application(cdb, option.applied_on, rates, option.redeemed_on)
        return application.value_at(option.amount, option.redeemed_on).net - net

    return solve(gap, Decimal(0), HUNDRED)


def _result(
    option: Option,
    application: Application,
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    calendar: BusinessCalendar,
) -> OptionResult:
    redeemed_on = option.redeemed_on
    redemption = application.value_at(option.amount, redeemed_on)
    calendar_days = (redeemed_on - option.applied_on).days
    business_days = _business_days(calendar, option.applied_on, redeemed_on)
    net_annual_return = (
        (redemption.net / option.amount) ** (BUSINESS_DAYS_PER_YEAR / business_days)
        - ONE
        if business_days
        else None
    )
    return OptionResult(
        calendar_days=calendar_days,
        business_days=business_days,
        redemption=redemption,
        income_tax_rate=None if option.terms.tax_exempt else tax_rate(calendar_days),
        iof_rate=iof_rate(calendar_days),
        net_annual_return=net_annual_return,
        cdi_equivalent=_cdi_equivalent(option, redemption.net, rates),
    )


def _chart_days(options: Sequence[Option]) -> list[date]:
    """Um dia por semana, da primeira aplicação ao último resgate, mais os dias de
    aplicação e de resgate de cada opção."""
    start = min(option.applied_on for option in options)
    end = max(option.redeemed_on for option in options)
    days = {start + WEEK * week for week in range((end - start) // WEEK + 1)}
    days.update(option.applied_on for option in options)
    days.update(option.redeemed_on for option in options)
    return sorted(days)


def compare(
    options: Sequence[Option], rates: Mapping[IndexSeries, Sequence[DailyRate]]
) -> Comparison:
    """`rates` já cobre até o último resgate, com a projeção depois do dado real."""
    if not options:
        return Comparison(results=[], points=[])
    calendar = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    applications = [
        Application(option.terms, option.applied_on, rates, option.redeemed_on)
        for option in options
    ]
    results = [
        _result(option, application, rates, calendar)
        for option, application in zip(options, applications, strict=True)
    ]
    points = [
        ComparisonPoint(
            day=day,
            net_values=[
                None
                if day < option.applied_on
                else application.value_at(
                    option.amount, min(day, option.redeemed_on)
                ).net
                for option, application in zip(options, applications, strict=True)
            ],
        )
        for day in _chart_days(options)
    ]
    return Comparison(results=results, points=points)
