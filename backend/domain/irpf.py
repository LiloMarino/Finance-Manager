"""Quem entra na ficha Bens e Direitos do IRPF."""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from datetime import date

from backend.domain.position import OperationRecord, Position, current_positions


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
