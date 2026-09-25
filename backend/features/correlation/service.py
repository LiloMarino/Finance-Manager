"""A correlação entre tickers e referências: de um par, ou de todos os pares de uma lista.

O histórico de um ticker vem do cache próprio das ferramentas, `ticker_price_history`,
que serve a qualquer ticker, na carteira ou não. Ele segue a mesma regra do cache de
cotações: a fonte só é consultada quando falta um fechamento que já devia existir, e
no máximo uma vez por intervalo.
"""

from __future__ import annotations

import calendar
import logging
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime
from threading import Lock

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from backend.core.enum import CorrelationWindow, IndexSeries
from backend.core.errors import FinanceError
from backend.core.models.models import FetchLog, TickerPriceHistory
from backend.domain.correlation import (
    Correlation,
    CorrelationError,
    MatrixCell,
    correlate,
    correlation_matrix,
)
from backend.domain.coverage import CachedRange, price_gaps, price_request
from backend.domain.market_data import DailyClose, MarketDataProvider
from backend.domain.position import HoldingWindow
from backend.repository.market import business_calendar, index_rates, last_fetch

logger = logging.getLogger(__name__)

_fetch_lock = Lock()

WINDOW_MONTHS = {
    CorrelationWindow.SIX_MONTHS: 6,
    CorrelationWindow.ONE_YEAR: 12,
    CorrelationWindow.THREE_YEARS: 36,
    CorrelationWindow.FIVE_YEARS: 60,
}
# As referências entram na lista pelo nome, que nenhum ticker da B3 tem: quatro
# letras e um número
BENCHMARKS = {"IBOV": IndexSeries.IBOV, "CDI": IndexSeries.CDI}
MIN_SYMBOLS = 2
MAX_SYMBOLS = 12


class TickerNotFoundError(FinanceError):
    status = 404


class SourceUnavailableError(FinanceError):
    status = 503


@dataclass(frozen=True, slots=True, kw_only=True)
class PairCorrelation:
    first: str
    second: str
    correlation: Correlation


@dataclass(frozen=True, slots=True, kw_only=True)
class SymbolMatrix:
    symbols: list[str]
    cells: list[list[MatrixCell]]


def normalize_symbol(text: str) -> str:
    """Um ticker da B3, sem o sufixo do yfinance, ou o nome de uma referência."""
    return text.strip().upper().removesuffix(".SA")


def window_start(today: date, window: CorrelationWindow) -> date:
    """O mesmo dia, `window` meses antes; num mês mais curto, o último dia dele."""
    index = today.year * 12 + today.month - 1 - WINDOW_MONTHS[window]
    year, month = index // 12, index % 12 + 1
    return date(year, month, min(today.day, calendar.monthrange(year, month)[1]))


def _cached_range(session: Session, ticker: str) -> CachedRange | None:
    first, last = session.execute(
        select(
            func.min(TickerPriceHistory.price_date),
            func.max(TickerPriceHistory.price_date),
        ).where(TickerPriceHistory.ticker == ticker)
    ).one()
    return CachedRange(first=first, last=last) if first and last else None


def _refresh(
    session: Session,
    provider: MarketDataProvider,
    ticker: str,
    window: HoldingWindow,
    now: datetime,
) -> bool:
    """Consulta a fonte quando o cache não cobre a janela; falso quando a consulta
    falhou. A consulta traz a janela inteira, desde o começo do que já estava em
    cache, e substitui o cache do ticker: o desdobramento que a fonte passou a
    conhecer ajusta todo o histórico de uma vez, sem salto falso no meio."""
    calendar = business_calendar(session)
    cached = _cached_range(session, ticker)
    log = session.scalars(select(FetchLog).where(FetchLog.ticker == ticker)).first()
    request = price_request(window, cached, last_fetch(log), now, calendar)
    if request is None:
        return True

    start = min(window.start, cached.first) if cached else window.start
    # A rede é consultada fora de transação, como no refresh de cotações
    session.commit()
    logger.info(
        "%s: consultando %s de %s a %s", provider.name, ticker, start, request.end
    )
    closes: list[DailyClose] = []
    succeeded = True
    try:
        closes = provider.get_history(ticker, start, request.end)
    except Exception:
        logger.warning("%s falhou para %s", provider.name, ticker, exc_info=True)
        succeeded = False

    if closes:
        session.execute(
            delete(TickerPriceHistory).where(TickerPriceHistory.ticker == ticker)
        )
        session.add_all(
            TickerPriceHistory(
                ticker=ticker, price_date=close.price_date, close=close.close
            )
            for close in closes
        )
        session.flush()
    gap = bool(price_gaps(window, _cached_range(session, ticker), now, calendar))
    if log is None:
        session.add(
            FetchLog(
                attempted_at=now,
                succeeded_at=now if succeeded else None,
                gap=gap,
                ticker=ticker,
            )
        )
    else:
        log.attempted_at = now
        log.succeeded_at = now if succeeded else log.succeeded_at
        log.gap = gap
    session.commit()
    return succeeded


def ticker_closes(
    session: Session,
    provider: MarketDataProvider,
    ticker: str,
    start: date,
    now: datetime,
) -> dict[date, float]:
    """Os fechamentos do ticker desde `start`, até o último pregão encerrado. Sem a
    fonte, vale o que o cache já tem."""
    window = HoldingWindow(start=start, end=now.date())
    with _fetch_lock:
        succeeded = _refresh(session, provider, ticker, window, now)
    closes = {
        price_date: float(close)
        for price_date, close in session.execute(
            select(TickerPriceHistory.price_date, TickerPriceHistory.close).where(
                TickerPriceHistory.ticker == ticker,
                TickerPriceHistory.price_date >= start,
            )
        ).tuples()
    }
    if closes:
        return closes
    if not succeeded:
        raise SourceUnavailableError(
            f"A fonte de cotações não respondeu, e {ticker} não tem cotação em cache."
        )
    raise TickerNotFoundError(f"A fonte não tem cotação de {ticker} no período.")


def benchmark_closes(
    session: Session, benchmark: IndexSeries, start: date
) -> dict[date, float]:
    """O IBOV pelo fechamento em pontos; o CDI como o nível de um título a 100% do
    CDI, que o dia útil faz render a taxa publicada na véspera."""
    rates = index_rates(session)[benchmark]
    if benchmark is IndexSeries.IBOV:
        return {
            rate.rate_date: float(rate.value)
            for rate in rates
            if rate.rate_date >= start
        }
    levels: dict[date, float] = {}
    level = 1.0
    for rate in rates:
        if rate.rate_date >= start:
            levels[rate.rate_date] = level
            level *= 1 + float(rate.value) / 100
    return levels


def symbol_closes(
    session: Session,
    provider: MarketDataProvider,
    symbol: str,
    start: date,
    now: datetime,
) -> dict[date, float]:
    benchmark = BENCHMARKS.get(symbol)
    if benchmark is not None:
        return benchmark_closes(session, benchmark, start)
    return ticker_closes(session, provider, symbol, start, now)


def correlation(
    session: Session,
    provider: MarketDataProvider,
    *,
    first: str,
    second: str,
    window: CorrelationWindow,
    now: datetime,
) -> PairCorrelation:
    start = window_start(now.date(), window)
    first_symbol, second_symbol = normalize_symbol(first), normalize_symbol(second)
    return PairCorrelation(
        first=first_symbol,
        second=second_symbol,
        correlation=correlate(
            symbol_closes(session, provider, first_symbol, start, now),
            symbol_closes(session, provider, second_symbol, start, now),
        ),
    )


def matrix(
    session: Session,
    provider: MarketDataProvider,
    *,
    symbols: Sequence[str],
    window: CorrelationWindow,
    now: datetime,
) -> SymbolMatrix:
    """A correlação de cada par entre os `symbols`, sem repetir, na ordem dada."""
    unique = list(dict.fromkeys(normalize_symbol(symbol) for symbol in symbols))
    if not MIN_SYMBOLS <= len(unique) <= MAX_SYMBOLS:
        raise CorrelationError(
            f"A matriz compara de {MIN_SYMBOLS} a {MAX_SYMBOLS} ativos diferentes."
        )
    start = window_start(now.date(), window)
    series = [symbol_closes(session, provider, symbol, start, now) for symbol in unique]
    return SymbolMatrix(symbols=unique, cells=correlation_matrix(series))
