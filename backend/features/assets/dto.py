from __future__ import annotations

from pydantic import field_validator

from backend.core.dto import BaseDTO
from backend.core.enum import AssetClass


class AssetDTO(BaseDTO):
    id: int
    ticker: str
    asset_class: AssetClass
    cnpj: str | None
    sector: str | None


class AssetInDTO(BaseDTO):
    ticker: str
    asset_class: AssetClass
    cnpj: str | None = None
    sector: str | None = None

    @field_validator("ticker")
    @classmethod
    def _normalize_ticker(cls, value: str) -> str:
        ticker = value.strip().upper()
        if not ticker:
            raise ValueError("Informe o ticker.")
        return ticker

    @field_validator("cnpj", "sector")
    @classmethod
    def _blank_is_none(cls, value: str | None) -> str | None:
        return (value or "").strip() or None
