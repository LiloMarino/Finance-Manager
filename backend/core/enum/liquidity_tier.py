from enum import StrEnum


class LiquidityTier(StrEnum):
    """O prazo em que o patrimônio vira dinheiro, do mais rápido ao mais lento."""

    DAILY = "daily"
    INTERMEDIATE = "intermediate"
    LOCKED = "locked"
