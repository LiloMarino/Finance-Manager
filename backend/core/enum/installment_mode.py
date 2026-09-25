from enum import StrEnum


class InstallmentMode(StrEnum):
    """Compra: o valor é o preço, dividido nas parcelas. Adiantamento: o valor é o de
    cada parcela que falta."""

    PURCHASE = "purchase"
    PREPAYMENT = "prepayment"
