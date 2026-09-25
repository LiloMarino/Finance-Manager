from __future__ import annotations

from datetime import date
from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import ImportStatus
from backend.core.models.models import Asset
from backend.features.assets.dto import TickerChangeInDTO
from backend.features.assets.service import change_ticker
from backend.features.imports.dto import ImportConfirmDTO
from backend.features.imports.importing import (
    ParsedFile,
    confirm_import,
    preview_import,
)
from backend.features.imports.nubank_note import parse_nubank_note


def _asset(api: TestClient, ticker: str, asset_class: str = "bdr") -> int:
    response = api.post(
        "/api/assets", json={"ticker": ticker, "asset_class": asset_class}
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _buy(
    api: TestClient, asset_id: int, day: str, quantity: str, unit_price: str
) -> None:
    response = api.post(
        "/api/operations",
        json={
            "asset_id": asset_id,
            "operation_date": day,
            "operation_type": "buy",
            "quantity": quantity,
            "unit_price": unit_price,
        },
    )
    assert response.status_code == 201, response.text


def _change(api: TestClient, asset_id: int, ticker: str, day: str) -> Any:
    return api.post(
        f"/api/assets/{asset_id}/ticker-change",
        json={"ticker": ticker, "effective_date": day},
    )


def _closing(api: TestClient, year: int, month: int) -> list[tuple[str, str, str]]:
    body = api.get("/api/tax/period", params={"year": year, "month": month}).json()
    return [(p["ticker"], p["quantity"], p["average_price"]) for p in body["closing"]]


def test_ticker_change_keeps_the_asset_and_dates_each_ticker(api: TestClient) -> None:
    """A troca é uma renomeação: o ativo e a posição continuam os mesmos, e cada
    tela mostra o ticker vigente na data, inclusive o IRPF do ano anterior."""
    asset_id = _asset(api, "WXYZ33")
    _buy(api, asset_id, "2023-06-01", "10", "10")

    response = _change(api, asset_id, "WXYZ34", "2024-01-15")
    _buy(api, asset_id, "2024-02-01", "5", "13")

    assert response.status_code == 200, response.text
    assert response.json()["previous_tickers"] == [
        {"ticker": "WXYZ33", "valid_until": "2024-01-14"}
    ]
    assert [
        (op["ticker"], op["operation_date"]) for op in api.get("/api/operations").json()
    ] == [("WXYZ34", "2024-02-01"), ("WXYZ33", "2023-06-01")]
    assert [p["ticker"] for p in api.get("/api/portfolio").json()["positions"]] == [
        "WXYZ34"
    ]
    assert _closing(api, 2023, 12) == [("WXYZ33", "10", "10")]
    assert _closing(api, 2024, 2) == [("WXYZ34", "15", "11")]
    irpf_2023 = api.get("/api/tax/irpf/2023").json()["assets"]
    assert [item["ticker"] for item in irpf_2023] == ["WXYZ33"]
    assert "WXYZ33" in irpf_2023[0]["description"]
    assert [
        item["ticker"] for item in api.get("/api/tax/irpf/2024").json()["assets"]
    ] == ["WXYZ34"]


def test_change_to_existing_asset_merges_both(api: TestClient) -> None:
    """Trocar para um ticker que já é ativo junta os dois num só: a posição do
    ticker antigo continua no novo, com o PM dela, e cada mês mostra o ticker
    da época."""
    source = _asset(api, "WXYZ33")
    target = _asset(api, "WXYZ34")
    _buy(api, source, "2024-01-10", "4", "4")
    _buy(api, source, "2024-01-11", "4", "5")
    _buy(api, target, "2024-03-01", "2", "6")

    response = _change(api, source, "WXYZ34", "2024-02-05")

    assert response.status_code == 200, response.text
    assert response.json()["id"] == target
    assert _closing(api, 2024, 1) == [("WXYZ33", "8", "4.5")]
    assert _closing(api, 2024, 2) == [("WXYZ34", "8", "4.5")]
    assert _closing(api, 2024, 3) == [("WXYZ34", "10", "4.8")]
    assert api.get(f"/api/assets/{source}").status_code == 404


def test_merge_is_refused_with_source_operation_after_the_change(
    api: TestClient,
) -> None:
    """Operação do ticker antigo depois da troca não tem como ser dele: a junção
    é recusada com o motivo."""
    source = _asset(api, "WXYZ33")
    target = _asset(api, "WXYZ34")
    _buy(api, source, "2024-01-10", "4", "4")
    _buy(api, source, "2024-03-10", "1", "4")
    _buy(api, target, "2024-02-10", "1", "4")

    response = _change(api, source, "WXYZ34", "2024-02-05")

    assert response.status_code == 422
    assert "WXYZ33 tem operação a partir de 05/02/2024" in response.json()["detail"]


def test_merge_is_refused_with_target_operation_before_the_change(
    api: TestClient,
) -> None:
    """Operação do ticker novo antes da troca também impede a junção."""
    source = _asset(api, "WXYZ33")
    target = _asset(api, "WXYZ34")
    _buy(api, source, "2024-01-10", "4", "4")
    _buy(api, target, "2024-01-20", "1", "4")

    response = _change(api, source, "WXYZ34", "2024-02-05")

    assert response.status_code == 422
    assert "WXYZ34 tem operação antes de 05/02/2024" in response.json()["detail"]


def test_previous_ticker_cannot_be_reused(api: TestClient) -> None:
    """Um ticker antigo continua sendo do ativo que o teve: nenhum outro ativo
    nasce com ele."""
    asset_id = _asset(api, "WXYZ33")
    _change(api, asset_id, "WXYZ34", "2024-01-15")

    response = api.post("/api/assets", json={"ticker": "WXYZ33", "asset_class": "bdr"})

    assert response.status_code == 409
    assert response.json()["detail"] == "WXYZ33 é um ticker antigo de WXYZ34."


def test_change_must_come_after_the_previous_one(api: TestClient) -> None:
    """Uma troca nova começa depois da anterior."""
    asset_id = _asset(api, "WXYZ33")
    _change(api, asset_id, "WXYZ34", "2024-01-15")

    response = _change(api, asset_id, "WXYZ35", "2024-01-10")

    assert response.status_code == 422


def test_note_with_previous_ticker_is_already_imported(session: Session) -> None:
    """Reimportar uma nota anterior à troca acha o ativo pelo ticker antigo: a
    operação já existe e nenhum ativo novo aparece."""
    note = ParsedFile(
        name="nota.pdf",
        operations=parse_nubank_note(
            "\n".join(
                [
                    "NOTA DE NEGOCIAÇÃO",
                    "Nu Investimentos S.A. - CTVM",
                    "Data pregão 05/02/2024",
                    "BOVESPA C VISTA ABCD11 CI 10 R$ 10,50 R$ 105,00 D",
                ]
            )
        ),
    )
    first = preview_import(session, [note])
    confirm_import(
        session,
        ImportConfirmDTO(
            operations=[*first.rows], income=[], new_assets=first.new_assets
        ),
    )
    asset_id = session.scalars(select(Asset.id)).one()
    change_ticker(
        session,
        asset_id,
        TickerChangeInDTO(ticker="ABCD12", effective_date=date(2024, 6, 1)),
    )

    again = preview_import(session, [note])

    assert [(row.ticker, row.status) for row in again.rows] == [
        ("ABCD12", ImportStatus.EXISTING)
    ]
    assert again.new_assets == []
