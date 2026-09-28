from __future__ import annotations

from backend.core.dto import BaseDTO


class SegmentDTO(BaseDTO):
    id: int
    sector_id: int
    name: str
    asset_count: int


class SectorDTO(BaseDTO):
    id: int
    name: str
    segments: list[SegmentDTO]
