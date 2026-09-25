from __future__ import annotations

from datetime import date

from pydantic import field_validator

from backend.core.dto import BaseDTO
from backend.core.enum import AssetClass


def normalize_ticker(value: str) -> str:
    ticker = value.strip().upper()
    if not ticker:
        raise ValueError("Informe o ticker.")
    return ticker


class PreviousTickerDTO(BaseDTO):
    """Um ticker antigo, vigente até `valid_until`, inclusive."""

    ticker: str
    valid_until: date


class AssetDTO(BaseDTO):
    id: int
    ticker: str
    asset_class: AssetClass
    cnpj: str | None
    sector: str | None
    previous_tickers: list[PreviousTickerDTO]


class AssetInDTO(BaseDTO):
    ticker: str
    asset_class: AssetClass
    cnpj: str | None = None
    sector: str | None = None

    @field_validator("ticker")
    @classmethod
    def _normalize_ticker(cls, value: str) -> str:
        return normalize_ticker(value)

    @field_validator("cnpj", "sector")
    @classmethod
    def _blank_is_none(cls, value: str | None) -> str | None:
        return (value or "").strip() or None


class TickerChangeInDTO(BaseDTO):
    """A troca de ticker: o ativo passa a se chamar `ticker` a partir de
    `effective_date`, inclusive."""

    ticker: str
    effective_date: date

    @field_validator("ticker")
    @classmethod
    def _normalize_ticker(cls, value: str) -> str:
        return normalize_ticker(value)
