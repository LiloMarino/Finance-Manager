from enum import StrEnum


class DarfStatus(StrEnum):
    """A situação do mês apurado, do ponto de vista do DARF."""

    PAID = "paid"
    DUE = "due"
    OVERDUE = "overdue"
    CARRIED = "carried"
    EXEMPT = "exempt"
    COMPENSATED = "compensated"
    NONE = "none"
