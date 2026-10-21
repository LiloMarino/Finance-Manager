from __future__ import annotations

from decimal import Decimal
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
    "redemption_order": "oldest_first",
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
    *,
    net: bool = False,
) -> Response:
    return api.post(
        f"/api/fixed-income/{investment_id}/movements",
        json={
            "movement_type": movement_type,
            "movement_date": movement_date,
            "amount": amount,
            "net": net,
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


def test_movement_can_be_edited(api: TestClient) -> None:
    investment = _create(api)
    [application] = investment["movements"]

    response = api.put(
        f"/api/fixed-income/movements/{application['id']}",
        json={
            "movement_type": "application",
            "movement_date": "2024-01-03",
            "amount": "1500.00",
        },
    )

    assert response.status_code == 200, response.text
    assert response.json()["movement_date"] == "2024-01-03"
    assert response.json()["amount"] == "1500.00"
    detail = api.get(f"/api/fixed-income/{investment['id']}").json()
    assert detail["movements"][0]["id"] == application["id"]
    assert detail["invested"] == "1500.00"


def test_movement_edit_checks_missing_invalid_and_ordering(api: TestClient) -> None:
    investment = _create(api)
    [application] = investment["movements"]
    redemption = _move(api, investment["id"], "redemption", "2024-03-01", "100")
    redemption_id = redemption.json()["id"]

    missing = api.put(
        "/api/fixed-income/movements/999999",
        json={
            "movement_type": "application",
            "movement_date": "2024-01-01",
            "amount": "1",
        },
    )
    invalid = api.put(
        f"/api/fixed-income/movements/{application['id']}",
        json={
            "movement_type": "application",
            "movement_date": "2024-01-02",
            "amount": "0",
        },
    )
    first_redemption = api.put(
        f"/api/fixed-income/movements/{application['id']}",
        json={
            "movement_type": "redemption",
            "movement_date": "2024-01-02",
            "amount": "100",
        },
    )
    after_maturity = api.put(
        f"/api/fixed-income/movements/{redemption_id}",
        json={
            "movement_type": "redemption",
            "movement_date": "2030-01-03",
            "amount": "100",
        },
    )

    assert missing.status_code == 404
    assert invalid.status_code == 422
    assert first_redemption.status_code == 422
    assert after_maturity.status_code == 422


def test_net_redemption_edit_matches_a_fresh_net_redemption(api: TestClient) -> None:
    """Trocar um resgate pelo bruto por um pelo líquido dá o mesmo bruto de um resgate
    novo pelo mesmo líquido: o valor antigo não entra na conta."""
    investment = _create(api)
    existing = _move(api, investment["id"], "redemption", "2024-07-01", "100")

    edited = api.put(
        f"/api/fixed-income/movements/{existing.json()['id']}",
        json={
            "movement_type": "redemption",
            "movement_date": "2024-07-01",
            "amount": "500.00",
            "net": True,
        },
    )
    comparison_investment = _create(api, label="CDB XYZ comparison")
    comparison = _move(
        api,
        comparison_investment["id"],
        "redemption",
        "2024-07-01",
        "500.00",
        net=True,
    )

    assert edited.status_code == 200, edited.text
    assert comparison.status_code == 201, comparison.text
    assert edited.json()["gross"] == comparison.json()["gross"]


def test_net_redemption_edit_with_the_same_net_keeps_the_gross(
    api: TestClient,
) -> None:
    """Reenviar o mesmo líquido na edição devolve o mesmo bruto, e a edição abre com
    o líquido que foi digitado."""
    investment = _create(api)
    created = _move(
        api, investment["id"], "redemption", "2024-07-01", "500.00", net=True
    ).json()

    edited = api.put(
        f"/api/fixed-income/movements/{created['id']}",
        json={
            "movement_type": "redemption",
            "movement_date": "2024-07-01",
            "amount": created["amount"],
            "net": created["net"],
        },
    ).json()

    assert (created["amount"], created["net"]) == ("500.00", True)
    assert edited["gross"] == created["gross"]


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


def test_summary_adds_titles_by_type(api: TestClient) -> None:
    """O resumo soma os títulos no total, por tipo e por liquidez: dois CDBs e uma
    LCI dão um grupo de cada, e o CDB de liquidez diária fica na fatia diária."""
    _create(api)
    _create(api, label="CDB ABC 2031", daily_liquidity=True)
    _create(api, label="LCI ABC", product_type="lci")

    body = api.get("/api/fixed-income/summary").json()
    listed = api.get("/api/fixed-income").json()

    assert [(group["product_type"], group["count"]) for group in body["by_type"]] == [
        ("cdb", 2),
        ("lci", 1),
    ]
    assert body["total"]["count"] == 3
    assert Decimal(body["total"]["invested"]) == Decimal(3000)
    assert Decimal(body["total"]["net_value"]) == sum(
        Decimal(item["net_value"]) for item in listed
    )
    assert (
        body["daily_liquidity"]["count"],
        body["at_maturity"]["count"],
    ) == (1, 2)
    assert Decimal(body["daily_share"]) == Decimal(
        body["daily_liquidity"]["gross_value"]
    ) / Decimal(body["total"]["gross_value"])


def test_net_redemption_is_stored_by_the_typed_net(api: TestClient) -> None:
    """O resgate pelo líquido guarda o líquido digitado, e o bruto dele passa do
    líquido pelo IR retido; a aplicação pelo líquido é gravada como veio."""
    investment = _create(api)

    redemption = _move(
        api, investment["id"], "redemption", "2024-07-01", "500.00", net=True
    )
    application = _move(
        api, investment["id"], "application", "2024-07-01", "300.00", net=True
    )

    assert redemption.status_code == 201, redemption.text
    assert (redemption.json()["amount"], redemption.json()["net"]) == ("500.00", True)
    assert Decimal(redemption.json()["gross"]) > Decimal(500)
    assert application.json()["net"] is False
    assert Decimal(application.json()["gross"]) == Decimal(300)


def _open_cash(api: TestClient) -> None:
    response = api.post(
        "/api/cash/checks", json={"check_date": "2024-01-01", "balance": "0.00"}
    )
    assert response.status_code == 204, response.text


def _redemptions_in_cash(api: TestClient) -> list[Decimal]:
    return [
        Decimal(entry["amount"]).quantize(Decimal("0.01"))
        for entry in api.get("/api/cash").json()["entries"]
        if entry["kind"] == "redemption"
    ]


def test_redemption_order_change_keeps_the_net_in_cash(api: TestClient) -> None:
    """Trocar a ordem do resgate parcial recalcula o bruto do resgate pelo líquido, e
    o saldo segue recebendo o líquido digitado."""
    investment = _create(api)
    _move(api, investment["id"], "application", "2024-06-03", "1000.00")
    redemption = _move(
        api, investment["id"], "redemption", "2024-08-01", "500.00", net=True
    ).json()
    _open_cash(api)

    reordered = api.put(
        f"/api/fixed-income/{investment['id']}",
        json={**TITLE, "redemption_order": "newest_first"},
    )
    [after] = [
        movement
        for movement in reordered.json()["movements"]
        if movement["id"] == redemption["id"]
    ]

    assert reordered.status_code == 200, reordered.text
    assert after["gross"] != redemption["gross"]
    assert _redemptions_in_cash(api) == [Decimal("500.00")]


def test_editing_an_earlier_redemption_keeps_later_nets(api: TestClient) -> None:
    """Editar um resgate pelo líquido não muda o líquido dos resgates depois dele."""
    investment = _create(api)
    _move(api, investment["id"], "application", "2024-06-03", "1000.00")
    first = _move(
        api, investment["id"], "redemption", "2024-07-01", "300.00", net=True
    ).json()
    _move(api, investment["id"], "redemption", "2024-08-01", "400.00", net=True)
    _open_cash(api)

    edited = api.put(
        f"/api/fixed-income/movements/{first['id']}",
        json={
            "movement_type": "redemption",
            "movement_date": "2024-07-01",
            "amount": "800.00",
            "net": True,
        },
    )

    assert edited.status_code == 200, edited.text
    assert sorted(_redemptions_in_cash(api)) == [Decimal("400.00"), Decimal("800.00")]


def test_fixed_income_list_tells_which_titles_are_held(api: TestClient) -> None:
    """O título está em carteira enquanto tem saldo: o resgatado por inteiro e o
    vencido não estão."""
    _create(api)
    redeemed = _create(api, label="CDB Resgatado")
    _move(api, redeemed["id"], "redemption", "2024-01-02", "1000.00")
    _create(api, label="CDB Vencido", maturity_date="2024-06-03")

    listed = {
        item["label"]: item["held"] for item in api.get("/api/fixed-income").json()
    }

    assert listed == {
        "CDB XYZ 2030": True,
        "CDB Resgatado": False,
        "CDB Vencido": False,
    }
