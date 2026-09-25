from __future__ import annotations

from datetime import date

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.fixed_income.dto import (
    FixedIncomeCreateDTO,
    FixedIncomeDetailDTO,
    FixedIncomeDTO,
    FixedIncomeInDTO,
    MovementDTO,
    MovementInDTO,
)
from backend.features.fixed_income.service import (
    add_movement,
    create_investment,
    delete_investment,
    delete_movement,
    get_investment,
    list_investments,
    update_investment,
)

router = APIRouter(prefix="/api/fixed-income", tags=["fixed-income"])


@router.get("")
def list_all(session: SessionDep) -> list[FixedIncomeDTO]:
    return list_investments(session, date.today())


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: FixedIncomeCreateDTO) -> FixedIncomeDetailDTO:
    return create_investment(session, payload, date.today())


@router.get("/{investment_id}")
def get(session: SessionDep, investment_id: int) -> FixedIncomeDetailDTO:
    return get_investment(session, investment_id, date.today())


@router.put("/{investment_id}")
def update(
    session: SessionDep, investment_id: int, payload: FixedIncomeInDTO
) -> FixedIncomeDetailDTO:
    return update_investment(session, investment_id, payload, date.today())


@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, investment_id: int) -> None:
    delete_investment(session, investment_id)


@router.post("/{investment_id}/movements", status_code=status.HTTP_201_CREATED)
def create_movement(
    session: SessionDep, investment_id: int, payload: MovementInDTO
) -> MovementDTO:
    return add_movement(session, investment_id, payload)


@router.delete("/movements/{movement_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_movement(session: SessionDep, movement_id: int) -> None:
    delete_movement(session, movement_id)
