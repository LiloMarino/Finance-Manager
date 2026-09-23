"""Contrato das fontes de cotação: yfinance e brapi são intercambiáveis por aqui."""

from __future__ import annotations

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
        sem sufixo."""
        ...


def to_cents(value: float) -> Decimal:
    """A B3 cota em centavos; o resto dos dígitos de um float é ruído binário."""
    return Decimal(str(value)).quantize(CENT)
