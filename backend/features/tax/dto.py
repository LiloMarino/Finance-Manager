from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import field_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import AssetClass, DarfStatus, LossPool, TradeType


class CategoryResultDTO(BaseDTO):
    """`exempt` marca o ganho comum com ações que a isenção do mês tirou da base."""

    asset_class: AssetClass
    trade_type: TradeType
    pool: LossPool
    result: DecimalStr
    sales: DecimalStr
    exempt: bool


class PoolResultDTO(BaseDTO):
    """Um conjunto de compensação no mês: o líquido, o prejuízo que ele consumiu ou
    somou, e o imposto. `rate` vai de 0 a 1."""

    pool: LossPool
    net: DecimalStr
    loss_before: DecimalStr
    compensated: DecimalStr
    taxable: DecimalStr
    rate: DecimalStr
    tax: DecimalStr
    loss_after: DecimalStr


class DarfPaymentDTO(BaseDTO):
    paid_on: date
    amount: DecimalStr


class MonthlyTaxDTO(BaseDTO):
    """A apuração do mês. `darf_amount` e `due_date` existem quando o imposto,
    somado ao que vinha carregado, chega ao mínimo do DARF."""

    year: int
    month: int
    categories: list[CategoryResultDTO]
    stock_sales: DecimalStr
    exempt_profit: DecimalStr
    pools: list[PoolResultDTO]
    gross_result: DecimalStr
    compensated: DecimalStr
    taxable: DecimalStr
    tax: DecimalStr
    carried_before: DecimalStr
    carried_after: DecimalStr
    darf_amount: DecimalStr | None
    due_date: date | None
    payment: DarfPaymentDTO | None
    status: DarfStatus


class PeriodPositionDTO(BaseDTO):
    """Posição num limite do período, pelo custo fiscal."""

    asset_id: int
    ticker: str
    asset_class: AssetClass
    quantity: DecimalStr
    average_price: DecimalStr
    total_cost: DecimalStr


class PeriodReportDTO(BaseDTO):
    """Um mês ou um ano: as posições na abertura (fim do dia anterior a `start`) e
    no fechamento (fim de `end`), e a apuração de cada mês do recorte."""

    start: date
    end: date
    opening: list[PeriodPositionDTO]
    closing: list[PeriodPositionDTO]
    months: list[MonthlyTaxDTO]


class DarfPaymentInDTO(BaseDTO):
    paid_on: date
    amount: DecimalStrIn

    @field_validator("amount")
    @classmethod
    def _positive_amount(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("O valor pago deve ser maior que zero.")
        return value


class IrpfAssetDTO(BaseDTO):
    """Um item da ficha Bens e Direitos, pelo custo de aquisição em 31/12."""

    asset_id: int
    ticker: str
    asset_class: AssetClass
    group: str
    code: str
    cnpj: str | None
    description: str
    previous_value: DecimalStr
    current_value: DecimalStr


class IrpfExemptMonthDTO(BaseDTO):
    month: int
    profit: DecimalStr


class IrpfVariableIncomeMonthDTO(BaseDTO):
    """Uma linha do demonstrativo de renda variável: o resultado líquido de cada
    conjunto no mês, o imposto apurado e o DARF pago de fato."""

    month: int
    common: DecimalStr
    day_trade: DecimalStr
    fii: DecimalStr
    tax: DecimalStr
    darf_amount: DecimalStr | None
    due_date: date | None
    paid_on: date | None
    paid_amount: DecimalStr | None


class IrpfLossDTO(BaseDTO):
    pool: LossPool
    amount: DecimalStr


class IrpfReportDTO(BaseDTO):
    year: int
    darf_code: str
    assets: list[IrpfAssetDTO]
    exempt_months: list[IrpfExemptMonthDTO]
    exempt_total: DecimalStr
    variable_income: list[IrpfVariableIncomeMonthDTO]
    losses: list[IrpfLossDTO]
