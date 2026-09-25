from __future__ import annotations

from datetime import date
from typing import Self

from pydantic import model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import AssetClass, IncomeType, PortfolioCategory
from backend.domain.income import check_income


class IncomeEventDTO(BaseDTO):
    """`unit_price` é o bruto por unidade, e `amount` o líquido recebido."""

    id: int
    asset_id: int
    ticker: str
    asset_class: AssetClass
    payment_date: date
    income_type: IncomeType
    quantity: DecimalStr
    unit_price: DecimalStr
    amount: DecimalStr


class IncomeEventInDTO(BaseDTO):
    asset_id: int
    payment_date: date
    income_type: IncomeType
    quantity: DecimalStrIn
    unit_price: DecimalStrIn
    amount: DecimalStrIn

    @model_validator(mode="after")
    def _valid(self) -> Self:
        check_income(self.quantity, self.unit_price, self.amount)
        return self


class IncomeListDTO(BaseDTO):
    events: list[IncomeEventDTO]
    total: DecimalStr


class CategoryAmountDTO(BaseDTO):
    """`share` em fração do total do período: 0,25 é 25%."""

    category: PortfolioCategory
    amount: DecimalStr
    share: DecimalStr


class IncomeBarDTO(BaseDTO):
    """`period` é `2024` na visão por ano e `2024-03` na por mês."""

    period: str
    total: DecimalStr
    categories: list[CategoryAmountDTO]


class IncomePerformanceDTO(BaseDTO):
    """`total` e os recentes contam desde o primeiro provento até hoje; as barras e as
    categorias, só o período pedido."""

    total: DecimalStr
    last_6_months: DecimalStr
    last_12_months: DecimalStr
    last_24_months: DecimalStr
    period_total: DecimalStr
    bars: list[IncomeBarDTO]
    categories: list[CategoryAmountDTO]


class IncomeAssetDTO(BaseDTO):
    """`amount` e `share` são da janela pedida; `accumulated`, desde sempre.

    `dividend_yield` e `yield_on_cost` usam os últimos 12 meses: o líquido pago por
    unidade dividido pelo preço de hoje e pelo preço médio. Nulos sem posição, sem
    cotação ou sem PM."""

    asset_id: int
    ticker: str
    category: PortfolioCategory
    amount: DecimalStr
    share: DecimalStr
    quantity: DecimalStr
    dividend_yield: DecimalStr | None
    yield_on_cost: DecimalStr | None
    last_amount: DecimalStr
    last_payment_date: date
    accumulated: DecimalStr


class IncomeDistributionDTO(BaseDTO):
    months: int
    total: DecimalStr
    categories: list[CategoryAmountDTO]
    assets: list[IncomeAssetDTO]
