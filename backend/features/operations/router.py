from __future__ import annotations

from datetime import date

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.core.enum import OperationType
from backend.features.operations.dto import OperationDTO, OperationInDTO
from backend.features.operations.service import (
    create_operation,
    delete_operation,
    list_operations,
    update_operation,
)

router = APIRouter(prefix="/api/operations", tags=["operations"])


@router.get("")
def list_all(
    session: SessionDep,
    asset_id: int | None = None,
    operation_type: OperationType | None = None,
    start: date | None = None,
    end: date | None = None,
) -> list[OperationDTO]:
    return list_operations(
        session,
        asset_id=asset_id,
        operation_type=operation_type,
        start=start,
        end=end,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: OperationInDTO) -> OperationDTO:
    return create_operation(session, payload)


@router.put("/{operation_id}")
def update(
    session: SessionDep, operation_id: int, payload: OperationInDTO
) -> OperationDTO:
    return update_operation(session, operation_id, payload)


@router.delete("/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, operation_id: int) -> None:
    delete_operation(session, operation_id)
