from enum import StrEnum


class IncomeForm(StrEnum):
    """A ficha do IRPF em que o provento entra."""

    EXEMPT = "exempt"
    EXCLUSIVE = "exclusive"
