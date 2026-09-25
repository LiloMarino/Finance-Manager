from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, OperationType
from backend.core.models.models import Asset, Operation, PriceHistory

TODAY = date.today()


def _operation(
    session: Session,
    asset: Asset,
    operation_type: OperationType,
    quantity: str,
    unit_price: str,
    day: date,
) -> None:
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=day,
            operation_type=operation_type,
            quantity=Decimal(quantity),
            unit_price=Decimal(unit_price),
        )
    )


def _asset(session: Session, ticker: str) -> Asset:
    asset = Asset(ticker=ticker, asset_class=AssetClass.STOCK)
    session.add(asset)
    session.flush()
    return asset


def test_last_gain_is_unrealized_plus_realized_result(
    api: TestClient, session: Session
) -> None:
    """No último dia, o ganho (patrimônio menos o aplicado) é o resultado não
    realizado da carteira somado ao resultado das vendas."""
    asset = _asset(session, "ABCD3")
    start = TODAY - timedelta(days=60)
    _operation(session, asset, OperationType.BUY, "10", "10", start)
    _operation(session, asset, OperationType.BUY, "10", "20", start + timedelta(days=7))
    _operation(
        session, asset, OperationType.SELL, "5", "25", start + timedelta(days=14)
    )
    session.add(PriceHistory(asset_id=asset.id, price_date=start, close=Decimal(10)))
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(30)))
    session.commit()

    body = api.get("/api/evolution").json()
    portfolio = api.get("/api/portfolio").json()

    # PM de 15: a venda realiza 5 * (25 - 15), e as 15 que ficam, 15 * (30 - 15)
    realized = Decimal(50)
    unrealized = Decimal(portfolio["positions"][0]["unrealized_result"])
    last = body["points"][-1]
    assert Decimal(last["gain"]) == unrealized + realized
    assert Decimal(last["invested"]) == Decimal(175)
    assert Decimal(body["total"]) == Decimal(portfolio["total"])
    assert [
        (item["category"], Decimal(item["value"])) for item in body["categories"]
    ] == [("stock", Decimal(450))]


def test_growth_includes_contributions(api: TestClient, session: Session) -> None:
    """O crescimento é a variação do patrimônio, com os aportes dentro."""
    asset = _asset(session, "ABCD3")
    start = TODAY - timedelta(days=400)
    _operation(session, asset, OperationType.BUY, "10", "10", start)
    _operation(
        session, asset, OperationType.BUY, "10", "10", TODAY - timedelta(days=30)
    )
    session.add(PriceHistory(asset_id=asset.id, price_date=start, close=Decimal(10)))
    session.commit()

    body = api.get("/api/evolution").json()

    assert Decimal(body["last_6_months"]["change"]) == Decimal(100)
    assert Decimal(body["last_6_months"]["growth_return"]) == Decimal(1)
    assert body["last_24_months"] is None
