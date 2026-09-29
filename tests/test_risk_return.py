from __future__ import annotations

import math
from datetime import date, timedelta
from decimal import Decimal

import pytest
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
from backend.domain.risk import annualized_volatility, daily_returns

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


def test_volatility_of_constant_returns_is_zero() -> None:
    """Render sempre o mesmo por dia, como um título pós-fixado, é risco zero."""
    assert annualized_volatility([0.0005] * 30) == pytest.approx(0)


def test_volatility_is_annualized_by_trading_days() -> None:
    """Alternar +1% e -1% dá desvio-padrão diário de cerca de 1%, e o ano de 252
    pregões multiplica por √252: perto de 16% ao ano."""
    returns = [0.01, -0.01] * 15

    volatility = annualized_volatility(returns)

    assert volatility == pytest.approx(0.01 * math.sqrt(30 / 29) * math.sqrt(252))


def test_too_few_returns_leave_volatility_empty() -> None:
    """Com menos de 20 retornos diários, a volatilidade fica sem valor."""
    assert annualized_volatility([0.01, -0.01] * 9 + [0.01]) is None


def test_days_without_position_are_left_out() -> None:
    """O dia sem posição na véspera e sem entrada não tem retorno; o dia da compra
    parte do valor aplicado, e o seguinte rende sobre o fechamento dele."""
    returns = daily_returns(
        [_point("0"), _point("1000", inflow="1000"), _point("1100")]
    )

    assert returns == [None, pytest.approx(0), pytest.approx(0.1)]


def test_income_enters_the_return() -> None:
    """Com o preço parado em R$ 1.000, um provento de R$ 10 é render 1% no dia."""
    returns = daily_returns(
        [_point("1000", inflow="1000"), _point("1000", income="10")]
    )

    assert returns[1] == pytest.approx(0.01)


def _buy(
    session: Session, ticker: str, closes: list[str], *, sell_on: int | None = None
) -> None:
    """Compra de 10 a R$ 10 em `DAY`, com um fechamento por dia útil a partir dele;
    com `sell_on`, vende tudo nesse dia útil pelo fechamento dele."""
    asset = Asset(ticker=ticker, asset_class=AssetClass.STOCK)
    session.add(asset)
    session.flush()
    days = [DAY + timedelta(days=offset) for offset in range(len(closes))]
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=DAY,
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(10),
        )
    )
    if sell_on is not None:
        session.add(
            Operation(
                asset_id=asset.id,
                operation_date=days[sell_on],
                operation_type=OperationType.SELL,
                quantity=Decimal(10),
                unit_price=Decimal(closes[sell_on]),
            )
        )
    session.add_all(
        PriceHistory(asset_id=asset.id, price_date=day, close=Decimal(close))
        for day, close in zip(days, closes, strict=True)
    )
    session.commit()


def test_endpoint_lists_held_lines_and_the_portfolio(
    api: TestClient, session: Session
) -> None:
    """Os itens são o que tem valor no fim do período, ativo ou título, e o ponto da
    carteira é a mesma rentabilidade da tela Rentabilidade, que conta também o
    ativo vendido no meio."""
    _buy(session, "ABCD3", ["10", "11", "12", "12"])
    _buy(session, "EFGH3", ["10", "9", "12", "12"], sell_on=2)
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
    end = str(DAY + timedelta(days=3))

    body = api.get("/api/risk-return", params={"end": end}).json()
    performance = api.get("/api/performance", params={"end": end}).json()

    assert [item["label"] for item in body["items"]] == ["ABCD3", "CDB XYZ"]
    stock = body["items"][0]
    assert Decimal(stock["risk"]["period_return"]) == Decimal("0.2")
    assert Decimal(stock["value"]) == Decimal(120)
    assert stock["risk"]["volatility"] is None
    assert stock["risk"]["returns"] == 4
    assert body["end"] == end
    assert Decimal(body["portfolio"]["period_return"]) == Decimal(performance["period"])


def test_endpoint_without_positions_is_empty(api: TestClient) -> None:
    """Sem nenhuma movimentação, não há ponto da carteira nem itens."""
    body = api.get("/api/risk-return").json()

    assert body == {"start": None, "end": None, "portfolio": None, "items": []}
