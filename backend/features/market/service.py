from __future__ import annotations

import logging
from collections import defaultdict
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime
from threading import Lock

from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from backend.core.models.models import FetchLog, PriceHistory
from backend.domain.coverage import (
    DateRange,
    archive_months,
    archive_request,
    price_gaps,
    price_request,
)
from backend.domain.daily_series import current_base
from backend.domain.market_data import DailyClose, HistoryArchive, MarketDataProvider
from backend.repository.market import (
    HeldAsset,
    business_calendar,
    cached_price_ranges,
    held_assets,
    last_fetch,
)
from backend.repository.operations import operation_records
from backend.repository.tickers import TickerHistory, ticker_history

logger = logging.getLogger(__name__)

_refresh_lock = Lock()


@dataclass(frozen=True, slots=True, kw_only=True)
class RefreshReport:
    """`failed` traz só o problema novo: a falta que passou da folga de publicação
    nesta tentativa e não tinha sido avisada na anterior."""

    updated: tuple[str, ...]
    failed: tuple[str, ...]


@dataclass(frozen=True, slots=True, kw_only=True)
class _ArchiveRequest:
    """`tickers` são todos os que o ativo já teve: o arquivo traz o vigente no dia."""

    held: HeldAsset
    request: DateRange
    tickers: frozenset[str]


ArchiveMonths = dict[tuple[int, int], dict[str, list[DailyClose]]]


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


def _fetch_archive(
    archive: HistoryArchive, requests: Sequence[_ArchiveRequest]
) -> tuple[ArchiveMonths, set[int]]:
    """Um download por mês, com os tickers de todos os ativos que precisam dele. O
    ativo fica procurado quando todos os meses dele vieram."""
    wanted: defaultdict[tuple[int, int], set[str]] = defaultdict(set)
    for found in requests:
        for month in archive_months(found.request):
            wanted[month] |= found.tickers
    months: ArchiveMonths = {}
    for (year, month), tickers in sorted(wanted.items()):
        logger.info(
            "%s: consultando %02d/%d para %s",
            archive.name,
            month,
            year,
            ", ".join(sorted(tickers)),
        )
        try:
            months[(year, month)] = archive.get_month(year, month, tickers)
        except Exception:
            logger.warning(
                "%s falhou para %02d/%d", archive.name, month, year, exc_info=True
            )
    checked = {
        found.held.asset_id
        for found in requests
        if all(month in months for month in archive_months(found.request))
    }
    return months, checked


def _archived_closes(
    found: _ArchiveRequest, months: ArchiveMonths, history: TickerHistory
) -> list[DailyClose]:
    """Os fechamentos do pedido, cada um do ticker que o ativo tinha no dia."""
    held = found.held
    return [
        close
        for month in archive_months(found.request)
        for ticker, closes in months.get(month, {}).items()
        for close in closes
        if found.request.start <= close.price_date <= found.request.end
        and history.on(held.asset_id, close.price_date, held.ticker) == ticker
    ]


def _upsert(session: Session, asset_id: int, closes: Sequence[DailyClose]) -> None:
    if not closes:
        return
    upsert = insert(PriceHistory)
    upsert = upsert.on_conflict_do_update(
        index_elements=[PriceHistory.asset_id, PriceHistory.price_date],
        set_={"close": upsert.excluded.close},
    )
    session.execute(
        upsert,
        [
            {"asset_id": asset_id, "price_date": close.price_date, "close": close.close}
            for close in closes
        ],
    )


def refresh_prices(
    session: Session,
    provider: MarketDataProvider,
    archive: HistoryArchive,
    now: datetime,
) -> RefreshReport:
    """Consulta a fonte só pelos ativos a que falta um dado que já devia existir, e
    a série histórica da B3 pelo começo da janela que a fonte não tem.

    Um refresh por vez: o concorrente espera o que está rodando e refaz o plano sobre
    o cache que ele deixou em dia.
    """
    with _refresh_lock:
        return _refresh_prices(session, provider, archive, now)


def _refresh_prices(
    session: Session,
    provider: MarketDataProvider,
    archive: HistoryArchive,
    now: datetime,
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
    for held, closes in fetched:
        _upsert(session, held.asset_id, closes)
    session.flush()

    # O arquivo da B3 vem depois da fonte, sobre o começo que ela deixou sem cotação
    ranges = cached_price_ranges(session)
    history = ticker_history(session)
    requests: list[_ArchiveRequest] = []
    for held, _ in plan:
        log = logs.get(held.asset_id)
        request = archive_request(
            held.window,
            ranges.get(held.asset_id),
            log.archive_checked_from if log else None,
            now,
            calendar,
        )
        if request is not None:
            previous = [entry.ticker for entry in history.previous(held.asset_id)]
            requests.append(
                _ArchiveRequest(
                    held=held,
                    request=request,
                    tickers=frozenset([held.ticker, *previous]),
                )
            )
    archived: set[int] = set()
    checked: set[int] = set()
    if requests:
        records = operation_records(session)
        session.commit()
        months, checked = _fetch_archive(archive, requests)
        for found in requests:
            held = found.held
            closes = current_base(
                [record for record in records if record.ticker == held.ticker],
                _archived_closes(found, months, history),
            )
            if closes:
                archived.add(held.asset_id)
            _upsert(session, held.asset_id, closes)
        session.flush()

    ranges = cached_price_ranges(session)
    updated: list[str] = []
    failed: list[str] = []
    for held, closes in fetched:
        gap = bool(price_gaps(held.window, ranges.get(held.asset_id), now, calendar))
        log = logs.get(held.asset_id)
        if gap and not (log and log.gap):
            failed.append(held.ticker)
        if closes or held.asset_id in archived:
            updated.append(held.ticker)
        if log is None:
            log = FetchLog(
                attempted_at=now,
                succeeded_at=now if closes else None,
                gap=gap,
                asset_id=held.asset_id,
            )
            session.add(log)
        else:
            log.attempted_at = now
            log.succeeded_at = now if closes else log.succeeded_at
            log.gap = gap
        if held.asset_id in checked:
            log.archive_checked_from = held.window.start

    session.commit()
    return RefreshReport(updated=tuple(updated), failed=tuple(failed))
