"""A busca de ticker que sugere enquanto se digita: a fonte devolve símbolos de
qualquer bolsa, e daqui sai só o que a B3 negocia no lote padrão."""

from __future__ import annotations

import re
from collections.abc import Iterable
from dataclasses import dataclass
from typing import Protocol

from backend.core.errors import FinanceError

# Quatro letras ou dígitos e o número da classe: ABCD4, ABCD11, ABCD34. O mercado
# fracionário (ABCD4F) e os sufixos de situação especial ficam de fora.
_B3_TICKER = re.compile(r"[A-Z0-9]{4}\d{1,2}")
_B3_SUFFIX = ".SA"
MIN_QUERY = 2


class TickerSearchUnavailableError(FinanceError):
    status = 503


@dataclass(frozen=True, slots=True, kw_only=True)
class QuoteHit:
    """Um resultado cru da fonte: o símbolo com o sufixo da bolsa."""

    symbol: str
    exchange: str
    name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class TickerMatch:
    ticker: str
    name: str


class TickerSearchProvider(Protocol):
    def search(self, query: str) -> list[QuoteHit]:
        """Os símbolos que a fonte associa ao texto, na ordem de relevância dela.
        Levanta `TickerSearchUnavailableError` quando a fonte não responde."""
        ...


def b3_matches(hits: Iterable[QuoteHit]) -> list[TickerMatch]:
    """Os tickers da B3 entre os resultados, sem o `.SA`, sem repetição e na ordem
    da fonte."""
    found: dict[str, TickerMatch] = {}
    for hit in hits:
        ticker = hit.symbol.removesuffix(_B3_SUFFIX)
        if (
            hit.exchange == "SAO"
            and hit.symbol.endswith(_B3_SUFFIX)
            and _B3_TICKER.fullmatch(ticker)
            and ticker not in found
        ):
            found[ticker] = TickerMatch(ticker=ticker, name=" ".join(hit.name.split()))
    return list(found.values())


def search_tickers(provider: TickerSearchProvider, query: str) -> list[TickerMatch]:
    """Texto curto demais não consulta a fonte: devolve a lista vazia."""
    text = query.strip().upper()
    if len(text) < MIN_QUERY:
        return []
    return b3_matches(provider.search(text))
