from __future__ import annotations

from collections.abc import Collection

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.models.models import Asset, Operation
from backend.domain.position import OperationRecord, check_non_negative


def operation_records(
    session: Session, tickers: Collection[str] | None = None
) -> list[OperationRecord]:
    """As operações como o motor de posição as lê; sem `tickers`, todas."""
    statement = select(
        Operation.id,
        Asset.ticker,
        Operation.operation_date,
        Operation.operation_type,
        Operation.quantity,
        Operation.unit_price,
    ).join(Asset, Asset.id == Operation.asset_id)
    if tickers is not None:
        statement = statement.where(Asset.ticker.in_(tickers))
    return [
        OperationRecord(
            id=operation_id,
            ticker=ticker,
            operation_date=operation_date,
            operation_type=operation_type,
            quantity=quantity,
            unit_price=unit_price,
        )
        for (
            operation_id,
            ticker,
            operation_date,
            operation_type,
            quantity,
            unit_price,
        ) in session.execute(statement).tuples()
    ]


def check_positions(session: Session, tickers: Collection[str]) -> None:
    """Confere, com o que a sessão já tem pendente, que nenhuma posição dos
    `tickers` fica negativa. Roda antes do commit de toda escrita."""
    session.flush()
    check_non_negative(operation_records(session, tickers))
