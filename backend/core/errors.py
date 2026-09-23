"""Erros de domínio. Este módulo é puro: o domínio roda headless nas suítes de
paridade com o IR-Helper, então o status HTTP é um atributo da classe e a tradução
pra resposta acontece só na borda, em `backend.app`.
"""

from __future__ import annotations


class FinanceError(Exception):
    """Falha de negócio. Subclasses declaram o `status` que a borda HTTP vai ler."""

    status: int = 400
