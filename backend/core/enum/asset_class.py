from enum import StrEnum


class AssetClass(StrEnum):
    STOCK = "stock"
    FII = "fii"
    ETF = "etf"
    BDR = "bdr"
