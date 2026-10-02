from __future__ import annotations

from datetime import date

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.subportfolios.dto import (
    DivisionDTO,
    MembersInDTO,
    SubportfolioDTO,
    SubportfolioInDTO,
)
from backend.features.subportfolios.service import (
    create_subportfolio,
    delete_subportfolio,
    division,
    list_subportfolios,
    set_members,
    update_subportfolio,
)

router = APIRouter(prefix="/api/subportfolios", tags=["subportfolios"])


@router.get("")
def list_all(session: SessionDep) -> list[SubportfolioDTO]:
    return list_subportfolios(session)


@router.get("/division")
def get_division(session: SessionDep) -> DivisionDTO:
    """Como a carteira se divide entre as subcarteiras e o que está fora delas."""
    return division(session, date.today())


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: SubportfolioInDTO) -> SubportfolioDTO:
    return create_subportfolio(session, payload)


@router.put("/{subportfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def update(
    session: SessionDep, subportfolio_id: int, payload: SubportfolioInDTO
) -> None:
    update_subportfolio(session, subportfolio_id, payload)


@router.delete("/{subportfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, subportfolio_id: int) -> None:
    delete_subportfolio(session, subportfolio_id)


@router.put("/{subportfolio_id}/members", status_code=status.HTTP_204_NO_CONTENT)
def update_members(
    session: SessionDep, subportfolio_id: int, payload: MembersInDTO
) -> None:
    set_members(session, subportfolio_id, payload)
