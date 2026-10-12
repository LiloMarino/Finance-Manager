from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.models.models import Asset, Sector, Segment
from backend.repository.market import held_assets


@dataclass(frozen=True, slots=True, kw_only=True)
class Classification:
    sector: str
    segment: str


def held_asset_ids(session: Session) -> set[int]:
    """Os ativos com posição aberta hoje."""
    return {item.asset_id for item in held_assets(session) if item.window.end is None}


def unclassified_assets(session: Session) -> list[Asset]:
    """Os ativos sem segmento, em carteira ou não, em ordem de ticker."""
    return list(
        session.scalars(
            select(Asset).where(Asset.segment_id.is_(None)).order_by(Asset.ticker)
        )
    )


def unclassified_held_assets(session: Session) -> list[Asset]:
    """Os ativos em carteira sem segmento: são os que entram em "Sem classificação"
    na distribuição por setor."""
    held = held_asset_ids(session)
    return [asset for asset in unclassified_assets(session) if asset.id in held]


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
