from __future__ import annotations

from collections import defaultdict

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import Asset, Sector, Segment
from backend.features.sectors.dto import NameInDTO, SectorDTO, SegmentDTO


class SectorNotFoundError(FinanceError):
    status = 404


class SectorConflictError(FinanceError):
    status = 409


def _sector(session: Session, sector_id: int) -> Sector:
    sector = session.get(Sector, sector_id)
    if sector is None:
        raise SectorNotFoundError("Setor não encontrado.")
    return sector


def _segment(session: Session, segment_id: int) -> Segment:
    segment = session.get(Segment, segment_id)
    if segment is None:
        raise SectorNotFoundError("Segmento não encontrado.")
    return segment


def _ensure_unique_sector(
    session: Session, name: str, sector_id: int | None = None
) -> None:
    clash = session.scalar(select(Sector.id).where(Sector.name == name))
    if clash is not None and clash != sector_id:
        raise SectorConflictError(f"Já existe o setor {name}.")


def _ensure_unique_segment(
    session: Session, sector_id: int, name: str, segment_id: int | None = None
) -> None:
    clash = session.scalar(
        select(Segment.id).where(Segment.sector_id == sector_id, Segment.name == name)
    )
    if clash is not None and clash != segment_id:
        raise SectorConflictError(f"O setor já tem o segmento {name}.")


def list_sectors(session: Session) -> list[SectorDTO]:
    """Os setores em ordem de nome, cada um com os segmentos e quantos ativos há em
    cada segmento."""
    counts = {
        segment_id: count
        for segment_id, count in session.execute(
            select(Asset.segment_id, func.count())
            .where(Asset.segment_id.is_not(None))
            .group_by(Asset.segment_id)
        ).tuples()
    }
    by_sector: defaultdict[int, list[SegmentDTO]] = defaultdict(list)
    for segment in session.scalars(select(Segment).order_by(Segment.name)):
        by_sector[segment.sector_id].append(
            SegmentDTO(
                id=segment.id,
                sector_id=segment.sector_id,
                name=segment.name,
                asset_count=counts.get(segment.id, 0),
            )
        )
    return [
        SectorDTO(id=sector.id, name=sector.name, segments=by_sector[sector.id])
        for sector in session.scalars(select(Sector).order_by(Sector.name))
    ]


def create_sector(session: Session, payload: NameInDTO) -> SectorDTO:
    _ensure_unique_sector(session, payload.name)
    sector = Sector(name=payload.name)
    session.add(sector)
    session.commit()
    return SectorDTO(id=sector.id, name=sector.name, segments=[])


def rename_sector(session: Session, sector_id: int, payload: NameInDTO) -> None:
    sector = _sector(session, sector_id)
    _ensure_unique_sector(session, payload.name, sector_id)
    sector.name = payload.name
    session.commit()


def delete_sector(session: Session, sector_id: int) -> None:
    """Setor com segmento fica: a FK é RESTRICT, e a mensagem diz o porquê."""
    sector = _sector(session, sector_id)
    if session.scalar(select(exists().where(Segment.sector_id == sector_id))):
        raise SectorConflictError(
            f"{sector.name} tem segmentos: apague-os antes do setor."
        )
    session.delete(sector)
    session.commit()


def create_segment(session: Session, sector_id: int, payload: NameInDTO) -> SegmentDTO:
    _sector(session, sector_id)
    _ensure_unique_segment(session, sector_id, payload.name)
    segment = Segment(sector_id=sector_id, name=payload.name)
    session.add(segment)
    session.commit()
    return SegmentDTO(
        id=segment.id, sector_id=sector_id, name=segment.name, asset_count=0
    )


def rename_segment(session: Session, segment_id: int, payload: NameInDTO) -> None:
    segment = _segment(session, segment_id)
    _ensure_unique_segment(session, segment.sector_id, payload.name, segment_id)
    segment.name = payload.name
    session.commit()


def delete_segment(session: Session, segment_id: int) -> None:
    """Segmento com ativo fica: a FK é RESTRICT, e a mensagem diz o porquê."""
    segment = _segment(session, segment_id)
    if session.scalar(select(exists().where(Asset.segment_id == segment_id))):
        raise SectorConflictError(
            f"{segment.name} tem ativos: reclassifique-os antes de apagar o segmento."
        )
    session.delete(segment)
    session.commit()
