"""Relatórios da B3: a fonte dos eventos corporativos e dos proventos.

Compra e venda entram pela nota de corretagem, que traz a data do pregão e cada
execução. O relatório de movimentação traz as mesmas negociações como liquidação, em
D+2 e agregadas por dia, então delas só se aproveitam os eventos, a venda da fração em
leilão e os proventos. Cada tipo de operação tem uma fonte só, e é isso que deixa
importar as duas sem dobrar posição.

O relatório de proventos recebidos traz os mesmos proventos do de movimentação, com o
valor por unidade arredondado a 2 casas.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from pydantic import ValidationError

from backend.adapters.b3_movements import B3Movement
from backend.core.enum import IncomeType, OperationType
from backend.features.imports.dto import (
    IgnoredMovementDTO,
    ImportedIncomeDTO,
    ImportedOperationDTO,
)

CORPORATE_EVENTS = {
    "Bonificação em Ativos": OperationType.BONUS,
    "Desdobro": OperationType.SPLIT,
    # A Quantidade do grupamento entra como o fator (ver `Operation`)
    "Grupamento": OperationType.REVERSE_SPLIT,
}

# A fração que sobra de um evento é vendida em leilão, e o dinheiro entra como
# crédito: para a posição, é uma venda
FRACTION_AUCTION = "Leilão de Fração"

# O preço unitário é o bruto por unidade e o valor é o líquido: no JCP e na
# distribuição de ETF, a diferença é o IR retido na fonte
INCOME_MOVEMENTS = {
    "Dividendo": IncomeType.DIVIDEND,
    "Juros Sobre Capital Próprio": IncomeType.JCP,
    "Rendimento": IncomeType.DISTRIBUTION,
}

IGNORED_MOVEMENTS = {
    "Transferência - Liquidação": "liquidação de compra ou venda: entra pela nota de corretagem",
    "Fração em Ativos": "saída da fração para o leilão: a venda entra pelo Leilão de Fração",
    "Atualização": "atualização de custódia: troca de ticker entra pelo detalhe do ativo",
    "Direito de Subscrição": "direito de subscrição não é posição",
    "Direitos de Subscrição - Não Exercido": "direito de subscrição não é posição",
    "Transferência": "transferência entre custódias não muda a posição",
    "Evento em Dinheiro - Excluído": "evento em dinheiro cancelado: não houve pagamento",
}


@dataclass(frozen=True, slots=True, kw_only=True)
class ParsedB3Report:
    operations: list[ImportedOperationDTO]
    income: list[ImportedIncomeDTO]
    ignored: list[IgnoredMovementDTO]


def _decimal(value: str) -> Decimal:
    """Célula numérica ou texto em pt-BR; o traço dos eventos sem preço vale zero."""
    text = value.replace("R$", "").replace(" ", "")
    if text in ("", "-"):
        return Decimal(0)
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    return Decimal(text)


def _date(value: str) -> date:
    return datetime.strptime(value, "%d/%m/%Y").date()


def _ignored(
    file: str, ticker: str, movement: B3Movement, reason: str
) -> IgnoredMovementDTO:
    return IgnoredMovementDTO(
        file=file,
        ticker=ticker,
        movement_date=movement.movement_date,
        movement=movement.movement,
        reason=reason,
    )


def _operation(ticker: str, movement: B3Movement) -> ImportedOperationDTO | None:
    if movement.movement in CORPORATE_EVENTS:
        operation_type = CORPORATE_EVENTS[movement.movement]
        unit_price = Decimal(0)
    elif movement.movement == FRACTION_AUCTION:
        operation_type = OperationType.SELL
        unit_price = _decimal(movement.unit_price)
    else:
        return None
    return ImportedOperationDTO(
        ticker=ticker,
        operation_date=_date(movement.movement_date),
        operation_type=operation_type,
        quantity=_decimal(movement.quantity),
        unit_price=unit_price,
    )


def _income(ticker: str, movement: B3Movement) -> ImportedIncomeDTO | None:
    income_type = INCOME_MOVEMENTS.get(movement.movement)
    if income_type is None:
        return None
    return ImportedIncomeDTO(
        ticker=ticker,
        payment_date=_date(movement.movement_date),
        income_type=income_type,
        quantity=_decimal(movement.quantity),
        unit_price=_decimal(movement.unit_price),
        amount=_decimal(movement.amount),
    )


def parse_b3_movements(file: str, movements: list[B3Movement]) -> ParsedB3Report:
    operations: list[ImportedOperationDTO] = []
    income: list[ImportedIncomeDTO] = []
    ignored: list[IgnoredMovementDTO] = []

    for movement in movements:
        ticker = movement.product.split("-")[0].strip().upper()
        try:
            parsed = _operation(ticker, movement) or _income(ticker, movement)
        except ValidationError as error:
            reason = f"linha inválida: {error.errors()[0]['msg']}"
            ignored.append(_ignored(file, ticker, movement, reason))
            continue
        except (ValueError, InvalidOperation):
            reason = "linha inválida: data, quantidade ou valor ilegível"
            ignored.append(_ignored(file, ticker, movement, reason))
            continue

        if isinstance(parsed, ImportedOperationDTO):
            operations.append(parsed)
        elif isinstance(parsed, ImportedIncomeDTO):
            income.append(parsed)
        else:
            reason = IGNORED_MOVEMENTS.get(
                movement.movement, "movimentação não reconhecida"
            )
            ignored.append(_ignored(file, ticker, movement, reason))

    return ParsedB3Report(operations=operations, income=income, ignored=ignored)
