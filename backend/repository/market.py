from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, IndexSeries
from backend.core.models.models import (
    Asset,
    FetchLog,
    IndexHistory,
    Operation,
    PriceHistory,
)
from backend.domain.business_days import BusinessCalendar
from backend.domain.coverage import CachedRange, LastFetch
from backend.domain.index_series import DailyRate
from backend.domain.position import HoldingWindow, holding_windows
from backend.repository.operations import operation_records


@dataclass(frozen=True, slots=True, kw_only=True)
class AssetPrice:
    asset_id: int
    ticker: str
    asset_class: AssetClass
    close: Decimal | None
    price_date: date | None


def latest_prices(session: Session) -> list[AssetPrice]:
    """Último fechamento em cache de cada ativo com operação: é o preço
    atual, online ou não, e vem sempre com a data dele."""
    latest = (
        select(
            PriceHistory.asset_id,
            func.max(PriceHistory.price_date).label("price_date"),
        )
        .group_by(PriceHistory.asset_id)
        .subquery()
    )
    rows = session.execute(
        select(
            Asset.id,
            Asset.ticker,
            Asset.asset_class,
            PriceHistory.close,
            PriceHistory.price_date,
        )
        .outerjoin(latest, latest.c.asset_id == Asset.id)
        .outerjoin(
            PriceHistory,
            (PriceHistory.asset_id == latest.c.asset_id)
            & (PriceHistory.price_date == latest.c.price_date),
        )
        .where(Asset.id.in_(select(Operation.asset_id)))
        .order_by(Asset.ticker)
    ).all()
    return [
        AssetPrice(
            asset_id=asset_id,
            ticker=ticker,
            asset_class=asset_class,
            close=close,
            price_date=price_date,
        )
        for asset_id, ticker, asset_class, close, price_date in rows
    ]


def index_rates(session: Session) -> dict[IndexSeries, list[DailyRate]]:
    """Todo o cache das séries, por série e em ordem de data."""
    rates: dict[IndexSeries, list[DailyRate]] = {series: [] for series in IndexSeries}
    for series, rate_date, value in session.execute(
        select(
            IndexHistory.series, IndexHistory.rate_date, IndexHistory.value
        ).order_by(IndexHistory.rate_date)
    ).tuples():
        rates[series].append(DailyRate(rate_date=rate_date, value=value))
    return rates


@dataclass(frozen=True, slots=True, kw_only=True)
class HeldAsset:
    """Um ativo com operação e a janela em que ele precisa de cotação."""

    asset_id: int
    ticker: str
    window: HoldingWindow


def held_assets(session: Session) -> list[HeldAsset]:
    windows = holding_windows(operation_records(session))
    return [
        HeldAsset(asset_id=asset_id, ticker=ticker, window=windows[ticker])
        for asset_id, ticker in session.execute(
            select(Asset.id, Asset.ticker)
            .where(Asset.ticker.in_(windows))
            .order_by(Asset.ticker)
        ).tuples()
    ]


def business_calendar(session: Session) -> BusinessCalendar:
    return BusinessCalendar(
        [
            DailyRate(rate_date=rate_date, value=value)
            for rate_date, value in session.execute(
                select(IndexHistory.rate_date, IndexHistory.value)
                .where(IndexHistory.series == IndexSeries.CDI)
                .order_by(IndexHistory.rate_date)
            ).tuples()
        ]
    )


def cached_price_ranges(session: Session) -> dict[int, CachedRange]:
    """O primeiro e o último fechamento em cache de cada ativo."""
    return {
        asset_id: CachedRange(first=first, last=last)
        for asset_id, first, last in session.execute(
            select(
                PriceHistory.asset_id,
                func.min(PriceHistory.price_date),
                func.max(PriceHistory.price_date),
            ).group_by(PriceHistory.asset_id)
        ).tuples()
    }


def last_cached_indexes(session: Session) -> dict[IndexSeries, date]:
    return {
        series: last_date
        for series, last_date in session.execute(
            select(IndexHistory.series, func.max(IndexHistory.rate_date)).group_by(
                IndexHistory.series
            )
        ).tuples()
    }


def last_fetch(log: FetchLog | None) -> LastFetch | None:
    if log is None:
        return None
    return LastFetch(
        attempted_at=log.attempted_at, succeeded_at=log.succeeded_at, gap=log.gap
    )
