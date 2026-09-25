from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import OperationType
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, Operation
from backend.features.operations.dto import (
    OperationDTO,
    OperationInDTO,
)
from backend.repository.operations import check_positions
from backend.repository.tickers import TickerHistory, ticker_history


class OperationNotFoundError(FinanceError):
    status = 404


class InvalidOperationError(FinanceError):
    status = 422


def _asset(session: Session, asset_id: int) -> Asset:
    asset = session.get(Asset, asset_id)
    if asset is None:
        raise InvalidOperationError("Ativo não encontrado.")
    return asset


def _operation(session: Session, operation_id: int) -> Operation:
    operation = session.get(Operation, operation_id)
    if operation is None:
        raise OperationNotFoundError("Operação não encontrada.")
    return operation


def list_operations(
    session: Session,
    *,
    asset_id: int | None = None,
    operation_type: OperationType | None = None,
    start: date | None = None,
    end: date | None = None,
) -> list[OperationDTO]:
    """Mais recentes primeiro; no mesmo dia, a última gravada primeiro. Cada uma
    com o ticker vigente na data dela."""
    statement = (
        select(Operation, Asset)
        .join(Asset, Asset.id == Operation.asset_id)
        .order_by(Operation.operation_date.desc(), Operation.id.desc())
    )
    if asset_id is not None:
        statement = statement.where(Operation.asset_id == asset_id)
    if operation_type is not None:
        statement = statement.where(Operation.operation_type == operation_type)
    if start is not None:
        statement = statement.where(Operation.operation_date >= start)
    if end is not None:
        statement = statement.where(Operation.operation_date <= end)
    history = ticker_history(session)
    return [
        _to_dto(operation, asset, history)
        for operation, asset in session.execute(statement).tuples()
    ]


def _to_dto(operation: Operation, asset: Asset, history: TickerHistory) -> OperationDTO:
    return OperationDTO(
        id=operation.id,
        asset_id=asset.id,
        ticker=history.on(asset.id, operation.operation_date, asset.ticker),
        asset_class=asset.asset_class,
        operation_date=operation.operation_date,
        operation_type=operation.operation_type,
        quantity=operation.quantity,
        unit_price=operation.unit_price,
    )


def create_operation(session: Session, payload: OperationInDTO) -> OperationDTO:
    asset = _asset(session, payload.asset_id)
    operation = Operation(
        asset_id=asset.id,
        operation_date=payload.operation_date,
        operation_type=payload.operation_type,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
    )
    session.add(operation)
    check_positions(session, [asset.ticker])
    session.commit()
    return _to_dto(operation, asset, ticker_history(session))


def update_operation(
    session: Session, operation_id: int, payload: OperationInDTO
) -> OperationDTO:
    operation = _operation(session, operation_id)
    previous = _asset(session, operation.asset_id)
    asset = _asset(session, payload.asset_id)
    operation.asset_id = asset.id
    operation.operation_date = payload.operation_date
    operation.operation_type = payload.operation_type
    operation.quantity = payload.quantity
    operation.unit_price = payload.unit_price
    check_positions(session, {previous.ticker, asset.ticker})
    session.commit()
    return _to_dto(operation, asset, ticker_history(session))


def delete_operation(session: Session, operation_id: int) -> None:
    operation = _operation(session, operation_id)
    asset = _asset(session, operation.asset_id)
    session.delete(operation)
    check_positions(session, [asset.ticker])
    session.commit()
