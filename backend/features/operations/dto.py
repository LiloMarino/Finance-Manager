from __future__ import annotations

from datetime import date
from typing import Self

from pydantic import model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import AssetClass, OperationType
from backend.domain.position import check_quantity_and_price


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
