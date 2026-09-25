from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Self

from pydantic import model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import AssetClass, ImportSource, ImportStatus, OperationType

TRADES = (OperationType.BUY, OperationType.SELL)
CORPORATE_EVENTS = (
    OperationType.BONUS,
    OperationType.SPLIT,
    OperationType.REVERSE_SPLIT,
)


def check_quantity_and_price(
    operation_type: OperationType, quantity: Decimal, unit_price: Decimal
) -> None:
    """As mesmas regras das CHECK de `operations`, com mensagem legível na borda."""
    if quantity <= 0:
        raise ValueError("A quantidade deve ser maior que zero.")
    if operation_type in TRADES and unit_price <= 0:
        raise ValueError("Compra e venda precisam de preço maior que zero.")
    if operation_type in CORPORATE_EVENTS and unit_price != 0:
        raise ValueError("Bonificação, desdobro e grupamento não têm preço.")


class OperationDTO(BaseDTO):
    id: int
    asset_id: int
    ticker: str
    asset_class: AssetClass
    operation_date: date
    operation_type: OperationType
    quantity: DecimalStr
    unit_price: DecimalStr


class OperationInDTO(BaseDTO):
    """Compra, venda e evento corporativo."""

    asset_id: int
    operation_date: date
    operation_type: OperationType
    quantity: DecimalStrIn
    unit_price: DecimalStrIn

    @model_validator(mode="after")
    def _valid_for_type(self) -> Self:
        check_quantity_and_price(self.operation_type, self.quantity, self.unit_price)
        return self


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


class NewAssetDTO(BaseDTO):
    ticker: str
    asset_class: AssetClass


class ImportPreviewDTO(BaseDTO):
    files: list[ImportFileDTO]
    rows: list[PreviewRowDTO]
    ignored: list[IgnoredMovementDTO]
    new_assets: list[NewAssetDTO]


class ImportConfirmDTO(BaseDTO):
    operations: list[ImportedOperationDTO]
    new_assets: list[NewAssetDTO]


class ImportResultDTO(BaseDTO):
    created: int
    skipped: int
    assets_created: list[str]
