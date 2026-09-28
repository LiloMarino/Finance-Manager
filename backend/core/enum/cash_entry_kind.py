from enum import StrEnum


class CashEntryKind(StrEnum):
    """O que moveu o saldo de investimento. `deposit` é o aporte de fora que cobre a
    compra maior que o saldo, e `check` é a conferência com o extrato, pela
    diferença contra o saldo derivado."""

    OPENING = "opening"
    SALE = "sale"
    INCOME = "income"
    REDEMPTION = "redemption"
    MATURITY = "maturity"
    DEPOSIT = "deposit"
    PURCHASE = "purchase"
    APPLICATION = "application"
    WITHDRAWAL = "withdrawal"
    CHECK = "check"
