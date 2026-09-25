from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
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
    FixedIncomeInvestment,
    FixedIncomeMovement,
    Operation,
    PriceHistory,
)
from backend.domain.daily_series import DailyPoint
from backend.domain.performance import period_return, quota_series

DAY = date(2024, 3, 4)


def _point(value: str, inflow: str = "0", outflow: str = "0") -> DailyPoint:
    return DailyPoint(
        day=DAY,
        value=Decimal(value),
        inflow=Decimal(inflow),
        outflow=Decimal(outflow),
    )


def test_contribution_does_not_move_the_quota() -> None:
    """Um aporte compra cotas pelo valor do dia: de R$ 1.000, aportar R$ 500 e
    fechar em R$ 1.530 é render 2%."""
    quotas = quota_series([_point("1000", inflow="1000"), _point("1530", "500")])

    assert quotas == [1, Decimal("1.02")]


def test_full_sale_keeps_the_gain_of_the_day() -> None:
    """Vender tudo por R$ 1.100 o que valia R$ 1.000 na véspera é render 10%, e
    depois disso a cota para."""
    quotas = quota_series(
        [
            _point("1000", inflow="1000"),
            _point("0", outflow="1100"),
            _point("0"),
        ]
    )

    assert quotas == [1, Decimal("1.1"), Decimal("1.1")]


def test_periods_compound() -> None:
    """1% num dia e 2% no seguinte dão 3,02% nos dois, e o retorno de um trecho é a
    variação da cota nele."""
    quotas = quota_series(
        [_point("100", inflow="100"), _point("101"), _point("103.02")]
    )

    assert period_return(quotas, None, 2) == Decimal("0.0302")
    assert period_return(quotas, 1, 2) == Decimal("0.02")


def _buy(session: Session, ticker: str, asset_class: AssetClass, day: date) -> Asset:
    """Compra de 10 a R$ 10 em `day`, fechando a R$ 10 nele e a R$ 11 no dia útil
    seguinte."""
    asset = Asset(ticker=ticker, asset_class=asset_class)
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=day,
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(10),
        )
    )
    session.add(PriceHistory(asset_id=asset.id, price_date=day, close=Decimal(10)))
    session.add(
        PriceHistory(
            asset_id=asset.id, price_date=day + timedelta(days=1), close=Decimal(11)
        )
    )
    session.commit()
    return asset


def test_performance_filters_by_category_and_asset(
    api: TestClient, session: Session
) -> None:
    """A rentabilidade sai da cota do conjunto escolhido: a carteira, uma categoria
    ou um ativo. A renda fixa aplicada no mesmo dia dilui a alta da carteira."""
    asset = _buy(session, "ABCD11", AssetClass.FII, DAY)
    investment = FixedIncomeInvestment(
        label="CDB XYZ",
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=None,
        daily_liquidity=True,
    )
    session.add(investment)
    session.flush()
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=DAY,
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=Decimal(100),
        )
    )
    session.commit()
    end = str(DAY + timedelta(days=1))

    fii = api.get("/api/performance", params={"category": "fii", "end": end}).json()
    single = api.get(
        "/api/performance", params={"asset_id": asset.id, "end": end}
    ).json()
    total = api.get("/api/performance", params={"end": end}).json()

    assert Decimal(fii["period"]) == Decimal("0.1")
    assert fii["first_date"] == str(DAY)
    assert [point["day"] for point in fii["points"]] == [str(DAY), end]
    assert Decimal(single["period"]) == Decimal("0.1")
    assert Decimal("0.05") < Decimal(total["period"]) < Decimal("0.06")


def test_period_starts_at_the_close_before_it(
    api: TestClient, session: Session
) -> None:
    """O período começa no fechamento da véspera do início: o ponto de partida é
    zero, e a alta do primeiro dia do período conta."""
    _buy(session, "ABCD11", AssetClass.FII, DAY)
    next_day = str(DAY + timedelta(days=1))

    body = api.get(
        "/api/performance", params={"start": next_day, "end": next_day}
    ).json()

    assert body["start"] == str(DAY)
    assert [
        (point["day"], Decimal(point["cumulative_return"])) for point in body["points"]
    ] == [(str(DAY), 0), (next_day, Decimal("0.1"))]


def test_recent_returns_are_null_before_the_portfolio(
    api: TestClient, session: Session
) -> None:
    """Os últimos 24 meses ficam nulos numa carteira mais nova que isso."""
    _buy(session, "ABCD11", AssetClass.FII, date.today() - timedelta(days=90))

    body = api.get("/api/performance").json()

    assert body["last_24_months"] is None
    assert body["since_inception"] is not None


def test_start_after_end_is_refused(api: TestClient, session: Session) -> None:
    """Um período que começa depois de terminar volta 422."""
    _buy(session, "ABCD11", AssetClass.FII, DAY)

    response = api.get(
        "/api/performance", params={"start": "2024-03-10", "end": "2024-03-01"}
    )

    assert response.status_code == 422
