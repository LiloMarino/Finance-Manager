from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, IncomeType, OperationType
from backend.core.models.models import Asset, IncomeEvent, Operation, PriceHistory
from backend.domain.daily_series import months_before

TODAY = date.today()


def _asset(session: Session, ticker: str, asset_class: AssetClass) -> Asset:
    asset = Asset(ticker=ticker, asset_class=asset_class)
    session.add(asset)
    session.commit()
    return asset


def _income(
    session: Session,
    asset: Asset,
    day: date,
    amount: str,
    *,
    income_type: IncomeType = IncomeType.DIVIDEND,
    quantity: str = "10",
) -> None:
    session.add(
        IncomeEvent(
            asset_id=asset.id,
            payment_date=day,
            income_type=income_type,
            quantity=Decimal(quantity),
            unit_price=Decimal(amount) / Decimal(quantity),
            amount=Decimal(amount),
        )
    )
    session.commit()


def _payload(asset_id: int, **changes: str) -> dict[str, str | int]:
    return {
        "asset_id": asset_id,
        "payment_date": "2024-03-15",
        "income_type": "dividend",
        "quantity": "10",
        "unit_price": "0.5",
        "amount": "5",
        **changes,
    }


def test_manual_income_is_created_filtered_updated_and_deleted(
    api: TestClient, session: Session
) -> None:
    """O provento cadastrado à mão aparece no histórico, que filtra por categoria,
    tipo e período e soma o total do que ficou no filtro."""
    stock = _asset(session, "WXYZ3", AssetClass.STOCK)
    fii = _asset(session, "ABCD11", AssetClass.FII)
    created = api.post("/api/income", json=_payload(stock.id)).json()
    api.post(
        "/api/income",
        json=_payload(
            fii.id,
            income_type="distribution",
            payment_date="2024-04-15",
            amount="20",
            unit_price="2",
        ),
    )

    everything = api.get("/api/income").json()
    only_fii = api.get("/api/income", params={"category": "fii"}).json()
    only_march = api.get(
        "/api/income", params={"start": "2024-03-01", "end": "2024-03-31"}
    ).json()
    updated = api.put(
        f"/api/income/{created['id']}", json=_payload(stock.id, income_type="jcp")
    ).json()
    deleted = api.delete(f"/api/income/{created['id']}")

    assert [event["ticker"] for event in everything["events"]] == ["ABCD11", "WXYZ3"]
    assert everything["total"] == "25"
    assert only_fii["total"] == "20"
    assert [event["ticker"] for event in only_march["events"]] == ["WXYZ3"]
    assert updated["income_type"] == "jcp"
    assert deleted.status_code == 204
    assert api.get("/api/income").json()["total"] == "20"


def test_income_without_amount_is_refused(api: TestClient, session: Session) -> None:
    """Provento com valor recebido zero é recusado com a mensagem da regra."""
    asset = _asset(session, "WXYZ3", AssetClass.STOCK)

    response = api.post("/api/income", json=_payload(asset.id, amount="0"))

    assert response.status_code == 422
    assert "valor recebido" in response.json()["detail"]


def test_asset_with_income_cannot_be_deleted(api: TestClient, session: Session) -> None:
    """Ativo com provento fica, e a mensagem diz o porquê."""
    asset = _asset(session, "WXYZ3", AssetClass.STOCK)
    _income(session, asset, date(2024, 3, 15), "5")

    response = api.delete(f"/api/assets/{asset.id}")

    assert response.status_code == 409
    assert "proventos" in response.json()["detail"]


def test_performance_sums_by_month_and_by_year_with_recent_totals(
    api: TestClient, session: Session
) -> None:
    """As barras cobrem todo mês do período, inclusive os sem provento, e os totais
    recentes contam até hoje: R$ 10 há 1 mês, R$ 20 há 7 e R$ 40 há 13."""
    asset = _asset(session, "WXYZ3", AssetClass.STOCK)
    fii = _asset(session, "ABCD11", AssetClass.FII)
    _income(session, asset, months_before(TODAY, 1), "10")
    _income(session, fii, months_before(TODAY, 7), "20")
    _income(session, asset, months_before(TODAY, 13), "40")

    monthly = api.get("/api/income/performance").json()
    yearly = api.get("/api/income/performance", params={"group": "year"}).json()

    assert (
        monthly["total"],
        monthly["last_6_months"],
        monthly["last_12_months"],
        monthly["last_24_months"],
    ) == ("70", "10", "30", "70")
    assert len(monthly["bars"]) == 14
    assert sum(Decimal(bar["total"]) for bar in monthly["bars"]) == 70
    assert [bar["period"] for bar in yearly["bars"]] == [
        str(year) for year in range(months_before(TODAY, 13).year, TODAY.year + 1)
    ]
    assert {
        (item["category"], item["amount"], item["share"])
        for item in monthly["categories"]
    } == {
        ("stock", "50", "0.7142857142857142857142857143"),
        ("fii", "20", "0.2857142857142857142857142857"),
    }


def test_distribution_brings_dividend_yield_and_yield_on_cost(
    api: TestClient, session: Session
) -> None:
    """R$ 6 pagos por unidade em 12 meses, num ativo que vale R$ 100 hoje e que foi
    comprado a R$ 80: dividend yield de 6% e yield on cost de 7,5%."""
    asset = _asset(session, "WXYZ3", AssetClass.STOCK)
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=months_before(TODAY, 18),
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(80),
        )
    )
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(100)))
    session.commit()
    _income(session, asset, months_before(TODAY, 2), "20")
    _income(session, asset, months_before(TODAY, 8), "40")
    _income(session, asset, months_before(TODAY, 14), "30")

    body = api.get("/api/income/distribution", params={"months": 12}).json()

    [item] = body["assets"]
    assert body["total"] == "60"
    assert item["quantity"] == "10"
    assert Decimal(item["dividend_yield"]) == Decimal("0.06")
    assert Decimal(item["yield_on_cost"]) == Decimal("0.075")
    assert (item["last_amount"], item["last_payment_date"]) == (
        "20",
        str(months_before(TODAY, 2)),
    )
    assert item["accumulated"] == "90"


def test_distribution_leaves_yields_null_without_position(
    api: TestClient, session: Session
) -> None:
    """Ativo que pagou e já foi vendido aparece na distribuição, sem dividend yield
    nem yield on cost."""
    asset = _asset(session, "WXYZ3", AssetClass.STOCK)
    _income(session, asset, TODAY - timedelta(days=10), "5")

    [item] = api.get("/api/income/distribution").json()["assets"]

    assert item["quantity"] == "0"
    assert item["dividend_yield"] is None
    assert item["yield_on_cost"] is None
