from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import field_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import CashEntryKind


class CashEntryDTO(BaseDTO):
    """Uma linha do extrato derivado. `amount` é o efeito no saldo, com sinal, e
    `record_id` é a conferência ou o saque gravado que gerou a linha."""

    entry_date: date
    kind: CashEntryKind
    label: str | None
    amount: DecimalStr
    balance: DecimalStr
    record_id: int | None


class CashDTO(BaseDTO):
    """`balance` e `opened_on` são nulos antes da primeira conferência. O extrato
    vem do mais recente para o mais antigo. `above_threshold` é o saldo parado que
    aparece em Saúde dos dados."""

    opened_on: date | None
    balance: DecimalStr | None
    alert_threshold: DecimalStr
    above_threshold: bool
    entries: list[CashEntryDTO]


class CashCheckInDTO(BaseDTO):
    """O saldo do extrato no fim do dia."""

    check_date: date
    balance: DecimalStrIn

    @field_validator("balance")
    @classmethod
    def _non_negative(cls, value: Decimal) -> Decimal:
        if value < 0:
            raise ValueError("O saldo não pode ser negativo.")
        return value


class CashWithdrawalInDTO(BaseDTO):
    withdrawal_date: date
    amount: DecimalStrIn

    @field_validator("amount")
    @classmethod
    def _positive(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("O valor deve ser maior que zero.")
        return value


class CashSettingsInDTO(BaseDTO):
    alert_threshold: DecimalStrIn

    @field_validator("alert_threshold")
    @classmethod
    def _non_negative(cls, value: Decimal) -> Decimal:
        if value < 0:
            raise ValueError("O limite não pode ser negativo.")
        return value
