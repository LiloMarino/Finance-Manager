"""A taxa que empata duas contas, por bisseção: as ferramentas perguntam "a partir de
que taxa um caminho vence o outro", e a resposta não tem fórmula fechada quando o IR
depende do prazo de cada resgate."""

from __future__ import annotations

from collections.abc import Callable
from decimal import Decimal

TWO = Decimal(2)
TOLERANCE = Decimal("0.0001")
# O teto dobra no máximo esse tanto de vezes antes de desistir: 100 x 2^30 passa de
# qualquer taxa que exista
MAX_DOUBLINGS = 30


def solve(
    fn: Callable[[Decimal], Decimal], low: Decimal, high: Decimal
) -> Decimal | None:
    """O `x` em que `fn`, crescente, cruza zero. O teto dobra até `fn` ficar
    positiva, e `low` volta quando `fn` já não é negativa nele. Nulo quando nem o
    maior teto cruza zero."""
    if fn(low) >= 0:
        return low
    doublings = 0
    while fn(high) < 0:
        if doublings == MAX_DOUBLINGS:
            return None
        low, high = high, high * TWO
        doublings += 1
    while high - low > TOLERANCE:
        middle = (low + high) / TWO
        if fn(middle) < 0:
            low = middle
        else:
            high = middle
    return (low + high) / TWO
