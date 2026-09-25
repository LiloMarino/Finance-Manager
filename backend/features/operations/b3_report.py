"""Relatório de movimentação da B3: a fonte dos eventos corporativos.

Compra e venda entram pela nota de corretagem, que traz a data do pregão e cada
execução. O relatório da B3 traz as mesmas negociações como liquidação, em D+2 e
agregadas por dia, então delas só se aproveitam os eventos e a venda da fração em
leilão. Cada tipo de operação tem uma fonte só, e é isso que deixa importar as
duas sem dobrar posição.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal, InvalidOperation

from pydantic import ValidationError

from backend.adapters.b3_movements import B3Movement
from backend.core.enum import OperationType
from backend.features.operations.dto import IgnoredMovementDTO, ImportedOperationDTO

CORPORATE_EVENTS = {
    "Bonificação em Ativos": OperationType.BONUS,
    "Desdobro": OperationType.SPLIT,
    # A Quantidade do grupamento entra como o fator (ver `Operation`)
    "Grupamento": OperationType.REVERSE_SPLIT,
}

# A fração que sobra de um evento é vendida em leilão, e o dinheiro entra como
# crédito: para a posição, é uma venda
FRACTION_AUCTION = "Leilão de Fração"

IGNORED_MOVEMENTS = {
    "Transferência - Liquidação": "liquidação de compra ou venda: entra pela nota de corretagem",
    "Fração em Ativos": "saída da fração para o leilão: a venda entra pelo Leilão de Fração",
    "Atualização": "atualização de custódia: troca de ticker entra pelo detalhe do ativo",
    "Direito de Subscrição": "direito de subscrição não é posição",
    "Direitos de Subscrição - Não Exercido": "direito de subscrição não é posição",
    "Transferência": "transferência entre custódias não muda a posição",
}


def _decimal(value: str) -> Decimal:
    """Célula numérica ou texto em pt-BR; o traço dos eventos sem preço vale zero."""
    text = value.replace("R$", "").replace(" ", "")
    if text in ("", "-"):
        return Decimal(0)
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    return Decimal(text)


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


def parse_b3_movements(
    file: str, movements: list[B3Movement]
) -> tuple[list[ImportedOperationDTO], list[IgnoredMovementDTO]]:
    operations: list[ImportedOperationDTO] = []
    ignored: list[IgnoredMovementDTO] = []

    for movement in movements:
        ticker = movement.product.split("-")[0].strip().upper()

        if movement.movement in CORPORATE_EVENTS:
            operation_type = CORPORATE_EVENTS[movement.movement]
            unit_price = Decimal(0)
        elif movement.movement == FRACTION_AUCTION:
            operation_type = OperationType.SELL
            unit_price = _decimal(movement.unit_price)
        else:
            reason = IGNORED_MOVEMENTS.get(
                movement.movement, "movimentação não reconhecida"
            )
            ignored.append(_ignored(file, ticker, movement, reason))
            continue

        try:
            operations.append(
                ImportedOperationDTO(
                    ticker=ticker,
                    operation_date=datetime.strptime(
                        movement.movement_date, "%d/%m/%Y"
                    ).date(),
                    operation_type=operation_type,
                    quantity=_decimal(movement.quantity),
                    unit_price=unit_price,
                )
            )
        except ValidationError as error:
            reason = f"linha inválida: {error.errors()[0]['msg']}"
            ignored.append(_ignored(file, ticker, movement, reason))
        except (ValueError, InvalidOperation):
            reason = "linha inválida: data ou quantidade ilegível"
            ignored.append(_ignored(file, ticker, movement, reason))

    return operations, ignored
