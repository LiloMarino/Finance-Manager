from __future__ import annotations

from datetime import date
from decimal import Decimal

from backend.core.enum import OperationType
from backend.domain.position import OperationRecord
from backend.domain.settlement import Settlement, missing_notes


def _trade(day: date, operation_type: OperationType, quantity: str) -> OperationRecord:
    return OperationRecord(
        id=0,
        ticker="ABCD11",
        operation_date=day,
        operation_type=operation_type,
        quantity=Decimal(quantity),
        unit_price=Decimal(10),
    )


def _settled(day: date, operation_type: OperationType, quantity: str) -> Settlement:
    return Settlement(
        ticker="ABCD11",
        settlement_date=day,
        operation_type=operation_type,
        quantity=Decimal(quantity),
    )


def test_settlement_matches_the_day_sum_of_the_trades() -> None:
    """A B3 liquida as execuções do pregão somadas: duas compras de 5 cobrem a
    liquidação de 10."""
    trades = [
        _trade(date(2024, 2, 5), OperationType.BUY, "5"),
        _trade(date(2024, 2, 5), OperationType.BUY, "5"),
    ]

    assert (
        missing_notes([_settled(date(2024, 2, 7), OperationType.BUY, "10")], trades)
        == []
    )


def test_buy_and_sell_on_the_same_day_settle_the_difference() -> None:
    """Compra e venda do mesmo pregão se compensam: comprar 3 e vender 1 liquida a
    entrada de 2."""
    trades = [
        _trade(date(2024, 2, 5), OperationType.BUY, "3"),
        _trade(date(2024, 2, 5), OperationType.SELL, "1"),
    ]

    assert (
        missing_notes([_settled(date(2024, 2, 7), OperationType.BUY, "2")], trades)
        == []
    )


def test_each_trading_day_covers_one_settlement() -> None:
    """Duas liquidações iguais pedem dois pregões: com uma nota só, a segunda
    liquidação aponta a nota que falta."""
    settlements = [
        _settled(date(2024, 2, 7), OperationType.BUY, "10"),
        _settled(date(2024, 2, 8), OperationType.BUY, "10"),
    ]
    trades = [_trade(date(2024, 2, 5), OperationType.BUY, "10")]

    assert missing_notes(settlements, trades) == [settlements[1]]


def test_trade_after_the_settlement_does_not_cover_it() -> None:
    """O pregão vem antes da liquidação: a compra de depois é outra operação."""
    settlement = _settled(date(2024, 2, 7), OperationType.BUY, "10")
    trades = [_trade(date(2024, 2, 9), OperationType.BUY, "10")]

    assert missing_notes([settlement], trades) == [settlement]
