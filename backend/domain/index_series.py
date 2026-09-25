"""Contrato das fontes de séries de juros e inflação: o BCB SGS é o provider hoje."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Protocol

from backend.core.enum import IndexSeries


@dataclass(frozen=True, slots=True, kw_only=True)
class DailyRate:
    """Taxa em %, como a fonte publica: ao dia para CDI e Selic; ao mês para o
    IPCA, datada no primeiro dia do mês de referência. No IBOV, o fechamento em
    pontos."""

    rate_date: date
    value: Decimal


class IndexSeriesProvider(Protocol):
    name: str

    def first_date(self, series: IndexSeries) -> date:
        """O primeiro dia com valor publicado na fonte."""
        ...

    def get_series(
        self, series: IndexSeries, start: date, end: date
    ) -> list[DailyRate]:
        """Valores com data de `start` a `end`, inclusive."""
        ...
