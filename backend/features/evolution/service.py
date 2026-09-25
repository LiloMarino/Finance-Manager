from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.core.enum import PortfolioCategory
from backend.domain.daily_series import (
    ZERO,
    aggregate,
    chart_indices,
    months_before,
    on_or_before,
    period_bounds,
)
from backend.repository.daily_series import daily_series, select_lines

RECENT_MONTHS = (6, 12, 24)


@dataclass(frozen=True, slots=True, kw_only=True)
class EvolutionPoint:
    """`invested` é o que entrou menos o que saiu até o dia, e `gain` é o
    patrimônio menos ele."""

    day: date
    value: Decimal
    invested: Decimal
    gain: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class Growth:
    """A variação do patrimônio, com os aportes e os resgates dentro."""

    change: Decimal
    growth_return: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class CategoryValue:
    category: PortfolioCategory
    value: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class Evolution:
    """O patrimônio no tempo do conjunto escolhido. `total` e o crescimento contam
    até hoje, e o crescimento é nulo quando a série não cobre o começo dele. As
    categorias são as da carteira toda, com o valor de hoje."""

    total: Decimal
    last_6_months: Growth | None
    last_12_months: Growth | None
    last_24_months: Growth | None
    categories: list[CategoryValue]
    points: list[EvolutionPoint]


def _growth(values: list[Decimal], base: int | None, last: int) -> Growth | None:
    if base is None:
        return None
    change = values[last] - values[base]
    return Growth(
        change=change,
        growth_return=change / values[base] if values[base] else None,
    )


def evolution(
    session: Session,
    today: date,
    *,
    category: PortfolioCategory | None = None,
    start: date | None = None,
    end: date | None = None,
) -> Evolution:
    series = daily_series(session, today)

    by_category: defaultdict[PortfolioCategory, Decimal] = defaultdict(Decimal)
    for line in series.lines:
        by_category[line.category] += line.values[-1]
    categories = [
        CategoryValue(category=found, value=by_category[found])
        for found in PortfolioCategory
        if by_category[found] > ZERO
    ]

    points = aggregate(series.days, select_lines(series, category))
    if not points:
        return Evolution(
            total=ZERO,
            last_6_months=None,
            last_12_months=None,
            last_24_months=None,
            categories=categories,
            points=[],
        )
    days = [point.day for point in points]
    values = [point.value for point in points]
    invested: list[Decimal] = []
    running = ZERO
    for point in points:
        running += point.inflow - point.outflow
        invested.append(running)
    last = len(points) - 1
    growth = [
        _growth(values, on_or_before(days, months_before(days[last], months)), last)
        for months in RECENT_MONTHS
    ]

    bounds = period_bounds(days, start, end)
    period_points: list[EvolutionPoint] = []
    if bounds is not None:
        first, period_end = bounds
        indices = list(range(first, period_end + 1))
        period_points = [
            EvolutionPoint(
                day=days[index],
                value=values[index],
                invested=invested[index],
                gain=values[index] - invested[index],
            )
            for index in (
                indices[position]
                for position in chart_indices([days[index] for index in indices])
            )
        ]

    return Evolution(
        total=values[last],
        last_6_months=growth[0],
        last_12_months=growth[1],
        last_24_months=growth[2],
        categories=categories,
        points=period_points,
    )
