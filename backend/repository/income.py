from __future__ import annotations

from collections.abc import Collection

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.models.models import Asset, IncomeEvent
from backend.domain.income import IncomeRecord


def income_records(
    session: Session, tickers: Collection[str] | None = None
) -> list[IncomeRecord]:
    """Os proventos em ordem de pagamento; sem `tickers`, todos."""
    statement = (
        select(IncomeEvent, Asset.ticker, Asset.asset_class)
        .join(Asset, Asset.id == IncomeEvent.asset_id)
        .order_by(IncomeEvent.payment_date, IncomeEvent.id)
    )
    if tickers is not None:
        statement = statement.where(Asset.ticker.in_(tickers))
    return [
        IncomeRecord(
            id=event.id,
            asset_id=event.asset_id,
            ticker=ticker,
            asset_class=asset_class,
            payment_date=event.payment_date,
            income_type=event.income_type,
            quantity=event.quantity,
            unit_price=event.unit_price,
            amount=event.amount,
        )
        for event, ticker, asset_class in session.execute(statement).tuples()
    ]
