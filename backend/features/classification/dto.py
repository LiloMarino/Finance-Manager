from __future__ import annotations

from backend.core.dto import BaseDTO


class SuggestionDTO(BaseDTO):
    source_sector: str | None
    source_industry: str | None
    segment_id: int | None
    sector_id: int | None
    new_sector_name: str | None
    new_segment_name: str | None


class PendingItemDTO(BaseDTO):
    asset_id: int
    ticker: str
    suggestion: SuggestionDTO | None


class PendingDTO(BaseDTO):
    """`source_unavailable` diz que a fonte parou de responder no meio: os ativos sem
    perfil em cache ficam sem sugestão até a próxima consulta."""

    items: list[PendingItemDTO]
    source_unavailable: bool


class AcceptItemDTO(BaseDTO):
    asset_id: int
    segment_id: int


class AcceptInDTO(BaseDTO):
    items: list[AcceptItemDTO]
