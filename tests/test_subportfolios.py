from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    FixedIncomeMovementType,
    FixedIncomeType,
    IncomeType,
    Indexer,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    IncomeEvent,
    Operation,
    PriceHistory,
)

TODAY = date.today()
START = TODAY - timedelta(days=60)


def _identity(name: str) -> dict[str, str]:
    return {"name": name, "icon": "banknote", "color": "green"}


def _subportfolio(api: TestClient, name: str = "Dividendos") -> dict[str, Any]:
    response = api.post("/api/subportfolios", json=_identity(name))
    assert response.status_code == 201, response.text
    return response.json()


def _set_members(
    api: TestClient,
    subportfolio_id: int,
    asset_ids: list[int],
    investment_ids: list[int] | None = None,
) -> None:
    response = api.put(
        f"/api/subportfolios/{subportfolio_id}/members",
        json={"asset_ids": asset_ids, "investment_ids": investment_ids or []},
    )
    assert response.status_code == 204, response.text


def _held_asset(session: Session, ticker: str, first: str, last: str) -> int:
    """Ativo com 10 cotas compradas em `START` a `first`, fechando hoje a `last`."""
    asset = Asset(ticker=ticker, asset_class=AssetClass.STOCK)
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=START,
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(first),
        )
    )
    session.add(PriceHistory(asset_id=asset.id, price_date=START, close=Decimal(first)))
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(last)))
    session.commit()
    return asset.id


def _investment(session: Session, amount: str) -> int:
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
    return investment.id


def test_subportfolio_name_is_unique(api: TestClient) -> None:
    """Duas subcarteiras com o mesmo nome voltam 409, na criação e na renomeação."""
    first = _subportfolio(api, "  Dividendos ")
    _subportfolio(api, "Crescimento")

    clash = api.post("/api/subportfolios", json=_identity("Dividendos"))
    rename_clash = api.put(
        f"/api/subportfolios/{first['id']}", json=_identity("Crescimento")
    )

    assert first["name"] == "Dividendos"
    assert clash.status_code == 409
    assert rename_clash.status_code == 409


def test_subportfolio_keeps_icon_and_color(api: TestClient) -> None:
    """O ícone e a cor escolhidos na criação voltam na lista, e a edição troca os
    dois junto com o nome."""
    created = _subportfolio(api, "Dividendos")

    updated = api.put(
        f"/api/subportfolios/{created['id']}",
        json={"name": "Renda", "icon": "sprout", "color": "purple"},
    )
    listed = api.get("/api/subportfolios").json()

    assert (created["icon"], created["color"]) == ("banknote", "green")
    assert updated.status_code == 204, updated.text
    assert [(item["name"], item["icon"], item["color"]) for item in listed] == [
        ("Renda", "sprout", "purple")
    ]


def test_subportfolio_rejects_unknown_icon(api: TestClient) -> None:
    """Ícone fora da lista volta 422 e não cria nada."""
    response = api.post(
        "/api/subportfolios",
        json={"name": "Dividendos", "icon": "abcd", "color": "green"},
    )

    assert response.status_code == 422
    assert api.get("/api/subportfolios").json() == []


def test_setting_members_moves_asset_from_other_subportfolio(
    api: TestClient, session: Session
) -> None:
    """Cada ativo está em uma subcarteira só: pô-lo em outra tira-o da primeira, e o
    que não veio na lista volta à carteira geral."""
    first_id = _held_asset(session, "ABCD3", "10", "10")
    second_id = _held_asset(session, "EFGH3", "10", "10")
    income = _subportfolio(api)
    growth = _subportfolio(api, "Crescimento")
    _set_members(api, income["id"], [first_id, second_id])

    _set_members(api, growth["id"], [first_id])
    _set_members(api, income["id"], [])

    listed = {item["name"]: item for item in api.get("/api/subportfolios").json()}
    assert [asset["ticker"] for asset in listed["Crescimento"]["assets"]] == ["ABCD3"]
    assert listed["Dividendos"]["assets"] == []
    assert api.get(f"/api/assets/{second_id}").json()["subportfolio_id"] is None


def test_deleting_subportfolio_returns_members_to_general_portfolio(
    api: TestClient, session: Session
) -> None:
    """Apagar a subcarteira mantém o ativo e o título, agora só na carteira geral."""
    asset_id = _held_asset(session, "ABCD3", "10", "10")
    investment_id = _investment(session, "500")
    found = _subportfolio(api)
    _set_members(api, found["id"], [asset_id], [investment_id])

    deleted = api.delete(f"/api/subportfolios/{found['id']}")

    assert deleted.status_code == 204
    assert api.get(f"/api/assets/{asset_id}").json()["subportfolio_id"] is None
    [investment] = api.get("/api/fixed-income").json()
    assert investment["subportfolio_id"] is None


def test_members_must_exist(api: TestClient) -> None:
    """Ativo ou título que não existe na filiação volta 422."""
    found = _subportfolio(api)

    response = api.put(
        f"/api/subportfolios/{found['id']}/members",
        json={"asset_ids": [999], "investment_ids": []},
    )

    assert response.status_code == 422


def test_portfolio_filtered_by_subportfolio_has_only_its_positions(
    api: TestClient, session: Session
) -> None:
    """A carteira de uma subcarteira tem só os membros dela, e o total e as frações
    são sobre ela."""
    member_id = _held_asset(session, "ABCD3", "10", "30")
    _held_asset(session, "EFGH3", "10", "10")
    investment_id = _investment(session, "700")
    found = _subportfolio(api)
    _set_members(api, found["id"], [member_id], [investment_id])

    general = api.get("/api/portfolio").json()
    body = api.get("/api/portfolio", params={"subportfolio_id": found["id"]}).json()

    assert Decimal(general["total"]) == Decimal(1100)
    assert Decimal(body["total"]) == Decimal(1000)
    assert [position["ticker"] for position in body["positions"]] == ["ABCD3"]
    assert Decimal(body["positions"][0]["share"]) == Decimal("0.3")
    assert Decimal(body["fixed_income"][0]["share"]) == Decimal("0.7")


def test_evolution_and_performance_follow_subportfolio_members(
    api: TestClient, session: Session
) -> None:
    """A evolução e a rentabilidade da subcarteira são as dos membros de hoje: trocar
    o membro troca também o passado dela, e a carteira geral não muda."""
    doubled_id = _held_asset(session, "ABCD3", "10", "20")
    flat_id = _held_asset(session, "EFGH3", "10", "10")
    found = _subportfolio(api)
    params = {"subportfolio_id": found["id"]}

    _set_members(api, found["id"], [doubled_id])
    doubled = api.get("/api/performance", params=params).json()
    doubled_total = api.get("/api/evolution", params=params).json()["total"]
    _set_members(api, found["id"], [flat_id])
    flat = api.get("/api/performance", params=params).json()
    flat_total = api.get("/api/evolution", params=params).json()["total"]

    assert Decimal(doubled["since_inception"]) == Decimal(1)
    assert Decimal(doubled_total) == Decimal(200)
    assert Decimal(flat["since_inception"]) == Decimal(0)
    assert Decimal(flat_total) == Decimal(100)
    assert Decimal(api.get("/api/evolution").json()["total"]) == Decimal(300)


def test_income_filtered_by_subportfolio(api: TestClient, session: Session) -> None:
    """Os proventos da subcarteira são os dos ativos dela, na lista e no total."""
    member_id = _held_asset(session, "ABCD3", "10", "10")
    other_id = _held_asset(session, "EFGH3", "10", "10")
    for asset_id, amount in ((member_id, "5"), (other_id, "7")):
        session.add(
            IncomeEvent(
                asset_id=asset_id,
                payment_date=TODAY - timedelta(days=10),
                income_type=IncomeType.DIVIDEND,
                quantity=Decimal(10),
                unit_price=Decimal(amount) / 10,
                amount=Decimal(amount),
            )
        )
    session.commit()
    found = _subportfolio(api)
    _set_members(api, found["id"], [member_id])
    params = {"subportfolio_id": found["id"]}

    listed = api.get("/api/income", params=params).json()
    performance = api.get("/api/income/performance", params=params).json()
    distribution = api.get("/api/income/distribution", params=params).json()

    assert [event["ticker"] for event in listed["events"]] == ["ABCD3"]
    assert Decimal(performance["total"]) == Decimal(5)
    assert [asset["ticker"] for asset in distribution["assets"]] == ["ABCD3"]


def test_unknown_subportfolio_is_not_found(api: TestClient) -> None:
    """Uma visão pedida para uma subcarteira que não existe volta 404."""
    params = {"subportfolio_id": 999}

    responses = [
        api.get("/api/portfolio", params=params),
        api.get("/api/evolution", params=params),
        api.get("/api/performance", params=params),
        api.get("/api/income", params=params),
    ]

    assert [response.status_code for response in responses] == [404] * 4


def test_ticker_change_merge_keeps_subportfolio(
    api: TestClient, session: Session
) -> None:
    """Quando a troca de ticker junta dois ativos, o que fica herda a subcarteira do
    que sai."""
    found = _subportfolio(api)
    source = api.post(
        "/api/assets",
        json={
            "ticker": "ABCD3",
            "asset_class": "stock",
            "subportfolio_id": found["id"],
        },
    ).json()
    target = api.post(
        "/api/assets", json={"ticker": "ABCD4", "asset_class": "stock"}
    ).json()
    session.add(
        Operation(
            asset_id=source["id"],
            operation_date=date(2024, 1, 10),
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(10),
        )
    )
    session.commit()

    merged = api.post(
        f"/api/assets/{source['id']}/ticker-change",
        json={"ticker": "ABCD4", "effective_date": "2024-06-03"},
    )

    assert merged.status_code == 200, merged.text
    assert merged.json()["id"] == target["id"]
    assert merged.json()["subportfolio_id"] == found["id"]
