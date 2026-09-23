from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import Indexer
from backend.core.models.models import FixedIncomeInvestment, FixedIncomeMovement
from backend.domain.fixed_income import FixedIncomeTerms, Marking, Movement, mark
from backend.repository.market import index_rates


@dataclass(frozen=True, slots=True, kw_only=True)
class MarkedInvestment:
    id: int
    label: str
    indexer: Indexer
    rate: Decimal
    maturity_date: date | None
    daily_liquidity: bool
    tax_exempt: bool
    invested: Decimal
    gross_value: Decimal
    estimated_tax: Decimal
    net_value: Decimal
    as_of: date
    series_date: date | None


def marked_investments(
    session: Session, today: date, investment_id: int | None = None
) -> list[MarkedInvestment]:
    """Os títulos marcados em `today` pelas séries em cache; sem `investment_id`,
    todos."""
    investments = select(FixedIncomeInvestment).order_by(FixedIncomeInvestment.label)
    movements = select(FixedIncomeMovement).order_by(FixedIncomeMovement.id)
    if investment_id is not None:
        investments = investments.where(FixedIncomeInvestment.id == investment_id)
        movements = movements.where(FixedIncomeMovement.investment_id == investment_id)

    by_investment: defaultdict[int, list[Movement]] = defaultdict(list)
    for movement in session.scalars(movements):
        by_investment[movement.investment_id].append(
            Movement(
                movement_date=movement.movement_date,
                movement_type=movement.movement_type,
                amount=movement.amount,
            )
        )

    rates = index_rates(session)
    return [
        _marked(
            investment,
            mark(
                FixedIncomeTerms(
                    indexer=investment.indexer,
                    rate=investment.rate,
                    maturity_date=investment.maturity_date,
                    tax_exempt=investment.tax_exempt,
                ),
                by_investment[investment.id],
                rates,
                today,
            ),
        )
        for investment in session.scalars(investments)
    ]


def _marked(investment: FixedIncomeInvestment, marking: Marking) -> MarkedInvestment:
    return MarkedInvestment(
        id=investment.id,
        label=investment.label,
        indexer=investment.indexer,
        rate=investment.rate,
        maturity_date=investment.maturity_date,
        daily_liquidity=investment.daily_liquidity,
        tax_exempt=investment.tax_exempt,
        invested=marking.invested,
        gross_value=marking.gross_value,
        estimated_tax=marking.estimated_tax,
        net_value=marking.net_value,
        as_of=marking.as_of,
        series_date=marking.series_date,
    )
