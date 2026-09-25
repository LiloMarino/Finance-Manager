from __future__ import annotations

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.sectors.dto import NameInDTO, SectorDTO, SegmentDTO
from backend.features.sectors.service import (
    create_sector,
    create_segment,
    delete_sector,
    delete_segment,
    list_sectors,
    rename_sector,
    rename_segment,
)

router = APIRouter(prefix="/api/sectors", tags=["sectors"])


@router.get("")
def list_all(session: SessionDep) -> list[SectorDTO]:
    return list_sectors(session)


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: NameInDTO) -> SectorDTO:
    return create_sector(session, payload)


@router.put("/{sector_id}", status_code=status.HTTP_204_NO_CONTENT)
def rename(session: SessionDep, sector_id: int, payload: NameInDTO) -> None:
    rename_sector(session, sector_id, payload)


@router.delete("/{sector_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, sector_id: int) -> None:
    delete_sector(session, sector_id)


@router.post("/{sector_id}/segments", status_code=status.HTTP_201_CREATED)
def add_segment(session: SessionDep, sector_id: int, payload: NameInDTO) -> SegmentDTO:
    return create_segment(session, sector_id, payload)


@router.put("/segments/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def rename_one_segment(
    session: SessionDep, segment_id: int, payload: NameInDTO
) -> None:
    rename_segment(session, segment_id, payload)


@router.delete("/segments/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_segment(session: SessionDep, segment_id: int) -> None:
    delete_segment(session, segment_id)
