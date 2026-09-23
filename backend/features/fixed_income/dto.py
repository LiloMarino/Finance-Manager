from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import field_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import FixedIncomeMovementType, Indexer


class FixedIncomeInDTO(BaseDTO):
    label: str
    indexer: Indexer
    rate: DecimalStrIn
    maturity_date: date | None = None
    daily_liquidity: bool
    tax_exempt: bool

    @field_validator("label")
    @classmethod
    def _strip_label(cls, value: str) -> str:
        label = value.strip()
        if not label:
            raise ValueError("Informe o nome do título.")
        return label

    @field_validator("rate")
    @classmethod
    def _positive_rate(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("A taxa deve ser maior que zero.")
        return value


class FixedIncomeDTO(BaseDTO):
    """O título com a marcação em `as_of`: hoje, ou o vencimento se já passou."""

    id: int
    label: str
    indexer: Indexer
    rate: DecimalStr
    maturity_date: date | None
    daily_liquidity: bool
    tax_exempt: bool
    invested: DecimalStr
    gross_value: DecimalStr
    estimated_tax: DecimalStr
    net_value: DecimalStr
    as_of: date
    series_date: date | None


class MovementInDTO(BaseDTO):
    """Aplicação ou resgate, pelo valor bruto."""

    movement_date: date
    movement_type: FixedIncomeMovementType
    amount: DecimalStrIn

    @field_validator("amount")
    @classmethod
    def _positive_amount(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("O valor deve ser maior que zero.")
        return value


class MovementDTO(BaseDTO):
    id: int
    investment_id: int
    movement_date: date
    movement_type: FixedIncomeMovementType
    amount: DecimalStr


class FixedIncomeDetailDTO(FixedIncomeDTO):
    movements: list[MovementDTO]
