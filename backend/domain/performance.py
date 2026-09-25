"""Rentabilidade por cota, a mesma conta da cota de um fundo.

A cota começa em 1 e, a cada dia, é multiplicada por
`(valor de hoje + saídas do dia) / (valor da véspera + entradas do dia)`. A entrada
compra cotas pelo valor do dia e a saída as vende, então aporte e resgate mudam o
número de cotas e deixam o valor da cota como está. A entrada soma embaixo e a saída
em cima, e assim a primeira compra (véspera zerada) e a venda total (hoje zerado)
fecham sem divisão por zero.
"""

from __future__ import annotations

from collections.abc import Sequence
from decimal import Decimal

from backend.domain.daily_series import DailyPoint

ONE = Decimal(1)
ZERO = Decimal(0)


def quota_series(points: Sequence[DailyPoint]) -> list[Decimal]:
    """A cota no fim de cada dia. Dia sem posição na véspera e sem entrada não mexe
    nela."""
    quotas: list[Decimal] = []
    quota = ONE
    previous = ZERO
    for point in points:
        base = previous + point.inflow
        if base > ZERO:
            quota *= (point.value + point.outflow) / base
        quotas.append(quota)
        previous = point.value
    return quotas


def period_return(quotas: Sequence[Decimal], base: int | None, end: int) -> Decimal:
    """A variação da cota do fim do dia `base` ao fim do dia `end`; sem `base`, desde
    antes do primeiro dia, quando a cota valia 1."""
    start = quotas[base] if base is not None else ONE
    return quotas[end] / start - ONE
