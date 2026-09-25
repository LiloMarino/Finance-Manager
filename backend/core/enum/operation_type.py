from enum import StrEnum


class OperationType(StrEnum):
    BUY = "buy"
    SELL = "sell"
    BONUS = "bonus"
    SPLIT = "split"
    REVERSE_SPLIT = "reverse_split"
