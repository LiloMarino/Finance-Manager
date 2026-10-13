"""A conferência das notas de corretagem pela liquidação da B3.

A B3 liquida a compra e a venda 2 dias úteis depois do pregão, numa linha por ativo
e dia com as execuções somadas; compra e venda do mesmo pregão se compensam. Cada
liquidação corresponde a um pregão das operações com o mesmo saldo de quantidade, e
a que fica sem pregão é uma nota de corretagem que o app não tem.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from typing import Protocol

from backend.core.enum import OperationType

# D+2 úteis, com folga para o feriado prolongado no meio, como o Carnaval
SETTLEMENT_LAGS = [timedelta(days=days) for days in range(1, 7)]

SIGNS = {OperationType.BUY: 1, OperationType.SELL: -1}


@dataclass(frozen=True, slots=True, kw_only=True)
class Settlement:
    ticker: str
    settlement_date: date
    operation_type: OperationType
    quantity: Decimal


class Trade(Protocol):
    @property
    def ticker(self) -> str: ...

    @property
    def operation_date(self) -> date: ...

    @property
    def operation_type(self) -> OperationType: ...

    @property
    def quantity(self) -> Decimal: ...


def missing_notes(
    settlements: Iterable[Settlement], trades: Iterable[Trade]
) -> list[Settlement]:
    """As liquidações sem pregão correspondente. Cada pregão responde por uma
    liquidação só, e o mais próximo dela vem primeiro."""
    net: defaultdict[tuple[str, date], Decimal] = defaultdict(Decimal)
    for trade in trades:
        sign = SIGNS.get(trade.operation_type)
        if sign is not None:
            net[(trade.ticker, trade.operation_date)] += sign * trade.quantity

    used: set[tuple[str, date]] = set()
    missing: list[Settlement] = []
    for settlement in sorted(settlements, key=lambda item: item.settlement_date):
        signed = SIGNS[settlement.operation_type] * settlement.quantity
        candidates = (
            (settlement.ticker, settlement.settlement_date - lag)
            for lag in SETTLEMENT_LAGS
        )
        found = next(
            (day for day in candidates if day not in used and net.get(day) == signed),
            None,
        )
        if found is None:
            missing.append(settlement)
        else:
            used.add(found)
    return missing
