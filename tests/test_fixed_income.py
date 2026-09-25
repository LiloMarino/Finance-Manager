from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient
from httpx2 import Response

TITLE: dict[str, Any] = {
    "label": "CDB XYZ 2030",
    "product_type": "cdb",
    "indexer": "prefixed",
    "rate": "12",
    "maturity_date": "2030-01-02",
    "daily_liquidity": False,
}
APPLICATION = {"movement_date": "2024-01-02", "amount": "1000.00"}


def _post(api: TestClient, **changes: Any) -> Response:
    return api.post(
        "/api/fixed-income", json={**TITLE, "application": APPLICATION, **changes}
    )


def _create(api: TestClient, **changes: Any) -> dict[str, Any]:
    response = _post(api, **changes)
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


def test_investment_is_created_with_its_first_application(api: TestClient) -> None:
    """O título nasce com a primeira aplicação, que entra no principal com o valor
    marcado ao lado."""
    investment = _create(api)

    listed = api.get("/api/fixed-income").json()

    assert [m["movement_type"] for m in investment["movements"]] == ["application"]
    assert [item["label"] for item in listed] == ["CDB XYZ 2030"]
    assert listed[0]["invested"] == "1000.00"
    assert float(listed[0]["gross_value"]) > 1000


def test_invalid_first_application_creates_nothing(api: TestClient) -> None:
    """Aplicação inicial com valor zero recusa o cadastro inteiro."""
    response = _post(api, application={**APPLICATION, "amount": "0"})

    assert response.status_code == 422
    assert api.get("/api/fixed-income").json() == []


def test_tax_exemption_follows_product_type(api: TestClient) -> None:
    """LCI é isenta e CDB é tributado, pelo tipo do produto."""
    cdb = _create(api)
    lci = _create(api, label="LCI ABC", product_type="lci")

    assert (cdb["tax_exempt"], lci["tax_exempt"]) == (False, True)


def test_treasury_requires_its_own_indexer(api: TestClient) -> None:
    """O Tesouro Selic só aceita a Selic, e o IPCA+ só o IPCA."""
    wrong = _post(api, label="Tesouro", product_type="treasury_selic", indexer="cdi")
    right = _post(
        api, label="Tesouro IPCA+", product_type="treasury_ipca", indexer="ipca"
    )

    assert wrong.status_code == 422
    assert right.status_code == 201


def test_selic_rate_is_a_spread_that_may_be_zero(api: TestClient) -> None:
    """Na Selic a taxa é o spread: zero e negativo são aceitos, e no CDI não."""
    selic = {"product_type": "treasury_selic", "indexer": "selic"}
    zero = _post(api, label="Tesouro Selic", rate="0", **selic)
    negative = _post(api, label="Tesouro Selic 2", rate="-0.02", **selic)
    cdi_zero = _post(api, label="CDB CDI", indexer="cdi", rate="0")

    assert zero.status_code == 201
    assert negative.status_code == 201
    assert cdi_zero.status_code == 422


def test_detail_lists_movements_newest_first(api: TestClient) -> None:
    """O detalhe traz as movimentações da mais recente para a mais antiga."""
    investment = _create(api)
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
    emptied = _create(api, label="LCI ABC")
    [application] = emptied["movements"]
    api.delete(f"/api/fixed-income/movements/{application['id']}")

    blocked = api.delete(f"/api/fixed-income/{investment['id']}")
    deleted = api.delete(f"/api/fixed-income/{emptied['id']}")

    assert blocked.status_code == 409
    assert "movimentações" in blocked.json()["detail"]
    assert deleted.status_code == 204


def test_redemption_before_first_application_is_refused(api: TestClient) -> None:
    """A primeira movimentação do título é uma aplicação: resgate antes dela é
    recusado, e apagar a aplicação que abre o título também."""
    investment = _create(api)
    [application] = investment["movements"]
    early = _move(api, investment["id"], "redemption", "2024-01-01", "100")
    _move(api, investment["id"], "redemption", "2024-02-01", "100")

    removed = api.delete(f"/api/fixed-income/movements/{application['id']}")

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
    no_rate = _post(api, label="X", rate="0")

    assert zero.status_code == 422
    assert as_float.status_code == 422
    assert no_rate.status_code == 422
