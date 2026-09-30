"""A sugestão de setor e segmento: o perfil de cada ticker vem da fonte uma vez e fica
em `ticker_profiles`; a sugestão é derivada dele e dos ativos já classificados a cada
consulta."""

from __future__ import annotations

import logging
from collections.abc import Iterable
from datetime import datetime
from threading import Lock

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import Asset, Sector, Segment, TickerProfile
from backend.domain.classification import (
    ClassifiedPeer,
    CompanyProfile,
    ProfileProvider,
    ProfileUnavailableError,
    suggest,
)
from backend.features.classification.dto import (
    AcceptInDTO,
    PendingDTO,
    PendingItemDTO,
    SuggestionDTO,
)
from backend.repository.sectors import unclassified_held_assets

logger = logging.getLogger(__name__)

_fetch_lock = Lock()


class ClassificationNotFoundError(FinanceError):
    status = 404


def _cached_profiles(session: Session) -> dict[str, CompanyProfile]:
    return {
        row.ticker: CompanyProfile(sector=row.sector, industry=row.industry)
        for row in session.scalars(select(TickerProfile))
    }


def _ensure_profiles(
    session: Session, provider: ProfileProvider, tickers: Iterable[str], now: datetime
) -> bool:
    """Consulta a fonte pelos tickers sem perfil em cache, na ordem dada; falso quando
    ela parou de responder. A primeira falha encerra a rodada: com a fonte fora, as
    consultas seguintes só somariam espera."""
    with _fetch_lock:
        cached = _cached_profiles(session)
        missing = [ticker for ticker in dict.fromkeys(tickers) if ticker not in cached]
        if not missing:
            return True
        # A rede é consultada fora de transação, como no refresh de cotações
        session.commit()
        answered = True
        for ticker in missing:
            logger.info("perfil: consultando %s", ticker)
            try:
                profile = provider.profile(ticker)
            except ProfileUnavailableError:
                logger.warning("perfil de %s falhou", ticker, exc_info=True)
                answered = False
                break
            if profile is not None:
                session.add(
                    TickerProfile(
                        ticker=ticker,
                        sector=profile.sector,
                        industry=profile.industry,
                        fetched_at=now,
                    )
                )
        session.commit()
        return answered


def _classified(session: Session) -> list[tuple[str, int, int]]:
    """Ticker, segmento e setor de cada ativo classificado."""
    return list(
        session.execute(
            select(Asset.ticker, Segment.id, Segment.sector_id).join(
                Segment, Segment.id == Asset.segment_id
            )
        ).tuples()
    )


def _peers(
    classified: list[tuple[str, int, int]], profiles: dict[str, CompanyProfile]
) -> list[ClassifiedPeer]:
    return [
        ClassifiedPeer(
            profile=profiles[ticker], segment_id=segment_id, sector_id=sector_id
        )
        for ticker, segment_id, sector_id in classified
        if ticker in profiles
    ]


def _sectors(session: Session) -> dict[str, int]:
    return {
        name: sector_id
        for sector_id, name in session.execute(select(Sector.id, Sector.name)).tuples()
    }


def _suggestion_dto(
    profile: CompanyProfile | None,
    peers: list[ClassifiedPeer],
    sectors: dict[str, int],
) -> SuggestionDTO | None:
    found = suggest(profile, peers, sectors) if profile else None
    return SuggestionDTO.model_validate(found) if found else None


def suggestion_for(
    session: Session, provider: ProfileProvider, ticker: str, now: datetime
) -> SuggestionDTO | None:
    """A sugestão para um ticker, cadastrado ou não. Nula quando a fonte não conhece o
    ticker ou não classifica o ativo, como no ETF."""
    ticker = ticker.strip().upper()
    classified = _classified(session)
    answered = _ensure_profiles(
        session, provider, [ticker, *(item[0] for item in classified)], now
    )
    profiles = _cached_profiles(session)
    profile = profiles.get(ticker)
    if profile is None and not answered:
        raise ProfileUnavailableError(
            f"A fonte não respondeu, e {ticker} não tem perfil em cache."
        )
    return _suggestion_dto(profile, _peers(classified, profiles), _sectors(session))


def pending(session: Session, provider: ProfileProvider, now: datetime) -> PendingDTO:
    """A sugestão de cada ativo em carteira sem segmento, os do painel de saúde."""
    assets = unclassified_held_assets(session)
    classified = _classified(session)
    answered = _ensure_profiles(
        session,
        provider,
        [*(asset.ticker for asset in assets), *(item[0] for item in classified)],
        now,
    )
    profiles = _cached_profiles(session)
    peers = _peers(classified, profiles)
    sectors = _sectors(session)
    return PendingDTO(
        items=[
            PendingItemDTO(
                asset_id=asset.id,
                ticker=asset.ticker,
                suggestion=_suggestion_dto(profiles.get(asset.ticker), peers, sectors),
            )
            for asset in assets
        ],
        source_unavailable=not answered,
    )


def accept(session: Session, payload: AcceptInDTO) -> None:
    """Grava o segmento de cada ativo, tudo ou nada."""
    for item in payload.items:
        asset = session.get(Asset, item.asset_id)
        if asset is None:
            raise ClassificationNotFoundError("Ativo não encontrado.")
        if session.get(Segment, item.segment_id) is None:
            raise ClassificationNotFoundError("Segmento não encontrado.")
        asset.segment_id = item.segment_id
    session.commit()
