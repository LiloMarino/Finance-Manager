from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Self

from pydantic import field_validator, model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import FixedIncomeMovementType, FixedIncomeType, Indexer
from backend.domain.fixed_income import terms_problem


class FixedIncomeInDTO(BaseDTO):
    """Os termos do título. Na Selic, `rate` é o spread, que pode ser zero ou
    negativo; nos outros indexadores, é maior que zero."""

    label: str
    product_type: FixedIncomeType
    indexer: Indexer
    rate: DecimalStrIn
    maturity_date: date | None = None
    daily_liquidity: bool
    subportfolio_id: int | None = None

    @field_validator("label")
    @classmethod
    def _strip_label(cls, value: str) -> str:
        label = value.strip()
        if not label:
            raise ValueError("Informe o nome do título.")
        return label

    @model_validator(mode="after")
    def _terms_match(self) -> Self:
        problem = terms_problem(self.product_type, self.indexer, self.rate)
        if problem is not None:
            raise ValueError(problem)
        return self


class FixedIncomeDTO(BaseDTO):
    """O título com a marcação em `as_of`: hoje, ou o vencimento se já passou. O
    título vencido (`matured`) foi resgatado para o saldo e vale zero.
    `subportfolio_id` nulo é título só da carteira geral."""

    id: int
    label: str
    product_type: FixedIncomeType
    indexer: Indexer
    rate: DecimalStr
    maturity_date: date | None
    daily_liquidity: bool
    subportfolio_id: int | None
    tax_exempt: bool
    matured: bool
    invested: DecimalStr
    gross_value: DecimalStr
    estimated_tax: DecimalStr
    net_value: DecimalStr
    as_of: date
    series_date: date | None


class FixedIncomeTotalsDTO(BaseDTO):
    """A soma de um grupo de títulos, na marcação de hoje. `gross_result` é o bruto
    menos o aplicado, e `gross_return` a fração dele sobre o aplicado."""

    count: int
    invested: DecimalStr
    gross_value: DecimalStr
    estimated_tax: DecimalStr
    net_value: DecimalStr
    gross_result: DecimalStr
    gross_return: DecimalStr | None


class FixedIncomeTypeTotalsDTO(FixedIncomeTotalsDTO):
    product_type: FixedIncomeType


class FixedIncomeSummaryDTO(BaseDTO):
    """Os títulos que ainda não venceram, somados no total, por tipo (na ordem dos
    tipos) e por liquidez: os de liquidez diária e os que só viram dinheiro no
    vencimento. `daily_share` e `at_maturity_share` são as frações do bruto, nulas sem
    nenhum título. O vencido já
    foi resgatado para o saldo e fica fora da soma."""

    total: FixedIncomeTotalsDTO
    by_type: list[FixedIncomeTypeTotalsDTO]
    daily_liquidity: FixedIncomeTotalsDTO
    at_maturity: FixedIncomeTotalsDTO
    daily_share: DecimalStr | None
    at_maturity_share: DecimalStr | None


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
