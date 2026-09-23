from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, OperationType
from backend.core.models.models import Asset, Operation


def _etf_with_gain(session: Session) -> None:
    """ETF comprado em janeiro e vendido em fevereiro de 2024 com R$ 5.000 de
    ganho: R$ 750 de DARF, que vence em março."""
    asset = Asset(ticker="IJKL11", asset_class=AssetClass.ETF)
    session.add(asset)
    session.flush()
    for day, operation_type, price in (
        (date(2024, 1, 10), OperationType.BUY, "100"),
        (date(2024, 2, 5), OperationType.SELL, "150"),
    ):
        session.add(
            Operation(
                asset_id=asset.id,
                operation_date=day,
                operation_type=operation_type,
                quantity=Decimal(100),
                unit_price=Decimal(price),
            )
        )
    session.commit()


def _month(api: TestClient, year: int, month: int) -> dict[str, object]:
    [item] = [
        item
        for item in api.get("/api/tax/months").json()
        if (item["year"], item["month"]) == (year, month)
    ]
    return item


def test_months_list_the_darf_due(api: TestClient, session: Session) -> None:
    """Cada mês desde a primeira operação é apurado, e o da venda traz o DARF, o
    vencimento e o status de vencido."""
    _etf_with_gain(session)

    february = _month(api, 2024, 2)

    assert Decimal(str(february["darf_amount"])) == Decimal(750)
    assert february["due_date"] == "2024-03-29"
    assert february["status"] == "overdue"
    assert _month(api, 2024, 1)["status"] == "none"


def test_payment_is_recorded_updated_and_deleted(
    api: TestClient, session: Session
) -> None:
    """Registrar o DARF pago muda o status para pago; registrar de novo corrige o
    valor; apagar volta ao status anterior."""
    _etf_with_gain(session)
    url = "/api/tax/darf/2024/2/payment"

    created = api.put(url, json={"paid_on": "2024-03-20", "amount": "750.00"})
    assert created.status_code == 200
    assert created.json()["status"] == "paid"

    api.put(url, json={"paid_on": "2024-03-21", "amount": "751.00"})
    assert _month(api, 2024, 2)["payment"] == {
        "paid_on": "2024-03-21",
        "amount": "751.00",
    }

    assert api.delete(url).status_code == 204
    assert _month(api, 2024, 2)["status"] == "overdue"


def test_payment_outside_assessed_months_is_refused(
    api: TestClient, session: Session
) -> None:
    """Não há DARF a registrar num mês anterior à primeira operação, nem valor
    zerado."""
    _etf_with_gain(session)

    before = api.put(
        "/api/tax/darf/2023/12/payment",
        json={"paid_on": "2024-01-20", "amount": "10.00"},
    )
    zero = api.put(
        "/api/tax/darf/2024/2/payment",
        json={"paid_on": "2024-03-20", "amount": "0"},
    )

    assert before.status_code == 404
    assert zero.status_code == 422


def test_period_brings_opening_and_closing_positions(
    api: TestClient, session: Session
) -> None:
    """O recorte de um mês traz a posição no fim do mês anterior, a do fim do mês e
    a apuração daquele mês."""
    _etf_with_gain(session)

    body = api.get("/api/tax/period", params={"year": 2024, "month": 2}).json()

    assert [p["ticker"] for p in body["opening"]] == ["IJKL11"]
    assert body["closing"] == []
    assert [(m["year"], m["month"]) for m in body["months"]] == [(2024, 2)]

    year = api.get("/api/tax/period", params={"year": 2024}).json()
    assert year["opening"] == []
    assert (year["start"], year["end"]) == ("2024-01-01", "2024-12-31")
