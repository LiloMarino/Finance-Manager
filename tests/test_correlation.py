from __future__ import annotations

import math
from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app import create_app
from backend.core.database.session import get_session
from backend.core.enum import CorrelationWindow, IndexSeries
from backend.core.models.models import FetchLog, IndexHistory, TickerPriceHistory
from backend.domain.correlation import ROLLING_WINDOW, CorrelationError, correlate
from backend.domain.market_data import DailyClose
from backend.features.correlation.service import (
    SourceUnavailableError,
    correlation,
    ticker_closes,
)
from backend.features.providers import get_provider

# Sexta-feira, depois do fechamento do pregão
NOW = datetime(2024, 6, 28, 20, 0)
START = date(2024, 1, 2)


@dataclass
class FakeProvider:
    """Fechamentos por ticker; o ticker que não está aqui volta vazio, como no
    yfinance."""

    name: str
    closes: dict[str, dict[date, str]] = field(
        default_factory=dict[str, dict[date, str]]
    )
    offline: bool = False
    calls: list[tuple[str, date, date]] = field(
        default_factory=list[tuple[str, date, date]]
    )

    def get_history(self, ticker: str, start: date, end: date) -> list[DailyClose]:
        self.calls.append((ticker, start, end))
        if self.offline:
            raise ConnectionError("sem rede")
        return [
            DailyClose(price_date=day, close=Decimal(close))
            for day, close in sorted(self.closes.get(ticker, {}).items())
            if start <= day <= end
        ]


def _weekdays(start: date, end: date) -> list[date]:
    days = (start + timedelta(days=offset) for offset in range((end - start).days + 1))
    return [day for day in days if day.weekday() < 5]


def _returns(count: int) -> list[float]:
    """Retornos que variam sem padrão fácil, entre -3% e +3%."""
    return [0.03 * math.sin(index * 1.7) for index in range(count)]


def _prices(days: list[date], returns: list[float]) -> dict[date, float]:
    price = 100.0
    prices = {days[0]: price}
    for day, change in zip(days[1:], returns, strict=False):
        price *= 1 + change
        prices[day] = price
    return prices


def _as_text(prices: dict[date, float]) -> dict[date, str]:
    return {day: f"{price:.2f}" for day, price in prices.items()}


def test_same_moves_correlate_to_one() -> None:
    """Duas séries com os mesmos retornos têm correlação 1, mesmo em níveis de preço
    diferentes."""
    days = _weekdays(START, date(2024, 3, 29))
    returns = _returns(len(days) - 1)
    first = _prices(days, returns)
    second = {day: price * 3 for day, price in first.items()}

    result = correlate(first, second)

    assert result.value == pytest.approx(1)
    assert result.points[0].first == result.points[0].second == 100


def test_opposite_moves_correlate_to_minus_one() -> None:
    """Quando um sobe exatamente o que o outro cai, a correlação é -1."""
    days = _weekdays(START, date(2024, 3, 29))
    returns = _returns(len(days) - 1)

    result = correlate(
        _prices(days, returns), _prices(days, [-change for change in returns])
    )

    assert result.value == pytest.approx(-1)


def test_only_common_sessions_count() -> None:
    """O dia com pregão num lado só fica de fora: os retornos são contados entre os
    pregões em comum."""
    days = _weekdays(START, date(2024, 3, 29))
    first = _prices(days, _returns(len(days) - 1))
    second = dict(first)
    del second[days[10]]

    result = correlate(first, second)

    assert result.returns == len(days) - 2
    assert all(point.day != days[10] for point in result.points)


def test_rolling_correlation_starts_after_the_window() -> None:
    """A correlação móvel começa quando há uma janela inteira de retornos, e há um
    ponto por dia a partir daí."""
    days = _weekdays(START, date(2024, 6, 28))
    first = _prices(days, _returns(len(days) - 1))

    result = correlate(first, first)

    assert result.rolling[0].day == days[ROLLING_WINDOW]
    assert len(result.rolling) == len(days) - ROLLING_WINDOW


def test_too_few_sessions_are_rejected() -> None:
    """Com menos de 20 retornos em comum, a correlação é recusada com o motivo."""
    days = _weekdays(START, date(2024, 1, 20))
    prices = _prices(days, _returns(len(days) - 1))

    with pytest.raises(CorrelationError, match="retornos diários em comum"):
        correlate(prices, prices)


def test_flat_series_has_no_correlation() -> None:
    """Uma série que não varia não tem correlação com nada."""
    days = _weekdays(START, date(2024, 3, 29))
    moving = _prices(days, _returns(len(days) - 1))
    flat = dict.fromkeys(days, 10.0)

    with pytest.raises(CorrelationError, match="não variou"):
        correlate(moving, flat)


def _provider(*tickers: str) -> FakeProvider:
    days = _weekdays(date(2023, 1, 2), NOW.date())
    provider = FakeProvider("fake")
    for index, ticker in enumerate(tickers):
        returns = [change * (index + 1) for change in _returns(len(days) - 1)]
        provider.closes[ticker] = _as_text(_prices(days, returns))
    return provider


def _cache(session: Session, ticker: str) -> dict[date, Decimal]:
    return {
        price_date: close
        for price_date, close in session.execute(
            select(TickerPriceHistory.price_date, TickerPriceHistory.close).where(
                TickerPriceHistory.ticker == ticker
            )
        ).tuples()
    }


def test_second_query_stays_on_the_machine(session: Session) -> None:
    """Com o cache em dia, a segunda correlação não consulta a fonte."""
    provider = _provider("ABCD11", "EFGH3")

    first = correlation(
        session,
        provider,
        first="abcd11.sa",
        second="EFGH3",
        benchmark=None,
        window=CorrelationWindow.SIX_MONTHS,
        now=NOW,
    )
    calls = len(provider.calls)
    again = correlation(
        session,
        provider,
        first="ABCD11",
        second="EFGH3",
        benchmark=None,
        window=CorrelationWindow.SIX_MONTHS,
        now=NOW + timedelta(hours=1),
    )

    assert calls == 2
    assert len(provider.calls) == 2
    assert first.first == "ABCD11"
    assert again.correlation.value == pytest.approx(first.correlation.value)
    assert first.correlation.value == pytest.approx(1, abs=1e-4)


def test_new_fetch_replaces_the_whole_window(session: Session) -> None:
    """A consulta seguinte traz a janela inteira desde o começo do cache e o
    substitui: um desdobramento que a fonte passou a conhecer ajusta todo o
    histórico, sem salto no meio."""
    provider = _provider("ABCD11")
    start = date(2024, 1, 2)
    ticker_closes(session, provider, "ABCD11", start, NOW)
    provider.closes["ABCD11"] = {
        day: f"{Decimal(close) / 2:.2f}"
        for day, close in provider.closes["ABCD11"].items()
    }
    provider.closes["ABCD11"][date(2024, 7, 1)] = "60.00"

    ticker_closes(session, provider, "ABCD11", start, datetime(2024, 7, 1, 20, 0))

    assert provider.calls[-1][1] == start
    cache = _cache(session, "ABCD11")
    assert cache[start] == Decimal(provider.closes["ABCD11"][start])
    assert cache[date(2024, 7, 1)] == Decimal("60.00")


def test_offline_source_uses_the_cache(session: Session) -> None:
    """Sem rede, a correlação sai do que o cache já tem; sem cache, é recusada com o
    motivo."""
    provider = _provider("ABCD11", "EFGH3")
    correlation(
        session,
        provider,
        first="ABCD11",
        second="EFGH3",
        benchmark=None,
        window=CorrelationWindow.SIX_MONTHS,
        now=NOW,
    )
    provider.offline = True

    later = datetime(2024, 7, 2, 20, 0)
    result = correlation(
        session,
        provider,
        first="ABCD11",
        second="EFGH3",
        benchmark=None,
        window=CorrelationWindow.SIX_MONTHS,
        now=later,
    )

    assert result.correlation.end == NOW.date()
    with pytest.raises(SourceUnavailableError):
        ticker_closes(session, provider, "WXYZ3", START, later)


def test_benchmark_comes_from_the_series_cache(session: Session) -> None:
    """Contra o IBOV, o outro lado sai do cache das séries, sem consultar a fonte
    por ele."""
    provider = _provider("ABCD11")
    session.add_all(
        IndexHistory(
            series=IndexSeries.IBOV, rate_date=day, value=Decimal(close) * 1000
        )
        for day, close in provider.closes["ABCD11"].items()
    )
    session.commit()

    result = correlation(
        session,
        provider,
        first="ABCD11",
        second=None,
        benchmark=IndexSeries.IBOV,
        window=CorrelationWindow.ONE_YEAR,
        now=NOW,
    )

    assert result.second == "IBOV"
    assert result.correlation.value == pytest.approx(1)
    assert [call[0] for call in provider.calls] == ["ABCD11"]


def test_fetch_log_accepts_exactly_one_target(session: Session) -> None:
    """O registro de consulta é de um ativo, de uma série ou de um ticker: nenhum
    ou dois ao mesmo tempo é recusado."""
    session.add(FetchLog(attempted_at=NOW, succeeded_at=NOW, gap=False))
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()

    session.add(
        FetchLog(
            attempted_at=NOW,
            succeeded_at=NOW,
            gap=False,
            series=IndexSeries.CDI,
            ticker="ABCD11",
        )
    )
    with pytest.raises(IntegrityError):
        session.commit()


@pytest.fixture
def correlation_client(engine: Engine) -> Iterator[tuple[TestClient, FakeProvider]]:
    days = _weekdays(date.today() - timedelta(days=400), date.today())
    provider = FakeProvider("fake")
    provider.closes["ABCD11"] = _as_text(_prices(days, _returns(len(days) - 1)))

    def session_override() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_provider] = lambda: provider
    yield TestClient(app), provider


def test_unknown_ticker_is_not_found(
    correlation_client: tuple[TestClient, FakeProvider],
) -> None:
    """Um ticker que a fonte não conhece dá 404 com o motivo."""
    client, _ = correlation_client

    response = client.get(
        "/api/correlation",
        params={"first": "ABCD11", "second": "ZZZZ3", "window": "1y"},
    )

    assert response.status_code == 404
    assert "ZZZZ3" in response.json()["detail"]


def test_correlation_needs_exactly_one_comparison(
    correlation_client: tuple[TestClient, FakeProvider],
) -> None:
    """Sem o segundo ticker nem a referência, ou com os dois, é 422 com o motivo."""
    client, _ = correlation_client

    neither = client.get("/api/correlation", params={"first": "ABCD11", "window": "1y"})
    both = client.get(
        "/api/correlation",
        params={
            "first": "ABCD11",
            "second": "ABCD11",
            "benchmark": "ibov",
            "window": "1y",
        },
    )

    assert neither.status_code == 422
    assert both.status_code == 422


def test_correlation_endpoint_returns_both_series(
    correlation_client: tuple[TestClient, FakeProvider],
) -> None:
    """A API devolve a correlação, as duas séries em base 100 e a correlação móvel."""
    client, _ = correlation_client

    response = client.get(
        "/api/correlation",
        params={"first": "ABCD11", "second": "ABCD11", "window": "1y"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["correlation"] == pytest.approx(1)
    assert body["points"][0]["first"] == 100
    assert body["rolling_window"] == ROLLING_WINDOW
    assert len(body["rolling"]) > 0
