from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import FixedIncomeMovementType, IndexSeries, PortfolioCategory
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    PriceHistory,
)
from backend.domain.business_days import ONE_DAY, BusinessCalendar
from backend.domain.daily_series import ZERO, DailyLine, equity_line, flow_index
from backend.domain.fixed_income import FixedIncomeTerms, Movement, daily_gross
from backend.domain.market_data import DailyClose
from backend.domain.position import OperationRecord
from backend.repository.market import index_rates
from backend.repository.operations import operation_records


@dataclass(frozen=True, slots=True, kw_only=True)
class DailySeries:
    """Os dias úteis da primeira movimentação da carteira até hoje, e uma linha por
    ativo com operação e por título com movimentação."""

    days: list[date]
    lines: list[DailyLine]


def _closes(session: Session) -> dict[int, list[DailyClose]]:
    closes: defaultdict[int, list[DailyClose]] = defaultdict(list)
    for asset_id, price_date, close in session.execute(
        select(
            PriceHistory.asset_id, PriceHistory.price_date, PriceHistory.close
        ).order_by(PriceHistory.asset_id, PriceHistory.price_date)
    ).tuples():
        closes[asset_id].append(DailyClose(price_date=price_date, close=close))
    return closes


def _movements(session: Session) -> dict[int, list[Movement]]:
    movements: defaultdict[int, list[Movement]] = defaultdict(list)
    for movement in session.scalars(
        select(FixedIncomeMovement).order_by(FixedIncomeMovement.id)
    ):
        movements[movement.investment_id].append(
            Movement(
                movement_date=movement.movement_date,
                movement_type=movement.movement_type,
                amount=movement.amount,
            )
        )
    return movements


def _days(calendar: BusinessCalendar, first: date, today: date) -> list[date]:
    days: list[date] = []
    day = calendar.on_or_after(first)
    last = calendar.on_or_before(today)
    while day <= last:
        days.append(day)
        day = calendar.on_or_after(day + ONE_DAY)
    return days


def daily_series(session: Session, today: date) -> DailySeries:
    records = operation_records(session)
    movements = _movements(session)
    starts = [record.operation_date for record in records] + [
        movement.movement_date for found in movements.values() for movement in found
    ]
    if not starts:
        return DailySeries(days=[], lines=[])

    rates = index_rates(session)
    days = _days(BusinessCalendar(rates[IndexSeries.CDI]), min(starts), today)
    if not days:
        return DailySeries(days=[], lines=[])

    by_ticker: defaultdict[str, list[OperationRecord]] = defaultdict(list)
    for record in records:
        by_ticker[record.ticker].append(record)
    closes = _closes(session)
    lines: list[DailyLine] = []
    for asset in session.scalars(
        select(Asset).where(Asset.ticker.in_(by_ticker)).order_by(Asset.ticker)
    ):
        values, inflows, outflows = equity_line(
            by_ticker[asset.ticker], closes.get(asset.id, []), days
        )
        lines.append(
            DailyLine(
                category=PortfolioCategory(asset.asset_class),
                asset_id=asset.id,
                investment_id=None,
                values=values,
                inflows=inflows,
                outflows=outflows,
            )
        )

    for investment in session.scalars(
        select(FixedIncomeInvestment)
        .where(FixedIncomeInvestment.id.in_(movements))
        .order_by(FixedIncomeInvestment.label)
    ):
        found = movements[investment.id]
        inflows = [ZERO] * len(days)
        outflows = [ZERO] * len(days)
        for movement in found:
            flows = (
                inflows
                if movement.movement_type is FixedIncomeMovementType.APPLICATION
                else outflows
            )
            flows[flow_index(days, movement.movement_date)] += movement.amount
        lines.append(
            DailyLine(
                category=PortfolioCategory.FIXED_INCOME,
                asset_id=None,
                investment_id=investment.id,
                values=daily_gross(
                    FixedIncomeTerms(
                        product_type=investment.product_type,
                        indexer=investment.indexer,
                        rate=investment.rate,
                        maturity_date=investment.maturity_date,
                    ),
                    found,
                    rates,
                    days,
                ),
                inflows=inflows,
                outflows=outflows,
            )
        )
    return DailySeries(days=days, lines=lines)


def select_lines(
    series: DailySeries,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
) -> list[DailyLine]:
    """As linhas da carteira, de uma categoria ou de um ativo."""
    return [
        line
        for line in series.lines
        if (category is None or line.category is category)
        and (asset_id is None or line.asset_id == asset_id)
    ]
