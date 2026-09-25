"""As séries de juros e inflação estendidas para o futuro, com taxas constantes.

Até o último dado real, a série é a do cache. Depois dele, cada série segue a taxa
anual informada: o CDI e a Selic viram uma taxa diária em cada dia de semana, e o
IPCA, uma taxa mensal no dia 1 de cada mês. A marcação da renda fixa lê a série
estendida do mesmo jeito que lê a real.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from backend.core.enum import IndexSeries
from backend.domain.index_series import DailyRate

ONE = Decimal(1)
HUNDRED = Decimal(100)
BUSINESS_DAYS_PER_YEAR = Decimal(252)
MONTHS_PER_YEAR = Decimal(12)
DAY = timedelta(days=1)


@dataclass(frozen=True, slots=True, kw_only=True)
class Assumptions:
    """Taxas ao ano, em %: 14 é 14% a.a."""

    cdi: Decimal
    selic: Decimal
    ipca: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class CurrentRates:
    """O último valor real de cada série, anualizado, com a data dele. Nulo sem dado
    suficiente no cache: o IPCA pede 12 meses."""

    cdi: Decimal | None
    cdi_date: date | None
    selic: Decimal | None
    selic_date: date | None
    ipca: Decimal | None
    ipca_date: date | None


def _annualized_daily(rates: Sequence[DailyRate]) -> Decimal | None:
    if not rates:
        return None
    return ((ONE + rates[-1].value / HUNDRED) ** BUSINESS_DAYS_PER_YEAR - ONE) * HUNDRED


def _last_12_months(rates: Sequence[DailyRate]) -> Decimal | None:
    if len(rates) < 12:
        return None
    growth = ONE
    for rate in rates[-12:]:
        growth *= ONE + rate.value / HUNDRED
    return (growth - ONE) * HUNDRED


def current_rates(rates: Mapping[IndexSeries, Sequence[DailyRate]]) -> CurrentRates:
    cdi = rates.get(IndexSeries.CDI, ())
    selic = rates.get(IndexSeries.SELIC, ())
    ipca = rates.get(IndexSeries.IPCA, ())
    return CurrentRates(
        cdi=_annualized_daily(cdi),
        cdi_date=cdi[-1].rate_date if cdi else None,
        selic=_annualized_daily(selic),
        selic_date=selic[-1].rate_date if selic else None,
        ipca=_last_12_months(ipca),
        ipca_date=ipca[-1].rate_date if ipca else None,
    )


def _daily_rate(annual: Decimal) -> Decimal:
    return ((ONE + annual / HUNDRED) ** (ONE / BUSINESS_DAYS_PER_YEAR) - ONE) * HUNDRED


def _monthly_rate(annual: Decimal) -> Decimal:
    return ((ONE + annual / HUNDRED) ** (ONE / MONTHS_PER_YEAR) - ONE) * HUNDRED


def _next_month(day: date) -> date:
    return date(day.year + day.month // 12, day.month % 12 + 1, 1)


def _extend_daily(
    rates: Sequence[DailyRate], annual: Decimal, start: date, end: date
) -> list[DailyRate]:
    value = _daily_rate(annual)
    day = rates[-1].rate_date + DAY if rates else start
    extended = list(rates)
    while day <= end:
        if day.weekday() < 5:
            extended.append(DailyRate(rate_date=day, value=value))
        day += DAY
    return extended


def _extend_monthly(
    rates: Sequence[DailyRate], annual: Decimal, start: date, end: date
) -> list[DailyRate]:
    value = _monthly_rate(annual)
    month = _next_month(rates[-1].rate_date) if rates else start.replace(day=1)
    extended = list(rates)
    while month <= end:
        extended.append(DailyRate(rate_date=month, value=value))
        month = _next_month(month)
    return extended


def project(
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    assumptions: Assumptions,
    start: date,
    end: date,
) -> dict[IndexSeries, list[DailyRate]]:
    """As séries estendidas do dia seguinte ao último dado real até `end`, sem buraco
    entre o real e o projetado: o `BusinessCalendar` trata como feriado o dia de
    semana sem CDI dentro da série. Sem cache, a projeção começa em `start`."""
    projected = {series: list(values) for series, values in rates.items()}
    projected[IndexSeries.CDI] = _extend_daily(
        rates.get(IndexSeries.CDI, ()), assumptions.cdi, start, end
    )
    projected[IndexSeries.SELIC] = _extend_daily(
        rates.get(IndexSeries.SELIC, ()), assumptions.selic, start, end
    )
    projected[IndexSeries.IPCA] = _extend_monthly(
        rates.get(IndexSeries.IPCA, ()), assumptions.ipca, start, end
    )
    return projected
