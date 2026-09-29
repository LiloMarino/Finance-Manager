from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import PortfolioCategory
from backend.core.models.models import Asset, FixedIncomeInvestment
from backend.domain.daily_series import DailyPoint, aggregate, period_bounds
from backend.domain.performance import period_return, quota_series
from backend.domain.risk import annualized_volatility, daily_returns
from backend.repository.daily_series import daily_series, select_lines
from backend.repository.subportfolios import members


@dataclass(frozen=True, slots=True, kw_only=True)
class RiskPoint:
    """Retorno e risco no período. `returns` é quantos retornos diários entraram na
    volatilidade, nula com poucos."""

    period_return: Decimal
    volatility: float | None
    returns: int


@dataclass(frozen=True, slots=True, kw_only=True)
class RiskItem:
    """Um ativo (`asset_id`) ou um título (`investment_id`), com o valor no fim do
    período."""

    asset_id: int | None
    investment_id: int | None
    label: str
    category: PortfolioCategory
    value: Decimal
    risk: RiskPoint


@dataclass(frozen=True, slots=True, kw_only=True)
class RiskReturn:
    """`start` é o dia cujo fechamento é a base do período da carteira, nulo quando
    ele começa com ela. Cada item mede o próprio período dentro do da carteira: o
    ativo comprado no meio conta desde a compra."""

    start: date | None
    end: date | None
    portfolio: RiskPoint | None
    items: list[RiskItem]


EMPTY = RiskReturn(start=None, end=None, portfolio=None, items=[])


@dataclass(frozen=True, slots=True, kw_only=True)
class _Measured:
    risk: RiskPoint
    base: date | None
    end: DailyPoint


def _measure(
    points: list[DailyPoint], start: date | None, end: date | None
) -> _Measured | None:
    """Retorno e risco de uma soma de linhas no período; nulo quando ela não tem dia
    nele."""
    days = [point.day for point in points]
    bounds = period_bounds(days, start, end)
    if bounds is None:
        return None
    first, last = bounds
    base = first - 1 if first else None
    returns = [
        found for found in daily_returns(points)[first : last + 1] if found is not None
    ]
    return _Measured(
        risk=RiskPoint(
            period_return=period_return(quota_series(points), base, last),
            volatility=annualized_volatility(returns),
            returns=len(returns),
        ),
        base=days[base] if base is not None else None,
        end=points[last],
    )


def risk_return(
    session: Session,
    today: date,
    *,
    category: PortfolioCategory | None = None,
    subportfolio_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
) -> RiskReturn:
    """Os itens com valor no fim do período e o conjunto inteiro, que conta também
    o que foi vendido no meio dele."""
    scope = members(session, subportfolio_id)
    series = daily_series(session, today)
    lines = select_lines(series, category, None, scope)
    portfolio = _measure(aggregate(series.days, lines), start, end)
    if portfolio is None:
        return EMPTY

    tickers = dict(session.execute(select(Asset.id, Asset.ticker)).tuples().all())
    labels = dict(
        session.execute(select(FixedIncomeInvestment.id, FixedIncomeInvestment.label))
        .tuples()
        .all()
    )
    items: list[RiskItem] = []
    for line in lines:
        measured = _measure(aggregate(series.days, [line]), start, end)
        if measured is None or measured.end.value <= 0:
            continue
        if line.asset_id is not None:
            label = tickers[line.asset_id]
        elif line.investment_id is not None:
            label = labels[line.investment_id]
        else:
            continue
        items.append(
            RiskItem(
                asset_id=line.asset_id,
                investment_id=line.investment_id,
                label=label,
                category=line.category,
                value=measured.end.value,
                risk=measured.risk,
            )
        )
    return RiskReturn(
        start=portfolio.base,
        end=portfolio.end.day,
        portfolio=portfolio.risk,
        items=items,
    )
