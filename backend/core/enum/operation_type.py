from enum import StrEnum


class OperationType(StrEnum):
    BUY = "buy"
    SELL = "sell"
    BONUS = "bonus"
    SPLIT = "split"
    REVERSE_SPLIT = "reverse_split"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
