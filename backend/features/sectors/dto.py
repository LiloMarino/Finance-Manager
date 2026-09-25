from __future__ import annotations

from pydantic import field_validator

from backend.core.dto import BaseDTO


class NameInDTO(BaseDTO):
    """O nome de um setor ou de um segmento."""

    name: str

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Informe o nome.")
        return name


class SegmentDTO(BaseDTO):
    id: int
    sector_id: int
    name: str
    asset_count: int


class SectorDTO(BaseDTO):
    id: int
    name: str
    segments: list[SegmentDTO]
