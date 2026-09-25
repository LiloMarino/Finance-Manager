"""Quem entra na ficha Bens e Direitos do IRPF, e em que ficha entra cada provento."""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from datetime import date

from backend.core.enum import AssetClass, IncomeForm, IncomeType
from backend.domain.position import OperationRecord, Position, current_positions

# (ficha, código) de cada provento pelo tipo e pela classe do ativo. O JCP e a
# distribuição de ETF já tiveram o IR retido na fonte; a atualização de provento de
# ação paga com atraso vem como rendimento e é tributável, em Outros.
INCOME_FORMS: dict[tuple[IncomeType, AssetClass], tuple[IncomeForm, str]] = {
    (IncomeType.DIVIDEND, AssetClass.STOCK): (IncomeForm.EXEMPT, "09"),
    (IncomeType.JCP, AssetClass.STOCK): (IncomeForm.EXCLUSIVE, "10"),
    (IncomeType.DISTRIBUTION, AssetClass.FII): (IncomeForm.EXEMPT, "26"),
    (IncomeType.DISTRIBUTION, AssetClass.ETF): (IncomeForm.EXCLUSIVE, "06"),
    (IncomeType.DISTRIBUTION, AssetClass.STOCK): (IncomeForm.EXCLUSIVE, "12"),
}


def income_form(
    income_type: IncomeType, asset_class: AssetClass
) -> tuple[IncomeForm, str] | None:
    """A ficha e o código do provento; nulo quando ele não tem ficha automática, como
    o dividendo de BDR, que vai pelo carnê-leão."""
    return INCOME_FORMS.get((income_type, asset_class))


def is_declared(before: Position, after: Position) -> bool:
    """O ativo entra na ficha do ano-base com posição em algum dos dois 31/12: o do
    ano anterior ou o do próprio ano."""
    return before.quantity != 0 or after.quantity != 0


def declared_years(
    operations: Iterable[OperationRecord], last_year: int
) -> dict[str, list[int]]:
    """Os anos-base, até `last_year`, em que cada ativo entra na ficha."""
    operations = list(operations)
    if not operations:
        return {}
    first_year = min(op.operation_date.year for op in operations)
    year_ends = {
        year: current_positions(
            op for op in operations if op.operation_date <= date(year, 12, 31)
        )
        for year in range(first_year - 1, last_year + 1)
    }
    years: defaultdict[str, list[int]] = defaultdict(list)
    for year in range(first_year, last_year + 1):
        before, after = year_ends[year - 1], year_ends[year]
        for ticker in before.keys() | after.keys():
            if is_declared(
                before.get(ticker, Position()), after.get(ticker, Position())
            ):
                years[ticker].append(year)
    return dict(years)
