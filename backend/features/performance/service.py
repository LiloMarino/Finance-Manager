from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.core.enum import IndexSeries, PortfolioCategory
from backend.domain.benchmarks import BENCHMARKS, benchmark_levels
from backend.domain.daily_series import (
    aggregate,
    chart_indices,
    months_before,
    on_or_before,
    period_bounds,
)
from backend.domain.index_growth import PublishedSeries
from backend.domain.performance import (
    YearReturns,
    monthly_returns,
    period_return,
    quota_series,
)
from backend.repository.daily_series import daily_series, select_lines
from backend.repository.market import index_rates

RECENT_MONTHS = (6, 12, 24)


@dataclass(frozen=True, slots=True, kw_only=True)
class ReturnPoint:
    day: date
    cumulative_return: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class BenchmarkReturn:
    """Uma referência no mesmo período e nos mesmos dias da carteira. `data_until` é
    o último valor real da série; depois dele, o último valor se repete."""

    series: IndexSeries
    period: Decimal | None
    data_until: date | None
    points: list[ReturnPoint]


@dataclass(frozen=True, slots=True, kw_only=True)
class Performance:
    """Rentabilidade por cota do conjunto escolhido. `start` é o dia cujo fechamento
    é a base do período, nulo quando o período começa com a carteira; os pontos
    acumulam desde essa base. Os retornos recentes contam até o último dia da
    série e são nulos quando ela não cobre o começo deles."""

    first_date: date | None
    start: date | None
    end: date | None
    since_inception: Decimal | None
    period: Decimal | None
    last_6_months: Decimal | None
    last_12_months: Decimal | None
    last_24_months: Decimal | None
    points: list[ReturnPoint]
    cdi_share: Decimal | None
    benchmarks: list[BenchmarkReturn]


EMPTY = Performance(
    first_date=None,
    start=None,
    end=None,
    since_inception=None,
    period=None,
    last_6_months=None,
    last_12_months=None,
    last_24_months=None,
    points=[],
    cdi_share=None,
    benchmarks=[],
)


def performance(
    session: Session,
    today: date,
    *,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
) -> Performance:
    """O período vai do fechamento da véspera de `start` ao de `end`: o primeiro dia
    dele já conta."""
    series = daily_series(session, today)
    points = aggregate(series.days, select_lines(series, category, asset_id))
    if not points:
        return EMPTY
    days = [point.day for point in points]
    quotas = quota_series(points)
    last = len(points) - 1
    rates = index_rates(session)

    recent: list[Decimal | None] = []
    for months in RECENT_MONTHS:
        base = on_or_before(days, months_before(days[last], months))
        recent.append(None if base is None else period_return(quotas, base, last))

    bounds = period_bounds(days, start, end)
    base: int | None = None
    period_end = last
    sampled: list[int] = []
    if bounds is not None:
        first, period_end = bounds
        base = first - 1 if first else None
        indices = list(range(first, period_end + 1))
        if base is not None:
            indices.insert(0, base)
        sampled = [
            indices[position]
            for position in chart_indices([days[index] for index in indices])
        ]

    def returns(levels: list[Decimal]) -> tuple[Decimal | None, list[ReturnPoint]]:
        """O retorno do período e os pontos do gráfico, da cota ou de uma referência."""
        if bounds is None:
            return None, []
        return period_return(levels, base, period_end), [
            ReturnPoint(
                day=days[index], cumulative_return=period_return(levels, base, index)
            )
            for index in sampled
        ]

    period, period_points = returns(quotas)
    benchmarks: list[BenchmarkReturn] = []
    for benchmark in BENCHMARKS:
        levels = benchmark_levels(benchmark, rates, days)
        benchmark_period, benchmark_points = (
            returns(levels) if levels is not None else (None, [])
        )
        benchmarks.append(
            BenchmarkReturn(
                series=benchmark,
                period=benchmark_period,
                data_until=PublishedSeries(rates[benchmark]).last_date,
                points=benchmark_points,
            )
        )
    cdi = benchmarks[BENCHMARKS.index(IndexSeries.CDI)].period

    return Performance(
        first_date=days[0],
        start=days[base] if base is not None else None,
        end=period_points[-1].day if period_points else None,
        since_inception=period_return(quotas, None, last),
        period=period,
        last_6_months=recent[0],
        last_12_months=recent[1],
        last_24_months=recent[2],
        points=period_points,
        cdi_share=period / cdi if period is not None and cdi else None,
        benchmarks=benchmarks,
    )


@dataclass(frozen=True, slots=True, kw_only=True)
class BenchmarkYears:
    series: IndexSeries
    years: list[YearReturns]


@dataclass(frozen=True, slots=True, kw_only=True)
class MonthReturn:
    year: int
    month: int
    value: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class MonthlyPerformance:
    """A rentabilidade de cada mês e de cada ano, da carteira e das referências nos
    mesmos meses. As contagens são dos meses da carteira: `months` é o total, e o mês
    com variação zero não conta como positivo nem como negativo."""

    years: list[YearReturns]
    benchmarks: list[BenchmarkYears]
    best_month: MonthReturn | None
    worst_month: MonthReturn | None
    months: int
    positive_months: int
    negative_months: int


def monthly_performance(
    session: Session,
    today: date,
    *,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
) -> MonthlyPerformance:
    series = daily_series(session, today)
    points = aggregate(series.days, select_lines(series, category, asset_id))
    days = [point.day for point in points]
    rates = index_rates(session)
    years = monthly_returns(days, quota_series(points))
    months = [
        MonthReturn(year=found.year, month=month, value=value)
        for found in years
        for month, value in enumerate(found.months, start=1)
        if value is not None
    ]
    benchmarks: list[BenchmarkYears] = []
    for benchmark in BENCHMARKS:
        levels = benchmark_levels(benchmark, rates, days)
        benchmarks.append(
            BenchmarkYears(
                series=benchmark,
                years=monthly_returns(days, levels) if levels is not None else [],
            )
        )
    return MonthlyPerformance(
        years=years,
        benchmarks=benchmarks,
        best_month=max(months, key=lambda found: found.value, default=None),
        worst_month=min(months, key=lambda found: found.value, default=None),
        months=len(months),
        positive_months=sum(1 for found in months if found.value > 0),
        negative_months=sum(1 for found in months if found.value < 0),
    )
