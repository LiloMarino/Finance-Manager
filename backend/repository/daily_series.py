from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import FixedIncomeMovementType, IndexSeries, PortfolioCategory
from backend.core.models.models import Asset, FixedIncomeInvestment, PriceHistory
from backend.domain.business_days import ONE_DAY, BusinessCalendar
from backend.domain.cash import cash_line
from backend.domain.daily_series import ZERO, DailyLine, equity_line, flow_index
from backend.domain.fixed_income import daily_gross, payouts
from backend.domain.market_data import DailyClose
from backend.domain.position import OperationRecord
from backend.repository.cash import cash_ledger
from backend.repository.fixed_income import investment_terms, movements_by_investment
from backend.repository.income import income_records
from backend.repository.market import index_rates
from backend.repository.operations import operation_records
from backend.repository.subportfolios import Members


@dataclass(frozen=True, slots=True, kw_only=True)
class DailySeries:
    """Os dias úteis da primeira movimentação da carteira até hoje, uma linha por
    ativo com operação e por título com movimentação, e a linha do saldo de
    investimento, nula antes da abertura dele.

    O saldo fica fora de `lines`: a rentabilidade lê só `lines`, e a Evolução soma o
    saldo à carteira geral."""

    days: list[date]
    lines: list[DailyLine]
    cash: DailyLine | None


def _closes(session: Session) -> dict[int, list[DailyClose]]:
    closes: defaultdict[int, list[DailyClose]] = defaultdict(list)
    for asset_id, price_date, close in session.execute(
        select(
            PriceHistory.asset_id, PriceHistory.price_date, PriceHistory.close
        ).order_by(PriceHistory.asset_id, PriceHistory.price_date)
    ).tuples():
        closes[asset_id].append(DailyClose(price_date=price_date, close=close))
    return closes


def _days(calendar: BusinessCalendar, first: date, today: date) -> list[date]:
    days: list[date] = []
    day = calendar.on_or_after(first)
    last = calendar.on_or_before(today)
    while day <= last:
        days.append(day)
        day = calendar.on_or_after(day + ONE_DAY)
    return days


def _income(session: Session, days: list[date]) -> dict[int, list[Decimal]]:
    """O líquido de proventos de cada ativo em cada dia da série, pelo pagamento."""
    income: defaultdict[int, list[Decimal]] = defaultdict(lambda: [ZERO] * len(days))
    for record in income_records(session):
        income[record.asset_id][flow_index(days, record.payment_date)] += record.amount
    return income


def daily_series(session: Session, today: date) -> DailySeries:
    records = operation_records(session)
    movements = movements_by_investment(session)
    starts = [record.operation_date for record in records] + [
        movement.movement_date for found in movements.values() for movement in found
    ]
    if not starts:
        return DailySeries(days=[], lines=[], cash=None)

    rates = index_rates(session)
    days = _days(BusinessCalendar(rates[IndexSeries.CDI]), min(starts), today)
    if not days:
        return DailySeries(days=[], lines=[], cash=None)

    by_ticker: defaultdict[str, list[OperationRecord]] = defaultdict(list)
    for record in records:
        by_ticker[record.ticker].append(record)
    closes = _closes(session)
    income = _income(session, days)
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
                income=income.get(asset.id, [ZERO] * len(days)),
            )
        )

    for investment in session.scalars(
        select(FixedIncomeInvestment)
        .where(FixedIncomeInvestment.id.in_(movements))
        .order_by(FixedIncomeInvestment.label)
    ):
        found = movements[investment.id]
        terms = investment_terms(investment)
        inflows = [ZERO] * len(days)
        outflows = [ZERO] * len(days)
        for movement in found:
            if movement.movement_type is FixedIncomeMovementType.APPLICATION:
                inflows[flow_index(days, movement.movement_date)] += movement.amount
        # A saída é cada resgate pelo bruto, com o automático do vencimento
        for payout in payouts(terms, found, rates, today):
            outflows[flow_index(days, payout.payout_date)] += payout.gross
        lines.append(
            DailyLine(
                category=PortfolioCategory.FIXED_INCOME,
                asset_id=None,
                investment_id=investment.id,
                values=daily_gross(terms, found, rates, days),
                inflows=inflows,
                outflows=outflows,
                income=[ZERO] * len(days),
            )
        )

    found_ledger = cash_ledger(session, today)
    return DailySeries(
        days=days,
        lines=lines,
        cash=cash_line(days, found_ledger) if found_ledger else None,
    )


def select_lines(
    series: DailySeries,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
    members: Members | None = None,
) -> list[DailyLine]:
    """As linhas da carteira, de uma subcarteira, de uma categoria ou de um ativo."""
    return [
        line
        for line in series.lines
        if (category is None or line.category is category)
        and (asset_id is None or line.asset_id == asset_id)
        and (
            members is None
            or line.asset_id in members.asset_ids
            or line.investment_id in members.investment_ids
        )
    ]
