from __future__ import annotations

from collections.abc import Iterable
from datetime import date, datetime, timedelta

import pandas as pd
import yfinance as yf

from backend.domain.market_data import DailyClose, to_cents


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


def to_daily_closes(rows: Iterable[tuple[datetime, float]]) -> list[DailyClose]:
    """O índice do yfinance vem no fuso da B3, então `.date()` é o dia do pregão."""
    return [
        DailyClose(price_date=moment.date(), close=to_cents(close))
        for moment, close in rows
    ]
