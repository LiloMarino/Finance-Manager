"""Proventos: o que cada ativo pagou, somado por período, por categoria e por ativo.

Toda soma é do valor líquido, o que caiu na conta. O JCP e a distribuição de ETF
chegam sem os 15% retidos na fonte, como no informe de rendimentos da corretora.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from backend.core.enum import AssetClass, IncomeType
from backend.domain.daily_series import months_before

ZERO = Decimal(0)
# Janela do dividend yield e do yield on cost
YIELD_MONTHS = 12


def check_income(quantity: Decimal, unit_price: Decimal, amount: Decimal) -> None:
    """As mesmas regras das CHECK de `income_events`, com mensagem legível na borda."""
    if quantity <= 0:
        raise ValueError("A quantidade deve ser maior que zero.")
    if unit_price < 0:
        raise ValueError("O valor por unidade não pode ser negativo.")
    if amount <= 0:
        raise ValueError("O valor recebido deve ser maior que zero.")


@dataclass(frozen=True, slots=True, kw_only=True)
class IncomeRecord:
    id: int
    asset_id: int
    ticker: str
    asset_class: AssetClass
    payment_date: date
    income_type: IncomeType
    quantity: Decimal
    unit_price: Decimal
    amount: Decimal


def total(records: Iterable[IncomeRecord]) -> Decimal:
    return sum((record.amount for record in records), ZERO)


def since(
    records: Iterable[IncomeRecord], today: date, months: int
) -> list[IncomeRecord]:
    """Os proventos pagos nos últimos `months` meses, do dia seguinte ao mesmo dia
    `months` meses antes até hoje."""
    start = months_before(today, months)
    return [record for record in records if start < record.payment_date <= today]


def period_key(day: date, by_year: bool) -> str:
    """`2024` ou `2024-03`: ordena como texto na ordem do calendário."""
    return f"{day.year}" if by_year else f"{day.year}-{day.month:02d}"


def periods(start: date, end: date, by_year: bool) -> list[str]:
    """Todos os meses, ou anos, de `start` a `end`, inclusive os que não pagaram."""
    if by_year:
        return [str(year) for year in range(start.year, end.year + 1)]
    keys: list[str] = []
    year, month = start.year, start.month
    while (year, month) <= (end.year, end.month):
        keys.append(f"{year}-{month:02d}")
        year, month = (year + 1, 1) if month == 12 else (year, month + 1)
    return keys


def per_unit(records: Iterable[IncomeRecord]) -> Decimal:
    """O líquido pago por unidade, somado: cada provento dividido pela quantidade que
    recebeu ele."""
    return sum((record.amount / record.quantity for record in records), ZERO)


def ratio(numerator: Decimal, denominator: Decimal) -> Decimal | None:
    return numerator / denominator if denominator > ZERO else None


def last_payment(records: Sequence[IncomeRecord]) -> IncomeRecord | None:
    return max(
        records, key=lambda record: (record.payment_date, record.id), default=None
    )
