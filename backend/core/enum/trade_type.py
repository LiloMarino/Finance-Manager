from enum import StrEnum


class TradeType(StrEnum):
    """Operação comum (a posição atravessa o dia) ou day trade."""

    SWING = "swing"
    DAY_TRADE = "day_trade"
