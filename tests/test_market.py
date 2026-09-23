from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import UTC, date, datetime
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.adapters.yfinance_provider import to_daily_closes
from backend.app import create_app
from backend.core.database.session import get_session
from backend.core.enum import AssetClass, OperationType
from backend.core.models.models import Asset, Operation, PriceHistory
from backend.domain.market_data import DailyClose, MarketDataProvider
from backend.features.market.router import get_provider
from backend.features.market.service import refresh_prices

FIRST_OPERATION = date(2024, 2, 5)
TODAY = date(2024, 2, 9)


@dataclass
class FakeProvider:
    name: str
    closes: dict[date, str] = field(default_factory=dict[date, str])
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
            for day, close in sorted(self.closes.items())
            if start <= day <= end
        ]


def _asset(
    session: Session,
    ticker: str = "ABCD11",
    asset_class: AssetClass = AssetClass.FII,
    *,
    with_operation: bool = True,
) -> Asset:
    asset = Asset(ticker=ticker, asset_class=asset_class)
    session.add(asset)
    session.flush()
    if with_operation:
        session.add(
            Operation(
                asset_id=asset.id,
                operation_date=FIRST_OPERATION,
                operation_type=OperationType.BUY,
                quantity=Decimal(10),
                unit_price=Decimal(100),
            )
        )
    session.commit()
    return asset


def _cached(session: Session) -> dict[date, Decimal]:
    return {row.price_date: row.close for row in session.scalars(select(PriceHistory))}


def _refresh(session: Session, provider: MarketDataProvider) -> tuple[str, ...]:
    return refresh_prices(session, provider, TODAY).failed


def test_first_refresh_starts_at_first_operation(session: Session) -> None:
    """Sem cache, o refresh pede da primeira operação até hoje e grava o que vier."""
    _asset(session)
    provider = FakeProvider(
        "fake", {date(2024, 2, 5): "10.00", date(2024, 2, 6): "10.50"}
    )

    _refresh(session, provider)

    assert provider.calls == [("ABCD11", FIRST_OPERATION, TODAY)]
    assert _cached(session) == {
        date(2024, 2, 5): Decimal("10.00"),
        date(2024, 2, 6): Decimal("10.50"),
    }


def test_next_refresh_resumes_from_last_cached_day(session: Session) -> None:
    """Com cache, o refresh pede só a partir do último dia gravado, e regrava o
    fechamento desse dia, que podia ser de um pregão em andamento."""
    _asset(session)
    provider = FakeProvider(
        "fake", {date(2024, 2, 5): "10.00", date(2024, 2, 6): "10.50"}
    )
    _refresh(session, provider)

    provider.closes[date(2024, 2, 6)] = "10.80"
    provider.closes[date(2024, 2, 7)] = "11.00"
    _refresh(session, provider)

    assert provider.calls[-1] == ("ABCD11", date(2024, 2, 6), TODAY)
    assert _cached(session)[date(2024, 2, 6)] == Decimal("10.80")
    assert _cached(session)[date(2024, 2, 7)] == Decimal("11.00")


def test_failed_provider_keeps_cache_untouched(session: Session) -> None:
    """Provider fora do ar deixa o ticker em `failed` e o cache como estava."""
    _asset(session)
    provider = FakeProvider("fake", {date(2024, 2, 5): "10.00"})
    _refresh(session, provider)

    provider.offline = True
    failed = _refresh(session, provider)

    assert failed == ("ABCD11",)
    assert _cached(session) == {date(2024, 2, 5): Decimal("10.00")}


def test_only_listed_assets_with_operations_are_fetched(session: Session) -> None:
    """Ativo sem operação e renda fixa ficam fora do refresh."""
    _asset(session, "ABCD3", AssetClass.STOCK, with_operation=False)
    _asset(session, "CDB XYZ 2030", AssetClass.FIXED_INCOME)
    provider = FakeProvider("fake")

    _refresh(session, provider)

    assert provider.calls == []


def test_close_must_be_positive(session: Session) -> None:
    """A CHECK do banco recusa fechamento zero."""
    asset = _asset(session)
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(0)))

    with pytest.raises(IntegrityError, match="CHECK"):
        session.flush()


def test_deleting_asset_drops_its_price_cache(session: Session) -> None:
    """O cache é descartável: apagar o ativo leva os fechamentos junto."""
    asset = _asset(session, with_operation=False)
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(10)))
    session.commit()

    session.execute(delete(Asset).where(Asset.id == asset.id))
    session.commit()

    assert _cached(session) == {}


@pytest.fixture
def provider() -> FakeProvider:
    return FakeProvider("fake")


@pytest.fixture
def market_client(engine: Engine, provider: FakeProvider) -> TestClient:
    def session_override() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_provider] = lambda: provider
    return TestClient(app)


def test_offline_refresh_keeps_last_known_price(
    market_client: TestClient,
    session: Session,
    provider: FakeProvider,
) -> None:
    """Sem rede, o refresh responde 200 com o ticker em `failed`, e a listagem
    segue com o último preço conhecido e a data dele."""
    _asset(session)
    provider.closes[date(2024, 2, 6)] = "10.50"
    _refresh(session, provider)
    provider.offline = True

    refresh = market_client.post("/api/market/prices/refresh")
    prices = market_client.get("/api/market/prices")

    assert refresh.status_code == 200
    assert refresh.json() == {"updated": [], "failed": ["ABCD11"]}
    assert [(p["ticker"], p["close"], p["price_date"]) for p in prices.json()] == [
        ("ABCD11", "10.50", "2024-02-06")
    ]


def test_asset_without_cached_price_is_listed_empty(
    market_client: TestClient, session: Session
) -> None:
    """Ativo com operação e ainda sem cotação aparece com preço e data nulos."""
    _asset(session)

    prices = market_client.get("/api/market/prices").json()

    assert [(p["ticker"], p["close"], p["price_date"]) for p in prices] == [
        ("ABCD11", None, None)
    ]


def test_yfinance_close_is_rounded_to_cents() -> None:
    """O float do yfinance vira Decimal em centavos, sem o ruído binário."""
    rows = [(datetime(2024, 2, 7, tzinfo=UTC), 10.529999732971191)]

    assert to_daily_closes(rows) == [
        DailyClose(price_date=date(2024, 2, 7), close=Decimal("10.53"))
    ]
