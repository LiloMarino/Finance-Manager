from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime
from threading import Lock

from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from backend.core.models.models import FetchLog, PriceHistory
from backend.domain.coverage import DateRange, price_gaps, price_request
from backend.domain.market_data import DailyClose, MarketDataProvider
from backend.repository.market import (
    HeldAsset,
    business_calendar,
    cached_price_ranges,
    held_assets,
    last_fetch,
)

logger = logging.getLogger(__name__)

_refresh_lock = Lock()


@dataclass(frozen=True, slots=True, kw_only=True)
class RefreshReport:
    """`failed` traz só o problema novo: a falta que passou da folga de publicação
    nesta tentativa e não tinha sido avisada na anterior."""

    updated: tuple[str, ...]
    failed: tuple[str, ...]


def _fetch(
    provider: MarketDataProvider, ticker: str, request: DateRange
) -> list[DailyClose]:
    """Falha do provider vira lista vazia: o cache fica como estava."""
    logger.info(
        "%s: consultando %s de %s a %s",
        provider.name,
        ticker,
        request.start,
        request.end,
    )
    try:
        return provider.get_history(ticker, request.start, request.end)
    except Exception:
        logger.warning("%s falhou para %s", provider.name, ticker, exc_info=True)
        return []


def refresh_prices(
    session: Session, provider: MarketDataProvider, now: datetime
) -> RefreshReport:
    """Consulta a fonte só pelos ativos a que falta um dado que já devia existir.

    Um refresh por vez: o concorrente espera o que está rodando e refaz o plano sobre
    o cache que ele deixou em dia.
    """
    with _refresh_lock:
        return _refresh_prices(session, provider, now)


def _refresh_prices(
    session: Session, provider: MarketDataProvider, now: datetime
) -> RefreshReport:
    calendar = business_calendar(session)
    ranges = cached_price_ranges(session)
    logs = {
        log.asset_id: log
        for log in session.scalars(
            select(FetchLog).where(FetchLog.asset_id.is_not(None))
        )
    }
    plan: list[tuple[HeldAsset, DateRange]] = [
        (held, request)
        for held in held_assets(session)
        if (
            request := price_request(
                held.window,
                ranges.get(held.asset_id),
                last_fetch(logs.get(held.asset_id)),
                now,
                calendar,
            )
        )
        is not None
    ]
    # A rede é consultada fora de transação: enquanto o provider responde, o SQLite
    # segue livre para as escritas das outras requisições
    session.commit()
    fetched = [(held, _fetch(provider, held.ticker, request)) for held, request in plan]

    upsert = insert(PriceHistory)
    upsert = upsert.on_conflict_do_update(
        index_elements=[PriceHistory.asset_id, PriceHistory.price_date],
        set_={"close": upsert.excluded.close},
    )
    for held, closes in fetched:
        if closes:
            session.execute(
                upsert,
                [
                    {
                        "asset_id": held.asset_id,
                        "price_date": close.price_date,
                        "close": close.close,
                    }
                    for close in closes
                ],
            )
    session.flush()

    ranges = cached_price_ranges(session)
    updated: list[str] = []
    failed: list[str] = []
    for held, closes in fetched:
        gap = bool(price_gaps(held.window, ranges.get(held.asset_id), now, calendar))
        log = logs.get(held.asset_id)
        if gap and not (log and log.gap):
            failed.append(held.ticker)
        if closes:
            updated.append(held.ticker)
        if log is None:
            session.add(
                FetchLog(
                    attempted_at=now,
                    succeeded_at=now if closes else None,
                    gap=gap,
                    asset_id=held.asset_id,
                )
            )
        else:
            log.attempted_at = now
            log.succeeded_at = now if closes else log.succeeded_at
            log.gap = gap

    session.commit()
    return RefreshReport(updated=tuple(updated), failed=tuple(failed))
