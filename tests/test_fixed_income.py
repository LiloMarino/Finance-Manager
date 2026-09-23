from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient
from httpx2 import Response

TITLE: dict[str, Any] = {
    "label": "CDB XYZ 2030",
    "indexer": "prefixed",
    "rate": "12",
    "maturity_date": "2030-01-02",
    "daily_liquidity": False,
    "tax_exempt": False,
}


def _create(api: TestClient, **changes: Any) -> dict[str, Any]:
    response = api.post("/api/fixed-income", json={**TITLE, **changes})
    assert response.status_code == 201, response.text
    return response.json()


def _move(
    api: TestClient,
    investment_id: int,
    movement_type: str,
    movement_date: str,
    amount: str,
) -> Response:
    return api.post(
        f"/api/fixed-income/{investment_id}/movements",
        json={
            "movement_type": movement_type,
            "movement_date": movement_date,
            "amount": amount,
        },
    )


def test_created_investment_is_listed_with_marking(api: TestClient) -> None:
    """Título criado aparece na lista, e a aplicação entra no principal com o
    valor marcado ao lado."""
    investment = _create(api)
    applied = _move(api, investment["id"], "application", "2024-01-02", "1000.00")

    listed = api.get("/api/fixed-income").json()

    assert applied.status_code == 201
    assert [item["label"] for item in listed] == ["CDB XYZ 2030"]
    assert listed[0]["invested"] == "1000.00"
    assert float(listed[0]["gross_value"]) > 1000


def test_detail_lists_movements_newest_first(api: TestClient) -> None:
    """O detalhe traz as movimentações da mais recente para a mais antiga."""
    investment = _create(api)
    _move(api, investment["id"], "application", "2024-01-02", "1000")
    _move(api, investment["id"], "redemption", "2024-03-01", "300")

    detail = api.get(f"/api/fixed-income/{investment['id']}").json()

    assert [m["movement_type"] for m in detail["movements"]] == [
        "redemption",
        "application",
    ]


def test_update_changes_terms(api: TestClient) -> None:
    """Editar troca os termos do título, e o nome segue único."""
    investment = _create(api)
    _create(api, label="LCI ABC")

    updated = api.put(
        f"/api/fixed-income/{investment['id']}",
        json={**TITLE, "indexer": "cdi", "rate": "110"},
    )
    clash = api.put(
        f"/api/fixed-income/{investment['id']}", json={**TITLE, "label": "LCI ABC"}
    )

    assert updated.status_code == 200
    assert (updated.json()["indexer"], updated.json()["rate"]) == ("cdi", "110")
    assert clash.status_code == 409


def test_investment_with_movements_cannot_be_deleted(api: TestClient) -> None:
    """Título com movimentação volta 409 com o motivo; sem movimentação, sai."""
    investment = _create(api)
    _move(api, investment["id"], "application", "2024-01-02", "1000")
    empty = _create(api, label="LCI ABC")

    blocked = api.delete(f"/api/fixed-income/{investment['id']}")
    deleted = api.delete(f"/api/fixed-income/{empty['id']}")

    assert blocked.status_code == 409
    assert "movimentações" in blocked.json()["detail"]
    assert deleted.status_code == 204


def test_redemption_before_first_application_is_refused(api: TestClient) -> None:
    """A primeira movimentação do título é uma aplicação: resgate antes dela é
    recusado, e apagar a aplicação que abre o título também."""
    investment = _create(api)
    early = _move(api, investment["id"], "redemption", "2024-01-02", "100")
    application = _move(api, investment["id"], "application", "2024-01-02", "1000")
    _move(api, investment["id"], "redemption", "2024-02-01", "100")

    removed = api.delete(f"/api/fixed-income/movements/{application.json()['id']}")

    assert early.status_code == 422
    assert removed.status_code == 422


def test_amount_and_rate_must_be_positive_strings(api: TestClient) -> None:
    """Valor zero, taxa zero e número JSON (float) são recusados com 422."""
    investment = _create(api)

    zero = _move(api, investment["id"], "application", "2024-01-02", "0")
    as_float = api.post(
        f"/api/fixed-income/{investment['id']}/movements",
        json={
            "movement_type": "application",
            "movement_date": "2024-01-02",
            "amount": 10.5,
        },
    )
    no_rate = api.post("/api/fixed-income", json={**TITLE, "label": "X", "rate": "0"})

    assert zero.status_code == 422
    assert as_float.status_code == 422
    assert no_rate.status_code == 422
