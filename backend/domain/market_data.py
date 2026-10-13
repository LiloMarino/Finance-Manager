"""Contrato das fontes de cotação: yfinance e brapi são intercambiáveis por aqui. A
série histórica da B3 completa o começo que elas não têm."""

from __future__ import annotations

from collections.abc import Collection
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Protocol

CENT = Decimal("0.01")


@dataclass(frozen=True, slots=True, kw_only=True)
class DailyClose:
    price_date: date
    close: Decimal


class MarketDataProvider(Protocol):
    name: str

    def get_history(self, ticker: str, start: date, end: date) -> list[DailyClose]:
        """Fechamentos de `start` a `end`, inclusive. `ticker` é o código da B3,
        sem sufixo, ou o símbolo de um índice, com `^`."""
        ...


class HistoryArchive(Protocol):
    """A série histórica oficial da B3, em um arquivo por mês com o pregão inteiro, que
    sai depois do fim do mês: um download serve a todos os tickers daquele mês."""

    name: str

    def get_month(
        self, year: int, month: int, tickers: Collection[str]
    ) -> dict[str, list[DailyClose]]:
        """Os fechamentos dos `tickers` no mercado à vista no mês, como a B3 os
        publicou, sem ajuste por evento. O ticker sem negócio no mês fica de fora."""
        ...


def to_cents(value: float) -> Decimal:
    """A B3 cota em centavos; o resto dos dígitos de um float é ruído binário."""
    return Decimal(str(value)).quantize(CENT)
