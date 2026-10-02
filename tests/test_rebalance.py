from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import func, select
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
    AssetTarget,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    Operation,
    PriceHistory,
    Subportfolio,
)

TODAY = date.today()


def _asset(
    session: Session,
    ticker: str,
    quantity: str,
    price: str,
    subportfolio_id: int | None,
) -> Asset:
    """Posição comprada ao preço de hoje: vale a quantidade vezes o preço."""
    asset = Asset(
        ticker=ticker, asset_class=AssetClass.FII, subportfolio_id=subportfolio_id
    )
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 2, 5),
            operation_type=OperationType.BUY,
            quantity=Decimal(quantity),
            unit_price=Decimal(price),
        )
    )
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(price)))
    session.commit()
    return asset


def _fixed_income(session: Session, amount: str, subportfolio_id: int) -> None:
    investment = FixedIncomeInvestment(
        label="CDB XYZ",
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=None,
        daily_liquidity=True,
        subportfolio_id=subportfolio_id,
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


def _subportfolio(session: Session, name: str = "Renda") -> Subportfolio:
    found = Subportfolio(name=name)
    session.add(found)
    session.commit()
    return found


def _setup(session: Session) -> tuple[Subportfolio, Asset, Asset]:
    """ABCD11 R$ 600, EFGH11 R$ 200 e R$ 200 de renda fixa: 60/20/20 da
    subcarteira."""
    found = _subportfolio(session)
    first = _asset(session, "ABCD11", "6", "100", found.id)
    second = _asset(session, "EFGH11", "10", "20", found.id)
    _fixed_income(session, "200", found.id)
    return found, first, second


def _targets(
    api: TestClient, found: Subportfolio, first: Asset, second: Asset, **overrides: str
) -> int:
    body = {
        "assets": [
            {"asset_id": first.id, "target": overrides.get("first", "40")},
            {"asset_id": second.id, "target": overrides.get("second", "30")},
        ],
        "fixed_income_target": overrides.get("fixed_income", "30"),
        "max_item_deviation": "5",
        "max_total_deviation": overrides.get("total", "7"),
    }
    return api.put(f"/api/rebalance/{found.id}/targets", json=body).status_code


def test_targets_must_add_up_to_one_hundred(api: TestClient, session: Session) -> None:
    """As metas da subcarteira somam 100%, e a mensagem diz quanto elas somam."""
    found, first, second = _setup(session)

    response = api.put(
        f"/api/rebalance/{found.id}/targets",
        json={
            "assets": [
                {"asset_id": first.id, "target": "40"},
                {"asset_id": second.id, "target": "30"},
            ],
            "fixed_income_target": "20",
            "max_item_deviation": "5",
            "max_total_deviation": "7",
        },
    )

    assert response.status_code == 422
    assert "somam 90,00%" in response.json()["detail"]


def test_target_is_only_for_members(api: TestClient, session: Session) -> None:
    """A meta é só de ativo da subcarteira."""
    found, first, _ = _setup(session)
    outsider = _asset(session, "IJKL11", "1", "10", None)

    status = _targets(api, found, first, outsider)

    assert status == 422


def test_view_shows_deviation_gap_and_imbalance(
    api: TestClient, session: Session
) -> None:
    """Cada item traz o atual, a meta, o desvio e os reais que faltam ou sobram; o
    desbalanceamento é a raiz da soma dos quadrados dos desvios."""
    found, first, second = _setup(session)
    assert _targets(api, found, first, second) == 204

    body = api.get(f"/api/rebalance?subportfolio_id={found.id}").json()
    lines = {line["label"]: line for line in body["lines"]}

    assert Decimal(body["targets_total"]) == 1
    assert Decimal(lines["ABCD11"]["deviation"]) == Decimal("0.2")
    assert Decimal(lines["EFGH11"]["gap"]) == Decimal(100)
    assert Decimal(lines["Renda fixa"]["gap"]) == Decimal(100)
    assert round(Decimal(body["imbalance"]), 6) == round(Decimal("0.06").sqrt(), 6)
    assert body["breached"] is True
    assert lines["ABCD11"]["breached"] is True


def test_plan_splits_the_contribution_and_keeps_the_leftover(
    api: TestClient, session: Session
) -> None:
    """R$ 300 vão para EFGH11 e para a renda fixa, que estão abaixo da meta; a compra
    sai em cotas inteiras, e a sobra fica no saldo."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)

    body = api.post(
        "/api/rebalance/plan",
        json={"subportfolio_id": found.id, "amount": "300"},
    ).json()
    orders = {order["label"]: order for order in body["orders"]}

    assert Decimal(orders["ABCD11"]["amount"]) == 0
    assert Decimal(orders["EFGH11"]["quantity"]) == Decimal(7)
    assert Decimal(orders["Renda fixa"]["amount"]) == Decimal(150)
    assert Decimal(body["leftover"]) == Decimal(10)
    assert Decimal(body["imbalance_after"]) < Decimal(body["imbalance_before"])
    assert body["sells_equity"] is False


def test_plan_with_sales_warns_about_equity_sales(
    api: TestClient, session: Session
) -> None:
    """Com venda, o item acima da meta vende, e o plano avisa do DARF possível."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)

    body = api.post(
        "/api/rebalance/plan",
        json={"subportfolio_id": found.id, "amount": "0", "allow_sales": True},
    ).json()
    orders = {order["label"]: order for order in body["orders"]}

    assert Decimal(orders["ABCD11"]["quantity"]) == Decimal(-2)
    assert body["sells_equity"] is True


def test_plan_needs_complete_targets(api: TestClient, session: Session) -> None:
    """Sem metas que somem 100%, não há divisão de aporte."""
    found, _, _ = _setup(session)

    response = api.post(
        "/api/rebalance/plan",
        json={"subportfolio_id": found.id, "amount": "100"},
    )

    assert response.status_code == 422


def test_member_that_leaves_stops_counting(api: TestClient, session: Session) -> None:
    """A meta de um ativo que saiu da subcarteira fica sem efeito: sem os 30% do
    EFGH11, as metas somam 70%, e a subcarteira deixa de ser avaliada."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)
    api.put(
        f"/api/subportfolios/{found.id}/members",
        json={"asset_ids": [first.id], "investment_ids": []},
    )

    body = api.get(f"/api/rebalance?subportfolio_id={found.id}").json()

    assert Decimal(body["targets_total"]) == Decimal("0.7")
    assert body["breached"] is False


def test_general_view_weights_targets_by_subportfolio(
    api: TestClient, session: Session
) -> None:
    """Na carteira geral, a meta do item é a da subcarteira vezes a fração dela, e o
    que está fora de subcarteira vem sem meta."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)
    _asset(session, "IJKL11", "1", "1000", None)

    body = api.get("/api/rebalance").json()
    lines = {line["label"]: line for line in body["lines"]}

    assert Decimal(lines["ABCD11"]["target"]) == Decimal("0.2")
    assert lines["IJKL11"]["target"] is None


def test_data_health_lists_subportfolio_out_of_its_limits(
    api: TestClient, session: Session
) -> None:
    """A subcarteira fora do limite aparece em Saúde dos dados; com os limites
    folgados, não aparece."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)

    def flagged() -> list[str]:
        return [
            issue["subject"]
            for issue in api.get("/api/data-health").json()
            if issue["kind"] == "rebalance_breach"
        ]

    assert flagged() == ["Renda"]
    api.put(
        f"/api/rebalance/{found.id}/targets",
        json={
            "assets": [
                {"asset_id": first.id, "target": "40"},
                {"asset_id": second.id, "target": "30"},
            ],
            "fixed_income_target": "30",
            "max_item_deviation": "50",
            "max_total_deviation": "50",
        },
    )
    assert flagged() == []


def test_deleting_the_subportfolio_deletes_its_targets(
    api: TestClient, session: Session
) -> None:
    """A meta é da subcarteira: apagar a subcarteira apaga as metas dela."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)

    api.delete(f"/api/subportfolios/{found.id}")

    assert session.scalar(select(func.count()).select_from(AssetTarget)) == 0


def test_plan_lists_each_item_before_and_after(
    api: TestClient, session: Session
) -> None:
    """Cada linha do plano traz as cotas e o valor antes e depois, e o desvio contra a
    meta; a compra soma cotas e o que o plano usa do aporte é o aporte menos a sobra."""
    found, first, second = _setup(session)
    _targets(api, found, first, second)

    body = api.post(
        "/api/rebalance/plan",
        json={"subportfolio_id": found.id, "amount": "300"},
    ).json()
    lines = {line["label"]: line for line in body["lines"]}

    assert Decimal(lines["EFGH11"]["quantity_before"]) == Decimal(10)
    assert Decimal(lines["EFGH11"]["quantity_after"]) == Decimal(17)
    assert lines["Renda fixa"]["quantity_before"] is None
    assert Decimal(lines["Renda fixa"]["value_after"]) == Decimal(350)
    assert Decimal(lines["Renda fixa"]["share_before"]) == Decimal("0.2")
    assert Decimal(body["total_before"]) == Decimal(1000)
    assert Decimal(body["total_after"]) == Decimal(1290)
    assert Decimal(body["used"]) == Decimal(290)
    assert abs(Decimal(lines["EFGH11"]["deviation_after"])) < abs(
        Decimal(lines["EFGH11"]["deviation_before"])
    )


def test_division_splits_the_portfolio_between_subportfolios_and_the_rest(
    api: TestClient, session: Session
) -> None:
    """A subcarteira pesa o que tem de membros e o que está fora dela fecha o total."""
    _setup(session)
    _asset(session, "IJKL11", "1", "1000", None)

    body = api.get("/api/subportfolios/division").json()
    slices = body["slices"]

    assert Decimal(body["total"]) == Decimal(2000)
    assert Decimal(slices[0]["value"]) == Decimal(1000)
    assert Decimal(slices[0]["share"]) == Decimal("0.5")
    assert slices[-1]["subportfolio_id"] is None
    assert Decimal(slices[-1]["value"]) == Decimal(1000)
