from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.models.models import Sector, Segment


@dataclass(frozen=True, slots=True, kw_only=True)
class Classification:
    sector: str
    segment: str


def classifications(session: Session) -> dict[int, Classification]:
    """Setor e segmento de cada `segment_id`."""
    return {
        segment_id: Classification(sector=sector, segment=segment)
        for segment_id, segment, sector in session.execute(
            select(Segment.id, Segment.name, Sector.name).join(
                Sector, Sector.id == Segment.sector_id
            )
        ).tuples()
    }
