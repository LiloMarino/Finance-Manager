from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    FixedIncomeMovementType,
    FixedIncomeType,
    IncomeType,
    Indexer,
    IndexSeries,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    IncomeEvent,
    IndexHistory,
    Operation,
    PriceHistory,
)
from backend.domain.daily_series import DailyPoint
from backend.domain.performance import period_return, quota_series

DAY = date(2024, 3, 4)


def _point(
    value: str, inflow: str = "0", outflow: str = "0", income: str = "0"
) -> DailyPoint:
    return DailyPoint(
        day=DAY,
        value=Decimal(value),
        inflow=Decimal(inflow),
        outflow=Decimal(outflow),
        income=Decimal(income),
    )


def test_income_raises_the_quota_on_the_payment_day() -> None:
    """Com o preço parado em R$ 1.000, um provento de R$ 10 é render 1% no dia em
    que caiu na conta."""
    quotas = quota_series([_point("1000", inflow="1000"), _point("1000", income="10")])

    assert quotas == [1, Decimal("1.01")]


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


def test_income_counts_in_the_return_and_not_in_the_invested(
    api: TestClient, session: Session
) -> None:
    """Um provento de R$ 11 sobre R$ 110 de posição soma 10% à alta do dia: a cota
    sobe 21%. Na evolução do patrimônio, o investido continua R$ 100."""
    asset = _buy(session, "ABCD11", AssetClass.FII, DAY)
    next_day = DAY + timedelta(days=1)
    session.add(
        IncomeEvent(
            asset_id=asset.id,
            payment_date=next_day,
            income_type=IncomeType.DISTRIBUTION,
            quantity=Decimal(10),
            unit_price=Decimal("1.1"),
            amount=Decimal(11),
        )
    )
    session.commit()

    performance = api.get("/api/performance", params={"end": str(next_day)}).json()
    evolution = api.get("/api/evolution", params={"end": str(next_day)}).json()

    assert Decimal(performance["period"]) == Decimal("0.21")
    assert [point["invested"] for point in evolution["points"]] == ["100", "100"]


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


def _index(session: Session, series: IndexSeries, values: dict[date, str]) -> None:
    session.add_all(
        IndexHistory(series=series, rate_date=day, value=Decimal(value))
        for day, value in values.items()
    )
    session.commit()


def test_benchmarks_share_the_days_and_base_of_the_period(
    api: TestClient, session: Session
) -> None:
    """Cada referência recomeça do zero na base do período e tem um ponto em cada
    dia da carteira. O "% do CDI" é o retorno do período sobre o do CDI."""
    _buy(session, "ABCD11", AssetClass.FII, DAY)
    next_day = DAY + timedelta(days=1)
    _index(session, IndexSeries.CDI, {DAY: "0.05", next_day: "0.05"})
    _index(session, IndexSeries.IBOV, {DAY: "120000", next_day: "126000"})

    body = api.get("/api/performance", params={"end": str(next_day)}).json()
    benchmarks = {found["series"]: found for found in body["benchmarks"]}

    cdi = benchmarks["cdi"]
    assert [
        (point["day"], Decimal(point["cumulative_return"])) for point in cdi["points"]
    ] == [(str(DAY), 0), (str(next_day), Decimal("0.0005"))]
    assert cdi["data_until"] == str(next_day)
    assert Decimal(benchmarks["ibov"]["period"]) == Decimal("0.05")
    assert benchmarks["ipca"]["period"] is None
    assert benchmarks["ipca"]["points"] == []
    assert Decimal(body["cdi_share"]) == Decimal(200)


def test_benchmark_period_starts_at_the_close_before_it(
    api: TestClient, session: Session
) -> None:
    """Com o período começando no segundo dia, o IBOV parte do fechamento da véspera,
    como a carteira."""
    _buy(session, "ABCD11", AssetClass.FII, DAY)
    next_day = str(DAY + timedelta(days=1))
    _index(
        session,
        IndexSeries.IBOV,
        {DAY: "120000", DAY + timedelta(days=1): "114000"},
    )

    body = api.get(
        "/api/performance", params={"start": next_day, "end": next_day}
    ).json()
    [ibov] = [found for found in body["benchmarks"] if found["series"] == "ibov"]

    assert [Decimal(point["cumulative_return"]) for point in ibov["points"]] == [
        0,
        Decimal("-0.05"),
    ]
    assert body["cdi_share"] is None
