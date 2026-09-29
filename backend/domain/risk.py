"""Risco pela volatilidade anualizada: o quanto o retorno diário oscila, escalado para
um ano de pregões.

O retorno de cada dia é o fator da cota daquele dia, a mesma conta da rentabilidade:
aporte e resgate não viram retorno, e o provento entra no dia em que foi pago. O dia
sem posição na véspera e sem entrada não tem retorno, e fica fora da conta em vez de
contar como zero. É estatística, então a conta é em float.
"""

from __future__ import annotations

import math
import statistics
from collections.abc import Sequence

from backend.domain.correlation import MIN_RETURNS
from backend.domain.daily_series import ZERO, DailyPoint

TRADING_DAYS = 252


def daily_returns(points: Sequence[DailyPoint]) -> list[float | None]:
    """O retorno de cada dia, alinhado aos `points`; nulo no dia sem base."""
    returns: list[float | None] = []
    previous = ZERO
    for point in points:
        base = previous + point.inflow
        returns.append(
            float((point.value + point.outflow + point.income) / base) - 1
            if base > ZERO
            else None
        )
        previous = point.value
    return returns


def annualized_volatility(returns: Sequence[float]) -> float | None:
    """O desvio-padrão dos retornos diários vezes √252; nulo com menos de `MIN_RETURNS`
    retornos, em que o número oscila demais ao acaso."""
    if len(returns) < MIN_RETURNS:
        return None
    return statistics.stdev(returns) * math.sqrt(TRADING_DAYS)
