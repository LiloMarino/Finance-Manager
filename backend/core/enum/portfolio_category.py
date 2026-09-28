from enum import StrEnum


class PortfolioCategory(StrEnum):
    """Categoria da carteira: as classes de ativo da B3, com o mesmo valor do
    `AssetClass`, a renda fixa e o saldo de investimento."""

    STOCK = "stock"
    FII = "fii"
    ETF = "etf"
    BDR = "bdr"
    FIXED_INCOME = "fixed_income"
    CASH = "cash"
