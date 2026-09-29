from __future__ import annotations

from collections.abc import Iterator

from fastapi.testclient import TestClient
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from backend.app import create_app
from backend.core.database.session import get_session
from backend.domain.ticker_search import (
    QuoteHit,
    TickerSearchUnavailableError,
    b3_matches,
)
from backend.features.providers import get_ticker_search


class FakeSearch:
    def __init__(self, hits: list[QuoteHit], *, down: bool = False) -> None:
        self.hits = hits
        self.down = down
        self.queries: list[str] = []

    def search(self, query: str) -> list[QuoteHit]:
        self.queries.append(query)
        if self.down:
            raise TickerSearchUnavailableError("fonte fora do ar")
        return self.hits


def _hit(symbol: str, exchange: str = "SAO", name: str = "EMPRESA ABCD") -> QuoteHit:
    return QuoteHit(symbol=symbol, exchange=exchange, name=name)


def _client(engine: Engine, search: FakeSearch) -> TestClient:
    def session_override() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_ticker_search] = lambda: search
    return TestClient(app)


def test_only_standard_lot_b3_tickers_are_kept() -> None:
    """Fica só o que a B3 negocia no lote padrão, sem o `.SA`: sai a bolsa de fora,
    o fracionário e o sufixo de situação especial."""
    hits = [
        _hit("ABCD", exchange="NYQ"),
        _hit("ABCD4.SA"),
        _hit("ABCD3.SA"),
        _hit("ABCD4F.SA"),
        _hit("ABCD4Q.SA"),
        _hit("ABCD3.BA", exchange="BUE"),
        _hit("ABCD11.SA", name="  FII   ABCD  "),
    ]

    assert [(match.ticker, match.name) for match in b3_matches(hits)] == [
        ("ABCD4", "EMPRESA ABCD"),
        ("ABCD3", "EMPRESA ABCD"),
        ("ABCD11", "FII ABCD"),
    ]


def test_repeated_ticker_appears_once() -> None:
    """O mesmo ticker repetido pela fonte aparece uma vez, na primeira posição."""
    hits = [_hit("ABCD4.SA", name="PRIMEIRO"), _hit("ABCD4.SA", name="SEGUNDO")]

    assert [match.name for match in b3_matches(hits)] == ["PRIMEIRO"]


def test_search_route_returns_the_matches(engine: Engine) -> None:
    """A rota devolve os tickers da B3 e consulta a fonte com o texto em
    maiúsculas."""
    search = FakeSearch([_hit("ABCD4.SA"), _hit("ABCD", exchange="NYQ")])

    response = _client(engine, search).get(
        "/api/market/tickers", params={"q": " abcd "}
    )

    assert response.status_code == 200
    assert response.json() == [{"ticker": "ABCD4", "name": "EMPRESA ABCD"}]
    assert search.queries == ["ABCD"]


def test_short_query_does_not_reach_the_source(engine: Engine) -> None:
    """Menos de 2 caracteres devolve a lista vazia sem consultar a fonte."""
    search = FakeSearch([_hit("ABCD4.SA")])

    response = _client(engine, search).get("/api/market/tickers", params={"q": "a"})

    assert response.json() == []
    assert search.queries == []


def test_source_down_is_service_unavailable(engine: Engine) -> None:
    """Com a fonte fora do ar, a busca dá 503 com o motivo."""
    search = FakeSearch([], down=True)

    response = _client(engine, search).get("/api/market/tickers", params={"q": "ab"})

    assert response.status_code == 503
    assert response.json() == {"detail": "fonte fora do ar"}
