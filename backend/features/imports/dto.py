from __future__ import annotations

from datetime import date
from typing import Self

from pydantic import model_validator

from backend.core.dto import BaseDTO, DecimalStrIn
from backend.core.enum import (
    AssetClass,
    ImportSource,
    ImportStatus,
    IncomeType,
    OperationType,
)
from backend.domain.income import check_income
from backend.domain.position import check_quantity_and_price


class ImportedOperationDTO(BaseDTO):
    """Uma operação lida de arquivo: sai do parser, vai ao preview e volta no
    confirmar."""

    ticker: str
    operation_date: date
    operation_type: OperationType
    quantity: DecimalStrIn
    unit_price: DecimalStrIn

    @model_validator(mode="after")
    def _valid_for_type(self) -> Self:
        check_quantity_and_price(self.operation_type, self.quantity, self.unit_price)
        return self


class ImportedIncomeDTO(BaseDTO):
    """Um provento lido de arquivo, com o valor por unidade bruto e o valor líquido."""

    ticker: str
    payment_date: date
    income_type: IncomeType
    quantity: DecimalStrIn
    unit_price: DecimalStrIn
    amount: DecimalStrIn

    @model_validator(mode="after")
    def _valid(self) -> Self:
        check_income(self.quantity, self.unit_price, self.amount)
        return self


class IgnoredMovementDTO(BaseDTO):
    file: str
    ticker: str
    movement_date: str
    movement: str
    reason: str


class ImportFileDTO(BaseDTO):
    name: str
    source: ImportSource | None
    error: str | None


class PreviewRowDTO(ImportedOperationDTO):
    file: str
    status: ImportStatus


class IncomePreviewRowDTO(ImportedIncomeDTO):
    file: str
    status: ImportStatus


class NewAssetDTO(BaseDTO):
    ticker: str
    asset_class: AssetClass


class ImportPreviewDTO(BaseDTO):
    files: list[ImportFileDTO]
    rows: list[PreviewRowDTO]
    income_rows: list[IncomePreviewRowDTO]
    ignored: list[IgnoredMovementDTO]
    new_assets: list[NewAssetDTO]


class ImportConfirmDTO(BaseDTO):
    operations: list[ImportedOperationDTO]
    income: list[ImportedIncomeDTO]
    new_assets: list[NewAssetDTO]


class ImportResultDTO(BaseDTO):
    created: int
    skipped: int
    income_created: int
    income_skipped: int
    assets_created: list[str]
