from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from threading import Lock

from sqlalchemy import func, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from backend.core.enum import IndexSeries
from backend.core.models.models import FetchLog, IndexHistory
from backend.domain.coverage import DateRange, index_overdue, index_request
from backend.domain.index_series import DailyRate, IndexSeriesProvider
from backend.domain.market_data import MarketDataProvider
from backend.features.market.service import RefreshReport
from backend.repository.market import (
    business_calendar,
    last_cached_indexes,
    last_fetch,
)

logger = logging.getLogger(__name__)

_refresh_lock = Lock()

IBOV_TICKER = "^BVSP"
# O primeiro pregão do IBOV no yfinance
IBOV_FIRST_DATE = date(1993, 4, 27)


@dataclass(frozen=True, slots=True, kw_only=True)
class LatestIndex:
    series: IndexSeries
    value: Decimal | None
    rate_date: date | None


def _first_date(provider: IndexSeriesProvider, series: IndexSeries) -> date:
    return (
        IBOV_FIRST_DATE if series is IndexSeries.IBOV else provider.first_date(series)
    )


def _fetch(
    provider: IndexSeriesProvider,
    market: MarketDataProvider,
    series: IndexSeries,
    request: DateRange,
) -> list[DailyRate]:
    """O IBOV vem do provider de cotações, e as séries do BCB, do de séries. Falha
    do provider vira lista vazia: o cache fica como estava."""
    name = market.name if series is IndexSeries.IBOV else provider.name
    logger.info(
        "%s: consultando %s de %s a %s", name, series, request.start, request.end
    )
    try:
        if series is IndexSeries.IBOV:
            return [
                DailyRate(rate_date=close.price_date, value=close.close)
                for close in market.get_history(IBOV_TICKER, request.start, request.end)
            ]
        return provider.get_series(series, request.start, request.end)
    except Exception:
        logger.warning("%s falhou para %s", name, series, exc_info=True)
        return []


def refresh_indexes(
    session: Session,
    provider: IndexSeriesProvider,
    market: MarketDataProvider,
    now: datetime,
) -> RefreshReport:
    """Consulta a fonte só pelas séries a que falta a última publicação esperada.

    As séries ficam inteiras no cache, desde o início de cada uma, com ou sem renda
    fixa cadastrada: servem a marcação, as referências da rentabilidade e as
    ferramentas. Um refresh por vez, como o de cotações.
    """
    with _refresh_lock:
        return _refresh_indexes(session, provider, market, now)


def _refresh_indexes(
    session: Session,
    provider: IndexSeriesProvider,
    market: MarketDataProvider,
    now: datetime,
) -> RefreshReport:
    today = now.date()
    calendar = business_calendar(session)
    last_cached = last_cached_indexes(session)
    logs = {
        log.series: log
        for log in session.scalars(select(FetchLog).where(FetchLog.series.is_not(None)))
    }
    plan = [
        (series, request)
        for series in IndexSeries
        if (
            request := index_request(
                series,
                last_cached.get(series),
                _first_date(provider, series),
                last_fetch(logs.get(series)),
                now,
                calendar,
            )
        )
        is not None
    ]
    # A rede é consultada fora de transação, como no refresh de cotações
    session.commit()
    fetched = [
        (series, _fetch(provider, market, series, request)) for series, request in plan
    ]

    upsert = insert(IndexHistory)
    upsert = upsert.on_conflict_do_update(
        index_elements=[IndexHistory.series, IndexHistory.rate_date],
        set_={"value": upsert.excluded.value},
    )
    for series, rates in fetched:
        if rates:
            session.execute(
                upsert,
                [
                    {"series": series, "rate_date": rate.rate_date, "value": rate.value}
                    for rate in rates
                ],
            )
    session.flush()

    last_cached = last_cached_indexes(session)
    updated: list[str] = []
    failed: list[str] = []
    for series, rates in fetched:
        gap = index_overdue(series, last_cached.get(series), today, calendar)
        log = logs.get(series)
        if gap and not (log and log.gap):
            failed.append(series.upper())
        if rates:
            updated.append(series.upper())
        if log is None:
            session.add(
                FetchLog(
                    attempted_at=now,
                    succeeded_at=now if rates else None,
                    gap=gap,
                    series=series,
                )
            )
        else:
            log.attempted_at = now
            log.succeeded_at = now if rates else log.succeeded_at
            log.gap = gap

    session.commit()
    return RefreshReport(updated=tuple(updated), failed=tuple(failed))


def latest_indexes(session: Session) -> list[LatestIndex]:
    """Último valor em cache de cada série, com a data dele."""
    latest = (
        select(IndexHistory.series, func.max(IndexHistory.rate_date).label("rate_date"))
        .group_by(IndexHistory.series)
        .subquery()
    )
    cached = {
        series: (value, rate_date)
        for series, value, rate_date in session.execute(
            select(
                IndexHistory.series, IndexHistory.value, IndexHistory.rate_date
            ).join(
                latest,
                (latest.c.series == IndexHistory.series)
                & (latest.c.rate_date == IndexHistory.rate_date),
            )
        ).tuples()
    }
    return [
        LatestIndex(
            series=series,
            value=cached[series][0] if series in cached else None,
            rate_date=cached[series][1] if series in cached else None,
        )
        for series in IndexSeries
    ]
