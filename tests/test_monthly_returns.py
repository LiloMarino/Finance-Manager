from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, OperationType
from backend.core.models.models import Asset, Operation, PriceHistory
from backend.domain.daily_series import DailyPoint
from backend.domain.performance import monthly_returns, quota_series

DAYS = [date(2024, 1, 15), date(2024, 1, 31), date(2024, 2, 29), date(2024, 3, 28)]
QUOTAS = [Decimal("1.05"), Decimal("1.1"), Decimal("1.21"), Decimal("1.089")]


def test_months_compound_into_the_year() -> None:
    """Cada mês vai do último fechamento do anterior ao último dele; o primeiro parte
    da cota 1. O ano é o produto dos meses: 1,1 * 1,1 * 0,9 = 1,089."""
    [year] = monthly_returns(DAYS, QUOTAS)

    assert year.year == 2024
    assert year.months[:3] == [Decimal("0.1"), Decimal("0.1"), Decimal("-0.1")]
    assert year.year_return == Decimal("0.089")
    assert year.accumulated == Decimal("0.089")


def test_months_outside_the_series_are_null() -> None:
    """Os meses antes do primeiro dia e depois do último ficam nulos."""
    [year] = monthly_returns(DAYS, QUOTAS)

    assert year.months[3:] == [None] * 9


def test_accumulated_compounds_the_years() -> None:
    """O ano seguinte parte do fechamento do anterior, e o acumulado compõe os anos:
    1,089 * 1,1 - 1."""
    days = [*DAYS, date(2025, 1, 31)]
    quotas = [*QUOTAS, Decimal("1.1979")]

    first, second = monthly_returns(days, quotas)

    assert first.year_return == Decimal("0.089")
    assert second.months[0] == Decimal("0.1")
    assert second.year_return == Decimal("0.1")
    assert second.accumulated == Decimal("0.1979")


def test_contribution_mid_month_does_not_change_the_month() -> None:
    """Um aporte no meio do mês compra cotas pelo valor do dia: subir 10% antes dele
    e 10% depois é render 21% no mês, com ou sem o aporte."""

    def point(day: date, value: str, inflow: str = "0") -> DailyPoint:
        return DailyPoint(
            day=day,
            value=Decimal(value),
            inflow=Decimal(inflow),
            outflow=Decimal(0),
            income=Decimal(0),
        )

    points = [
        point(date(2024, 1, 31), "1000", inflow="1000"),
        point(date(2024, 2, 15), "1100"),
        point(date(2024, 2, 16), "2100", inflow="1000"),
        point(date(2024, 2, 29), "2310"),
    ]

    [year] = monthly_returns([p.day for p in points], quota_series(points))

    assert year.months[1] == Decimal("0.21")


def _price(session: Session, asset: Asset, day: date, close: str) -> None:
    session.add(PriceHistory(asset_id=asset.id, price_date=day, close=Decimal(close)))


def test_monthly_endpoint_lists_best_worst_and_counts(
    api: TestClient, session: Session
) -> None:
    """A rota traz os anos da carteira, o melhor e o pior mês e quantos meses subiram
    e caíram. Mês parado não conta como positivo nem como negativo."""
    asset = Asset(ticker="ABCD11", asset_class=AssetClass.FII)
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 3, 4),
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(10),
        )
    )
    _price(session, asset, date(2024, 3, 4), "10")
    _price(session, asset, date(2024, 4, 30), "11")
    _price(session, asset, date(2024, 5, 31), "9.9")
    session.commit()

    body = api.get("/api/performance/monthly").json()

    first = body["years"][0]
    assert first["year"] == 2024
    assert first["months"][:2] == [None, None]
    assert [Decimal(value) for value in first["months"][2:5]] == [
        0,
        Decimal("0.1"),
        Decimal("-0.1"),
    ]
    assert body["best_month"] == {"year": 2024, "month": 4, "value": "0.1"}
    assert (body["worst_month"]["month"], Decimal(body["worst_month"]["value"])) == (
        5,
        Decimal("-0.1"),
    )
    assert body["positive_months"] == 1
    assert body["negative_months"] == 1
    assert body["months"] >= 3
    assert [found["series"] for found in body["benchmarks"]] == ["cdi", "ipca", "ibov"]
