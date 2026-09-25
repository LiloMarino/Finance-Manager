from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    Operation,
    PriceHistory,
)

TODAY = date.today()


def _asset(
    session: Session,
    ticker: str,
    asset_class: AssetClass,
    quantity: str,
    unit_price: str,
    close: str | None = None,
) -> None:
    asset = Asset(ticker=ticker, asset_class=asset_class)
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 2, 5),
            operation_type=OperationType.BUY,
            quantity=Decimal(quantity),
            unit_price=Decimal(unit_price),
        )
    )
    if close is not None:
        session.add(
            PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(close))
        )
    session.commit()


def _fixed_income(session: Session, amount: str) -> None:
    """Título aplicado hoje: vale exatamente o que foi aplicado."""
    investment = FixedIncomeInvestment(
        label="CDB XYZ 2030",
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=None,
        daily_liquidity=False,
    )
    session.add(investment)
    session.flush()
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=TODAY,
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=Decimal(amount),
        )
    )
    session.commit()


def test_total_adds_market_value_and_fixed_income(
    api: TestClient, session: Session
) -> None:
    """O total é a renda variável a mercado mais a renda fixa bruta, e cada
    categoria traz a fração dela no total."""
    _asset(session, "ABCD3", AssetClass.STOCK, "10", "20", close="30")
    _asset(session, "ABCD11", AssetClass.FII, "10", "100", close="100")
    _fixed_income(session, "700")

    body = api.get("/api/portfolio").json()

    assert Decimal(body["total"]) == Decimal(2000)
    assert [
        (c["category"], Decimal(c["value"]), Decimal(c["share"]))
        for c in body["categories"]
    ] == [
        ("stock", Decimal(300), Decimal("0.15")),
        ("fii", Decimal(1000), Decimal("0.5")),
        ("fixed_income", Decimal(700), Decimal("0.35")),
    ]
    assert Decimal(body["fixed_income"][0]["share"]) == Decimal("0.35")


def test_position_carries_unrealized_result(api: TestClient, session: Session) -> None:
    """A posição traz preço, valor a mercado e lucro não realizado sobre o custo."""
    _asset(session, "ABCD3", AssetClass.STOCK, "10", "20", close="30")

    [position] = api.get("/api/portfolio").json()["positions"]

    assert Decimal(position["price"]) == Decimal(30)
    assert Decimal(position["market_value"]) == Decimal(300)
    assert Decimal(position["unrealized_result"]) == Decimal(100)
    assert Decimal(position["unrealized_return"]) == Decimal("0.5")
    assert Decimal(position["share"]) == Decimal(1)


def test_asset_without_price_is_valued_at_cost(
    api: TestClient, session: Session
) -> None:
    """Ativo sem cotação em cache entra no total pelo custo, com preço nulo."""
    _asset(session, "ABCD3", AssetClass.STOCK, "10", "20")

    body = api.get("/api/portfolio").json()

    [position] = body["positions"]
    assert position["price"] is None
    assert Decimal(position["market_value"]) == Decimal(200)
    assert Decimal(position["unrealized_result"]) == 0
    assert Decimal(body["total"]) == Decimal(200)


def test_empty_portfolio_has_zero_total(api: TestClient) -> None:
    """Sem posição nem renda fixa, o total é zero e não há categoria."""
    body = api.get("/api/portfolio").json()

    assert Decimal(body["total"]) == 0
    assert body["categories"] == []
