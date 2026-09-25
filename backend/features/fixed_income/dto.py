from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Self

from pydantic import field_validator, model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import FixedIncomeMovementType, FixedIncomeType, Indexer
from backend.domain.fixed_income import TREASURY_INDEXER


class FixedIncomeInDTO(BaseDTO):
    """Os termos do título. Na Selic, `rate` é o spread, que pode ser zero ou
    negativo; nos outros indexadores, é maior que zero."""

    label: str
    product_type: FixedIncomeType
    indexer: Indexer
    rate: DecimalStrIn
    maturity_date: date | None = None
    daily_liquidity: bool

    @field_validator("label")
    @classmethod
    def _strip_label(cls, value: str) -> str:
        label = value.strip()
        if not label:
            raise ValueError("Informe o nome do título.")
        return label

    @model_validator(mode="after")
    def _terms_match(self) -> Self:
        treasury = TREASURY_INDEXER.get(self.product_type)
        if treasury is not None and self.indexer is not treasury:
            raise ValueError("O título do Tesouro tem o indexador do próprio nome.")
        if self.indexer is not Indexer.SELIC and self.rate <= 0:
            raise ValueError("A taxa deve ser maior que zero.")
        return self


class FixedIncomeDTO(BaseDTO):
    """O título com a marcação em `as_of`: hoje, ou o vencimento se já passou."""

    id: int
    label: str
    product_type: FixedIncomeType
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


class ApplicationInDTO(BaseDTO):
    """Uma aplicação, pelo valor bruto."""

    movement_date: date
    amount: DecimalStrIn

    @field_validator("amount")
    @classmethod
    def _positive_amount(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("O valor deve ser maior que zero.")
        return value


class FixedIncomeCreateDTO(FixedIncomeInDTO):
    """O título nasce com a primeira aplicação."""

    application: ApplicationInDTO


class MovementInDTO(ApplicationInDTO):
    """Aplicação ou resgate, pelo valor bruto."""

    movement_type: FixedIncomeMovementType


class MovementDTO(BaseDTO):
    id: int
    investment_id: int
    movement_date: date
    movement_type: FixedIncomeMovementType
    amount: DecimalStr


class FixedIncomeDetailDTO(FixedIncomeDTO):
    movements: list[MovementDTO]
