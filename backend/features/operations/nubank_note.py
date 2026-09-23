"""Nota de negociação da Nubank (Nu Investimentos): compras e vendas do pregão."""

from __future__ import annotations

import re
from datetime import date, datetime
from decimal import Decimal

from backend.core.enum import OperationType
from backend.features.operations.dto import ImportedOperationDTO

BROKER_PATTERN = re.compile(r"\bNu\s+Investimentos\b", re.IGNORECASE)

TRADE_DATE_PATTERN = re.compile(r"(?i)preg[aã]o.*?(\d{2}/\d{2}/\d{4})")
ANY_DATE_PATTERN = re.compile(r"\b(\d{2}/\d{2}/\d{4})\b")

# Uma linha de negociação, já com os espaços normalizados:
# BOVESPA C VISTA ABCD11 CI ER # 1 R$ 27,55 R$ 27,55 D
LINE_PATTERN = re.compile(
    r"""
    BOVESPA
    \s+(?P<side>[CV])
    \s+[A-Z]+                              # mercado: VISTA, FRACIONARIO
    \s+(?P<ticker>[A-Z0-9]+)
    (?:\s+[A-Z0-9@#]+)*                    # especificação e observações
    \s+(?P<quantity>\d{1,3}(?:\.\d{3})*)
    \s+R?\$?\s*(?P<price>[\d.]+,\d+)
    \s+R?\$?\s*[\d.]+,\d+                  # valor da operação
    \s+[DC]
    """,
    re.VERBOSE,
)

SIDES = {"C": OperationType.BUY, "V": OperationType.SELL}

# O mercado fracionário acrescenta um F ao código: ABCD3F é ABCD3
FRACTIONAL_TICKER = re.compile(r"^(?P<ticker>.*\d)F$")


class UnsupportedNoteError(ValueError):
    pass


def _brl(value: str) -> Decimal:
    return Decimal(value.replace(".", "").replace(",", "."))


def is_nubank_note(text: str) -> bool:
    return BROKER_PATTERN.search(text) is not None


def trade_date(text: str) -> date:
    match = TRADE_DATE_PATTERN.search(text) or ANY_DATE_PATTERN.search(text)
    if match is None:
        raise UnsupportedNoteError("A nota não traz a data do pregão.")
    return datetime.strptime(match.group(1), "%d/%m/%Y").date()


def parse_nubank_note(text: str) -> list[ImportedOperationDTO]:
    """Cada linha de negociação vira uma operação, inclusive linhas idênticas: são
    execuções distintas da mesma ordem."""
    if not is_nubank_note(text):
        raise UnsupportedNoteError("PDF de corretora não suportada: só a Nubank.")
    operation_date = trade_date(text)

    operations: list[ImportedOperationDTO] = []
    for raw_line in text.splitlines():
        match = LINE_PATTERN.search(" ".join(raw_line.split()))
        if match is None:
            continue
        ticker = match["ticker"]
        if fractional := FRACTIONAL_TICKER.match(ticker):
            ticker = fractional["ticker"]
        operations.append(
            ImportedOperationDTO(
                ticker=ticker,
                operation_date=operation_date,
                operation_type=SIDES[match["side"]],
                quantity=Decimal(match["quantity"].replace(".", "")),
                unit_price=_brl(match["price"]),
            )
        )
    return operations
