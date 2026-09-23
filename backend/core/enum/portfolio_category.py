from enum import StrEnum


class PortfolioCategory(StrEnum):
    """Categoria da carteira: as classes de ativo da B3, com o mesmo valor do
    `AssetClass`, mais a renda fixa."""

    STOCK = "stock"
    FII = "fii"
    ETF = "etf"
    BDR = "bdr"
    FIXED_INCOME = "fixed_income"
