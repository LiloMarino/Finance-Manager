from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from backend.core.enum import IndexSeries
from backend.core.models.models import FixedIncomeMovement, IndexHistory
from backend.domain.index_series import DailyRate, IndexSeriesProvider
from backend.features.market.service import RefreshReport

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class LatestIndex:
    series: IndexSeries
    value: Decimal | None
    rate_date: date | None


def _fetch(
    provider: IndexSeriesProvider, series: IndexSeries, start: date, end: date
) -> list[DailyRate]:
    """Falha do provider vira lista vazia: o cache fica como estava."""
    try:
        return provider.get_series(series, start, end)
    except Exception:
        logger.warning("%s falhou para %s", provider.name, series, exc_info=True)
        return []


def refresh_indexes(
    session: Session, provider: IndexSeriesProvider, today: date
) -> RefreshReport:
    """Busca o que falta de cada série, desde o primeiro dia do mês da última data
    em cache, ou da primeira movimentação de renda fixa quando não há cache.

    Começar no dia 1 é o que traz o IPCA do mês, datado nesse dia, e regrava os
    valores recentes, que o BCB ainda pode corrigir.
    """
    first_movement = session.scalar(select(func.min(FixedIncomeMovement.movement_date)))
    last_cached = {
        series: last_date
        for series, last_date in session.execute(
            select(IndexHistory.series, func.max(IndexHistory.rate_date)).group_by(
                IndexHistory.series
            )
        ).tuples()
    }
    # A rede é consultada fora de transação, como no refresh de cotações
    session.commit()
    fetched = [
        (series, _fetch(provider, series, start.replace(day=1), today))
        for series in IndexSeries
        if (start := last_cached.get(series) or first_movement) is not None
    ]

    upsert = insert(IndexHistory)
    upsert = upsert.on_conflict_do_update(
        index_elements=[IndexHistory.series, IndexHistory.rate_date],
        set_={"value": upsert.excluded.value},
    )

    updated: list[str] = []
    failed: list[str] = []
    for series, rates in fetched:
        if not rates:
            failed.append(series.upper())
            continue
        session.execute(
            upsert,
            [
                {"series": series, "rate_date": rate.rate_date, "value": rate.value}
                for rate in rates
            ],
        )
        updated.append(series.upper())

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
