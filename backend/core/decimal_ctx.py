"""Representação canônica de Decimal.

Ponto fixo, sem expoente: é assim que o valor atravessa a fronteira HTTP e é assim
que o `DecimalText` o grava no SQLite.
"""

from __future__ import annotations

from decimal import Decimal


def fmt(value: Decimal) -> str:
    return format(value, "f")
