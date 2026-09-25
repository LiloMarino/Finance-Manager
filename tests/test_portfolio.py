from __future__ import annotations

from datetime import date, timedelta
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
    Sector,
    Segment,
)

TODAY = date.today()
YESTERDAY = TODAY - timedelta(days=1)


def _asset(
    session: Session,
    ticker: str,
    asset_class: AssetClass,
    quantity: str,
    unit_price: str,
    close: str | None = None,
) -> Asset:
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
    return asset


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


def test_sector_distribution_divides_equity_only(
    api: TestClient, session: Session
) -> None:
    """Setor e segmento dividem só a renda variável, do maior valor para o menor:
    a fração é sobre o total dela, e o ativo sem segmento fica em Sem
    classificação."""
    sector = Sector(name="Financeiro")
    session.add(sector)
    session.flush()
    segment = Segment(sector_id=sector.id, name="Bancos")
    session.add(segment)
    session.flush()
    bank = _asset(session, "ABCD3", AssetClass.STOCK, "10", "10", close="30")
    _asset(session, "ABCD11", AssetClass.FII, "10", "10", close="10")
    bank.segment_id = segment.id
    session.commit()
    _fixed_income(session, "600")

    body = api.get("/api/portfolio").json()

    assert [
        (item["sector"], Decimal(item["value"]), Decimal(item["share"]))
        for item in body["sectors"]
    ] == [
        ("Financeiro", Decimal(300), Decimal("0.75")),
        (None, Decimal(100), Decimal("0.25")),
    ]
    assert [(item["sector"], item["segment"]) for item in body["segments"]] == [
        ("Financeiro", "Bancos"),
        (None, None),
    ]
    assert {
        position["ticker"]: (position["sector"], position["segment"])
        for position in body["positions"]
    } == {"ABCD3": ("Financeiro", "Bancos"), "ABCD11": (None, None)}


def _close(session: Session, asset: Asset, day: date, close: str) -> None:
    session.add(PriceHistory(asset_id=asset.id, price_date=day, close=Decimal(close)))
    session.commit()


def test_day_change_compares_the_last_two_closes(
    api: TestClient, session: Session
) -> None:
    """A variação do dia é a quantidade vezes a diferença entre o último fechamento
    e o anterior, com o percentual sobre o anterior; o total diz de que pregões."""
    asset = _asset(session, "ABCD3", AssetClass.STOCK, "10", "20", close="30")
    _close(session, asset, YESTERDAY, "25")

    body = api.get("/api/portfolio").json()

    [position] = body["positions"]
    assert Decimal(position["day_change"]) == Decimal(50)
    assert Decimal(position["day_return"]) == Decimal("0.2")
    assert (body["price_date"], body["previous_price_date"]) == (
        TODAY.isoformat(),
        YESTERDAY.isoformat(),
    )
    assert Decimal(body["day_change"]) == Decimal(50)


def test_asset_with_stale_close_has_no_day_change(
    api: TestClient, session: Session
) -> None:
    """Ativo cujo último fechamento não é o do pregão mais recente fica sem variação
    do dia, e ela não entra na soma da categoria."""
    fresh = _asset(session, "ABCD3", AssetClass.STOCK, "10", "20", close="30")
    _close(session, fresh, YESTERDAY, "25")
    stale = _asset(session, "EFGH3", AssetClass.STOCK, "10", "20")
    _close(session, stale, YESTERDAY - timedelta(days=1), "18")
    _close(session, stale, YESTERDAY, "19")

    body = api.get("/api/portfolio").json()

    by_ticker = {position["ticker"]: position for position in body["positions"]}
    assert by_ticker["EFGH3"]["day_change"] is None
    [stock] = body["categories"]
    assert Decimal(stock["day_change"]) == Decimal(50)
    assert Decimal(stock["day_return"]) == Decimal("0.2")


def test_category_adds_up_its_rows(api: TestClient, session: Session) -> None:
    """O cabeçalho da categoria soma as linhas: quantos ativos, valor, custo,
    resultado e variação do dia."""
    first = _asset(session, "ABCD3", AssetClass.STOCK, "10", "20", close="30")
    _close(session, first, YESTERDAY, "25")
    second = _asset(session, "EFGH3", AssetClass.STOCK, "5", "40", close="36")
    _close(session, second, YESTERDAY, "40")
    _fixed_income(session, "1000")

    body = api.get("/api/portfolio").json()

    stock, fixed_income = body["categories"]
    assert stock["asset_count"] == 2
    assert Decimal(stock["value"]) == Decimal(480)
    assert Decimal(stock["cost"]) == Decimal(400)
    assert Decimal(stock["unrealized_result"]) == Decimal(80)
    assert Decimal(stock["unrealized_return"]) == Decimal("0.2")
    assert Decimal(stock["day_change"]) == Decimal(30)
    assert (fixed_income["category"], fixed_income["asset_count"]) == (
        "fixed_income",
        1,
    )
    assert Decimal(fixed_income["unrealized_result"]) == 0
    assert Decimal(fixed_income["day_change"]) == 0
