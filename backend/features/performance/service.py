from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.core.enum import PortfolioCategory
from backend.domain.daily_series import (
    aggregate,
    chart_indices,
    months_before,
    on_or_before,
    period_bounds,
)
from backend.domain.performance import period_return, quota_series
from backend.repository.daily_series import daily_series, select_lines

RECENT_MONTHS = (6, 12, 24)


@dataclass(frozen=True, slots=True, kw_only=True)
class ReturnPoint:
    day: date
    cumulative_return: Decimal


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

    recent: list[Decimal | None] = []
    for months in RECENT_MONTHS:
        base = on_or_before(days, months_before(days[last], months))
        recent.append(None if base is None else period_return(quotas, base, last))

    bounds = period_bounds(days, start, end)
    period_points: list[ReturnPoint] = []
    base: int | None = None
    period: Decimal | None = None
    if bounds is not None:
        first, period_end = bounds
        base = first - 1 if first else None
        indices = list(range(first, period_end + 1))
        if base is not None:
            indices.insert(0, base)
        period = period_return(quotas, base, period_end)
        period_points = [
            ReturnPoint(
                day=days[indices[position]],
                cumulative_return=period_return(quotas, base, indices[position]),
            )
            for position in chart_indices([days[index] for index in indices])
        ]

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
    )
