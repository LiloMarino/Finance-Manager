from __future__ import annotations

from collections import defaultdict
from collections.abc import Collection
from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import Asset, AssetTickerHistory


class TickerTakenError(FinanceError):
    status = 409


@dataclass(frozen=True, slots=True, kw_only=True)
class PreviousTicker:
    ticker: str
    valid_until: date


class TickerHistory:
    """Os tickers antigos de cada ativo. Operações, fiscal e IRPF mostram o ticker
    vigente na data; o resto do app, o atual."""

    def __init__(self, previous: dict[int, list[PreviousTicker]]) -> None:
        self._previous = {
            asset_id: sorted(entries, key=lambda entry: entry.valid_until)
            for asset_id, entries in previous.items()
        }

    def on(self, asset_id: int, day: date, current: str) -> str:
        for entry in self._previous.get(asset_id, []):
            if day <= entry.valid_until:
                return entry.ticker
        return current

    def previous(self, asset_id: int) -> list[PreviousTicker]:
        return self._previous.get(asset_id, [])


def ticker_history(session: Session) -> TickerHistory:
    previous: defaultdict[int, list[PreviousTicker]] = defaultdict(list)
    for entry in session.scalars(select(AssetTickerHistory)):
        previous[entry.asset_id].append(
            PreviousTicker(ticker=entry.ticker, valid_until=entry.valid_until)
        )
    return TickerHistory(previous)


def resolve_tickers(session: Session, tickers: Collection[str]) -> dict[str, str]:
    """O ticker atual do ativo de cada um dos `tickers`, antigo ou atual. O ticker
    que não é de ativo nenhum fica de fora."""
    current = {
        ticker: ticker
        for ticker in session.scalars(
            select(Asset.ticker).where(Asset.ticker.in_(tickers))
        )
    }
    previous = {
        old: new
        for old, new in session.execute(
            select(AssetTickerHistory.ticker, Asset.ticker)
            .join(Asset, Asset.id == AssetTickerHistory.asset_id)
            .where(AssetTickerHistory.ticker.in_(tickers))
        ).tuples()
    }
    return current | previous


def ensure_ticker_free(session: Session, ticker: str, asset_id: int | None) -> None:
    """Nenhum ticker, antigo ou atual, é de dois ativos. `asset_id` é o ativo que
    vai usar o ticker, e o ticker atual dele não conta como conflito."""
    clash = session.scalar(select(Asset.id).where(Asset.ticker == ticker))
    if clash is not None and clash != asset_id:
        raise TickerTakenError(f"Já existe um ativo {ticker}.")
    owner = session.scalar(
        select(Asset.ticker)
        .join(AssetTickerHistory, AssetTickerHistory.asset_id == Asset.id)
        .where(AssetTickerHistory.ticker == ticker)
    )
    if owner is not None:
        raise TickerTakenError(f"{ticker} é um ticker antigo de {owner}.")
