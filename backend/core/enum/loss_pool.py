from enum import StrEnum


class LossPool(StrEnum):
    """Conjunto de operações cujos prejuízos se compensam entre si: as comuns de
    ações, ETF e BDR; o day trade delas; e o FII, à parte."""

    COMMON = "common"
    DAY_TRADE = "day_trade"
    FII = "fii"
