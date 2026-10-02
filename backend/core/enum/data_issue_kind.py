from enum import StrEnum


class DataIssueKind(StrEnum):
    """As pendências do app: o DARF a pagar e os problemas de dado que afetam algum
    número."""

    DARF_DUE = "darf_due"
    MISSING_PRICES = "missing_prices"
    LATE_SERIES = "late_series"
    FIXED_INCOME_WITHOUT_APPLICATION = "fixed_income_without_application"
    MISSING_CNPJ = "missing_cnpj"
    UNCLASSIFIED_ASSET = "unclassified_asset"
    IDLE_CASH = "idle_cash"
    REBALANCE_BREACH = "rebalance_breach"
