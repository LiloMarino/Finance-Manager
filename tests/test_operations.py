from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient


def _asset(api: TestClient, ticker: str = "ABCD11", asset_class: str = "fii") -> int:
    response = api.post(
        "/api/assets", json={"ticker": ticker, "asset_class": asset_class}
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _operation(
    api: TestClient,
    asset_id: int,
    operation_type: str,
    quantity: str,
    unit_price: str = "0",
    day: str = "2024-02-05",
) -> dict[str, Any]:
    response = api.post(
        "/api/operations",
        json={
            "asset_id": asset_id,
            "operation_date": day,
            "operation_type": operation_type,
            "quantity": quantity,
            "unit_price": unit_price,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def _positions(api: TestClient) -> list[tuple[str, str, str, str]]:
    return [
        (p["ticker"], p["quantity"], p["average_price"], p["total_cost"])
        for p in api.get("/api/portfolio").json()["positions"]
    ]


def test_operation_crud_moves_the_position(api: TestClient) -> None:
    """Criar, editar e apagar operação mexe na posição recalculada."""
    asset_id = _asset(api)
    first = _operation(api, asset_id, "buy", "10", "10")
    _operation(api, asset_id, "buy", "10", "20", day="2024-02-06")

    assert _positions(api) == [("ABCD11", "20", "15", "300")]

    edited = api.put(
        f"/api/operations/{first['id']}",
        json={
            "asset_id": asset_id,
            "operation_date": "2024-02-05",
            "operation_type": "buy",
            "quantity": "30",
            "unit_price": "10",
        },
    )
    assert edited.status_code == 200
    assert _positions(api) == [("ABCD11", "40", "12.5", "500.0")]

    assert api.delete(f"/api/operations/{first['id']}").status_code == 204
    assert _positions(api) == [("ABCD11", "10", "20", "200")]


def test_operations_are_filtered_by_asset_type_and_period(api: TestClient) -> None:
    """A lista filtra por ativo, tipo e período, com as mais recentes primeiro."""
    fund = _asset(api)
    stock = _asset(api, "WXYZ3", "stock")
    _operation(api, fund, "buy", "10", "10", day="2024-01-10")
    _operation(api, fund, "sell", "5", "12", day="2024-02-10")
    _operation(api, stock, "buy", "1", "30", day="2024-02-15")

    def listed(query: str) -> list[tuple[str, str, str]]:
        return [
            (op["ticker"], op["operation_type"], op["operation_date"])
            for op in api.get(f"/api/operations{query}").json()
        ]

    assert listed("") == [
        ("WXYZ3", "buy", "2024-02-15"),
        ("ABCD11", "sell", "2024-02-10"),
        ("ABCD11", "buy", "2024-01-10"),
    ]
    assert listed(f"?asset_id={fund}&operation_type=buy") == [
        ("ABCD11", "buy", "2024-01-10")
    ]
    assert listed("?start=2024-02-01&end=2024-02-12") == [
        ("ABCD11", "sell", "2024-02-10")
    ]


def test_selling_more_than_the_position_is_refused(api: TestClient) -> None:
    """Venda maior que a posição volta 422 com o ativo e a data, e não grava."""
    asset_id = _asset(api)
    _operation(api, asset_id, "buy", "10", "10")

    response = api.post(
        "/api/operations",
        json={
            "asset_id": asset_id,
            "operation_date": "2024-02-06",
            "operation_type": "sell",
            "quantity": "11",
            "unit_price": "10",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "A posição de ABCD11 ficaria negativa em 06/02/2024"
    }
    assert len(api.get("/api/operations").json()) == 1


def test_deleting_a_buy_that_backs_a_later_sell_is_refused(api: TestClient) -> None:
    """Apagar a compra que sustenta uma venda posterior é recusado."""
    asset_id = _asset(api)
    buy = _operation(api, asset_id, "buy", "10", "10")
    _operation(api, asset_id, "sell", "10", "12", day="2024-02-06")

    response = api.delete(f"/api/operations/{buy['id']}")

    assert response.status_code == 422
    assert len(api.get("/api/operations").json()) == 2


def test_price_must_match_the_operation_type(api: TestClient) -> None:
    """Compra sem preço e evento com preço são recusados na borda."""
    asset_id = _asset(api)

    for operation_type, unit_price in (("buy", "0"), ("bonus", "1")):
        response = api.post(
            "/api/operations",
            json={
                "asset_id": asset_id,
                "operation_date": "2024-02-05",
                "operation_type": operation_type,
                "quantity": "1",
                "unit_price": unit_price,
            },
        )
        assert response.status_code == 422


def test_asset_with_operations_cannot_be_deleted(api: TestClient) -> None:
    """Apagar ativo com operação volta 409 com o motivo; sem operação, apaga."""
    used = _asset(api)
    unused = _asset(api, "WXYZ3", "stock")
    _operation(api, used, "buy", "1", "10")

    refused = api.delete(f"/api/assets/{used}")

    assert refused.status_code == 409
    assert "ABCD11 tem operações" in refused.json()["detail"]
    assert api.delete(f"/api/assets/{unused}").status_code == 204


def test_asset_ticker_is_normalized_and_unique(api: TestClient) -> None:
    """O ticker é gravado em maiúsculas, e repetir um existente volta 409."""
    created = api.post("/api/assets", json={"ticker": " abcd11 ", "asset_class": "fii"})
    duplicate = api.post("/api/assets", json={"ticker": "ABCD11", "asset_class": "etf"})

    assert created.json()["ticker"] == "ABCD11"
    assert duplicate.status_code == 409
