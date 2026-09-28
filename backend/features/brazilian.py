"""Números no formato pt-BR, para os textos que o backend monta."""

from __future__ import annotations

from decimal import Decimal


def brazilian(value: Decimal, places: int) -> str:
    """Número no formato pt-BR, com separador de milhar."""
    text = f"{value:,.{places}f}"
    return text.replace(",", "_").replace(".", ",").replace("_", ".")


def brl(value: Decimal) -> str:
    return f"R$ {brazilian(value, 2)}"
