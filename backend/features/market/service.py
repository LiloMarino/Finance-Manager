from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from backend.core.models.models import Asset, Operation, PriceHistory
from backend.domain.market_data import DailyClose, MarketDataProvider

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class RefreshReport:
    updated: tuple[str, ...]
    failed: tuple[str, ...]


def _fetch(
    provider: MarketDataProvider, ticker: str, start: date, end: date
) -> list[DailyClose]:
    """Falha do provider vira lista vazia: o cache fica como estava."""
    try:
        return provider.get_history(ticker, start, end)
    except Exception:
        logger.warning("%s falhou para %s", provider.name, ticker, exc_info=True)
        return []


def refresh_prices(
    session: Session, provider: MarketDataProvider, today: date
) -> RefreshReport:
    """Busca só os dias que faltam no cache de cada ativo com operação.

    O início é a última data em cache, inclusive: o fechamento parcial de um pregão
    em andamento é regravado no refresh seguinte. Sem cache, parte da primeira
    operação.
    """
    last_cached = (
        select(
            PriceHistory.asset_id,
            func.max(PriceHistory.price_date).label("last_date"),
        )
        .group_by(PriceHistory.asset_id)
        .subquery()
    )
    plan = session.execute(
        select(
            Asset.id,
            Asset.ticker,
            func.min(Operation.operation_date),
            last_cached.c.last_date,
        )
        .join(Operation, Operation.asset_id == Asset.id)
        .outerjoin(last_cached, last_cached.c.asset_id == Asset.id)
        .group_by(Asset.id, Asset.ticker, last_cached.c.last_date)
        .order_by(Asset.ticker)
    ).all()
    # A rede é consultada fora de transação: enquanto o provider responde, o SQLite
    # segue livre para as escritas das outras requisições
    session.commit()
    fetched = [
        (
            asset_id,
            ticker,
            _fetch(provider, ticker, last_date or first_operation, today),
        )
        for asset_id, ticker, first_operation, last_date in plan
    ]

    upsert = insert(PriceHistory)
    upsert = upsert.on_conflict_do_update(
        index_elements=[PriceHistory.asset_id, PriceHistory.price_date],
        set_={"close": upsert.excluded.close},
    )

    updated: list[str] = []
    failed: list[str] = []
    for asset_id, ticker, closes in fetched:
        if not closes:
            failed.append(ticker)
            continue
        session.execute(
            upsert,
            [
                {"asset_id": asset_id, "price_date": c.price_date, "close": c.close}
                for c in closes
            ],
        )
        updated.append(ticker)

    session.commit()
    return RefreshReport(updated=tuple(updated), failed=tuple(failed))
