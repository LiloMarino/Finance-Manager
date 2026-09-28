from __future__ import annotations

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.core.dto import NameInDTO
from backend.features.subportfolios.dto import MembersInDTO, SubportfolioDTO
from backend.features.subportfolios.service import (
    create_subportfolio,
    delete_subportfolio,
    list_subportfolios,
    rename_subportfolio,
    set_members,
)

router = APIRouter(prefix="/api/subportfolios", tags=["subportfolios"])


@router.get("")
def list_all(session: SessionDep) -> list[SubportfolioDTO]:
    return list_subportfolios(session)


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: NameInDTO) -> SubportfolioDTO:
    return create_subportfolio(session, payload)


@router.put("/{subportfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def rename(session: SessionDep, subportfolio_id: int, payload: NameInDTO) -> None:
    rename_subportfolio(session, subportfolio_id, payload)


@router.delete("/{subportfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, subportfolio_id: int) -> None:
    delete_subportfolio(session, subportfolio_id)


@router.put("/{subportfolio_id}/members", status_code=status.HTTP_204_NO_CONTENT)
def update_members(
    session: SessionDep, subportfolio_id: int, payload: MembersInDTO
) -> None:
    set_members(session, subportfolio_id, payload)
