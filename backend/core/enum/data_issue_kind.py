from enum import StrEnum


class DataIssueKind(StrEnum):
    """Os tipos de problema de dado que afetam algum número do app."""

    MISSING_PRICES = "missing_prices"
    LATE_SERIES = "late_series"
    FIXED_INCOME_WITHOUT_APPLICATION = "fixed_income_without_application"
    MISSING_CNPJ = "missing_cnpj"
    UNCLASSIFIED_ASSET = "unclassified_asset"
