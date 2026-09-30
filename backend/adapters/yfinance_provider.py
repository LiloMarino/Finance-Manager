from __future__ import annotations

from collections.abc import Iterable
from datetime import date, datetime, timedelta

import pandas as pd
import yfinance as yf

from backend.domain.classification import CompanyProfile, ProfileUnavailableError
from backend.domain.market_data import DailyClose, to_cents
from backend.domain.ticker_search import QuoteHit, TickerSearchUnavailableError


class YFinanceProvider:
    name = "yfinance"

    def get_history(self, ticker: str, start: date, end: date) -> list[DailyClose]:
        # O `end` do yfinance é exclusivo, e o ticker da B3 leva o sufixo `.SA`; o
        # símbolo de índice (`^BVSP`) vai como está. `auto_adjust=False` deixa o
        # `Close` ajustado só por desdobramento.
        symbol = ticker if ticker.startswith("^") else f"{ticker}.SA"
        frame = yf.Ticker(symbol).history(
            start=start,
            end=end + timedelta(days=1),
            auto_adjust=False,
            actions=False,
        )
        # Ticker desconhecido volta vazio, sem exceção
        if frame.empty:
            return []
        close = frame["Close"]
        if not isinstance(close, pd.Series):
            raise TypeError(f"yfinance devolveu mais de uma coluna Close para {ticker}")
        close = close.dropna()
        index = close.index
        if not isinstance(index, pd.DatetimeIndex):
            raise TypeError(f"yfinance devolveu índice sem data para {ticker}")
        return to_daily_closes(zip(index, close.to_list(), strict=True))


class YFinanceTickerSearch:
    def search(self, query: str) -> list[QuoteHit]:
        # A busca é a da caixa do site do Yahoo, de todas as bolsas; o filtro da B3
        # é do domínio
        try:
            quotes = yf.Search(
                query, max_results=20, news_count=0, lists_count=0
            ).quotes
        except Exception as error:
            raise TickerSearchUnavailableError(
                "A busca de tickers do yfinance não respondeu."
            ) from error
        return [
            QuoteHit(
                symbol=str(quote.get("symbol", "")),
                exchange=str(quote.get("exchange", "")),
                name=str(quote.get("shortname") or quote.get("longname") or ""),
            )
            for quote in quotes
        ]


class YFinanceProfileProvider:
    def profile(self, ticker: str) -> CompanyProfile | None:
        # Ticker que a fonte não conhece volta num dicionário sem `quoteType`
        try:
            info = yf.Ticker(f"{ticker}.SA").info
        except Exception as error:
            raise ProfileUnavailableError(
                "O perfil do yfinance não respondeu."
            ) from error
        if not info.get("quoteType"):
            return None
        return CompanyProfile(
            sector=_text(info.get("sector")), industry=_text(info.get("industry"))
        )


def _text(value: object) -> str | None:
    return (value.strip() or None) if isinstance(value, str) else None


def to_daily_closes(rows: Iterable[tuple[datetime, float]]) -> list[DailyClose]:
    """O índice do yfinance vem no fuso da B3, então `.date()` é o dia do pregão."""
    return [
        DailyClose(price_date=moment.date(), close=to_cents(close))
        for moment, close in rows
    ]
