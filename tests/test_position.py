from __future__ import annotations

from datetime import date
from decimal import Decimal
from itertools import count

import pytest

from backend.core.enum import OperationType
from backend.domain.position import (
    HoldingWindow,
    NegativePositionError,
    OperationRecord,
    Position,
    check_non_negative,
    current_positions,
    holding_windows,
    position_at,
    settle_day_trades,
)

_ids = count(1)


def _op(
    operation_type: OperationType,
    quantity: str,
    unit_price: str = "0",
    *,
    ticker: str = "ABCD11",
    day: date = date(2024, 2, 5),
) -> OperationRecord:
    return OperationRecord(
        id=next(_ids),
        ticker=ticker,
        operation_date=day,
        operation_type=operation_type,
        quantity=Decimal(quantity),
        unit_price=Decimal(unit_price),
    )


def _position(*operations: OperationRecord, ticker: str = "ABCD11") -> Position:
    return current_positions(operations)[ticker]


def test_buys_weight_the_average_price() -> None:
    """Compras ponderam o PM pela quantidade."""
    position = _position(
        _op(OperationType.BUY, "10", "10"), _op(OperationType.BUY, "30", "20")
    )

    assert position == Position(quantity=Decimal(40), average_price=Decimal("17.5"))
    assert position.total_cost == Decimal(700)


def test_partial_sell_keeps_average_price_and_full_sell_resets_it() -> None:
    """Venda parcial mantém o PM; zerar a posição zera o PM."""
    buy = _op(OperationType.BUY, "10", "10", day=date(2024, 2, 1))

    assert _position(buy, _op(OperationType.SELL, "4", "50")) == Position(
        quantity=Decimal(6), average_price=Decimal(10)
    )
    assert _position(buy, _op(OperationType.SELL, "10", "50")) == Position()


def test_bonus_and_split_keep_total_cost() -> None:
    """Bonificação fracionária e desdobro somam ações sem mudar o custo total."""
    position = _position(
        _op(OperationType.BUY, "10", "10"),
        _op(OperationType.BONUS, "0.5"),
        _op(OperationType.SPLIT, "10.5"),
    )

    assert position.quantity == Decimal(21)
    assert position.total_cost == Decimal(100)


def test_reverse_split_multiplies_quantity_by_the_factor() -> None:
    """Grupamento 10:1 grava o fator 0.1: a quantidade cai a um décimo e o PM
    sobe dez vezes."""
    position = _position(
        _op(OperationType.BUY, "100", "1"), _op(OperationType.REVERSE_SPLIT, "0.1")
    )

    assert position == Position(quantity=Decimal(10), average_price=Decimal(10))


def test_transfer_pair_carries_the_average_price() -> None:
    """Troca de ticker: a saída zera a origem e a entrada leva o PM da origem."""
    source = _op(OperationType.BUY, "8", "4.215", ticker="WXYZ33")
    positions = current_positions(
        [
            source,
            _op(OperationType.TRANSFER_OUT, "8", "4.215", ticker="WXYZ33"),
            _op(OperationType.TRANSFER_IN, "8", "4.215", ticker="WXYZ34"),
        ]
    )

    assert positions["WXYZ33"] == Position()
    assert positions["WXYZ34"] == Position(
        quantity=Decimal(8), average_price=Decimal("4.215")
    )


def test_operations_run_by_date_then_recording_order() -> None:
    """A ordem é a data e, no mesmo dia, a ordem de gravação, não a da lista."""
    buy = _op(OperationType.BUY, "10", "10", day=date(2024, 2, 5))
    sell = _op(OperationType.SELL, "10", "20", day=date(2024, 2, 5))
    rebuy = _op(OperationType.BUY, "10", "30", day=date(2024, 2, 5))

    position = _position(rebuy, sell, buy)

    assert position == Position(quantity=Decimal(10), average_price=Decimal(30))


def test_position_at_includes_operations_of_that_day() -> None:
    """A posição numa data conta as operações do próprio dia e ignora as depois."""
    operations = [
        _op(OperationType.BUY, "10", "10", day=date(2024, 2, 5)),
        _op(OperationType.BUY, "10", "30", day=date(2024, 2, 6)),
        _op(OperationType.BUY, "10", "10", ticker="WXYZ3", day=date(2024, 2, 5)),
    ]

    assert position_at(operations, "ABCD11", date(2024, 2, 5)) == Position(
        quantity=Decimal(10), average_price=Decimal(10)
    )
    assert position_at(operations, "ABCD11", date(2024, 2, 4)) == Position()


def test_negative_position_is_refused() -> None:
    """Vender mais do que se tem em alguma data do histórico é recusado."""
    operations = [
        _op(OperationType.SELL, "5", "20", day=date(2024, 2, 5)),
        _op(OperationType.BUY, "10", "10", day=date(2024, 2, 6)),
    ]

    with pytest.raises(NegativePositionError, match="ABCD11 ficaria negativa em 05/02"):
        check_non_negative(operations)


def test_day_trade_legs_leave_the_average_price_untouched() -> None:
    """Compra e venda pareadas no mesmo dia são day trade: a posição que já existia
    segue com o PM dela."""
    position = _position(
        _op(OperationType.BUY, "100", "10", day=date(2024, 2, 5)),
        _op(OperationType.BUY, "100", "20", day=date(2024, 2, 6)),
        _op(OperationType.SELL, "100", "25", day=date(2024, 2, 6)),
    )

    assert position == Position(quantity=Decimal(100), average_price=Decimal(10))


def test_selling_before_buying_on_the_same_day_is_accepted() -> None:
    """Vender e recomprar no mesmo dia sem posição é um day trade, não uma posição
    negativa."""
    operations = [
        _op(OperationType.SELL, "10", "20", day=date(2024, 2, 5)),
        _op(OperationType.BUY, "10", "18", day=date(2024, 2, 5)),
    ]

    check_non_negative(operations)
    assert current_positions(operations) == {}


def test_day_trade_pairs_first_buy_with_first_sell() -> None:
    """O pareamento segue a ordem das execuções, e só o que sobra move a posição."""
    settled, [trade] = settle_day_trades(
        [
            _op(OperationType.BUY, "10", "10", day=date(2024, 2, 5)),
            _op(OperationType.BUY, "10", "12", day=date(2024, 2, 5)),
            _op(OperationType.SELL, "15", "13", day=date(2024, 2, 5)),
        ]
    )

    assert trade.quantity == Decimal(15)
    assert trade.cost == Decimal(160)
    assert trade.proceeds == Decimal(195)
    [remaining] = settled
    assert (remaining.quantity, remaining.unit_price) == (Decimal(5), Decimal(12))


def test_holding_window_ends_when_the_position_is_closed() -> None:
    """A janela de um ativo zerado vai da primeira operação até a que zerou a
    posição; a de um ativo com posição fica aberta."""
    windows = holding_windows(
        [
            _op(OperationType.BUY, "10", "10", day=date(2024, 2, 5)),
            _op(OperationType.SELL, "10", "12", day=date(2024, 3, 5)),
            _op(OperationType.BUY, "5", "10", ticker="WXYZ3", day=date(2024, 2, 6)),
        ]
    )

    assert windows == {
        "ABCD11": HoldingWindow(start=date(2024, 2, 5), end=date(2024, 3, 5)),
        "WXYZ3": HoldingWindow(start=date(2024, 2, 6), end=None),
    }
