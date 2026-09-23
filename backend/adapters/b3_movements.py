from __future__ import annotations

import warnings
from dataclasses import dataclass
from io import BytesIO

from openpyxl import load_workbook

COLUMNS = (
    "Entrada/Saída",
    "Data",
    "Movimentação",
    "Produto",
    "Quantidade",
    "Preço unitário",
)


@dataclass(frozen=True, slots=True, kw_only=True)
class B3Movement:
    """Uma linha do relatório de movimentação da B3, com as células como texto."""

    direction: str
    movement_date: str
    movement: str
    product: str
    quantity: str
    unit_price: str


def _text(value: object) -> str:
    return "" if value is None else str(value).strip()


def read_b3_movements(content: bytes) -> list[B3Movement]:
    """Lê a primeira planilha do xlsx; a linha 1 é o cabeçalho."""
    with warnings.catch_warnings():
        # O xlsx da B3 vem sem estilo padrão, e o openpyxl avisa a cada leitura
        warnings.simplefilter("ignore", UserWarning)
        workbook = load_workbook(BytesIO(content), read_only=True, data_only=True)
    sheet = workbook.worksheets[0]
    # O xlsx da B3 declara a dimensão A1:A1; sem recalcular, a leitura para na
    # primeira coluna
    sheet.reset_dimensions()
    rows = sheet.iter_rows(values_only=True)
    header = [_text(cell) for cell in next(rows, ())]
    missing = [column for column in COLUMNS if column not in header]
    if missing:
        raise ValueError(
            "Não é um relatório de movimentação da B3: faltam as colunas "
            + ", ".join(missing)
        )
    index = {column: header.index(column) for column in COLUMNS}

    movements: list[B3Movement] = []
    for row in rows:
        cells = [_text(cell) for cell in row]
        if not any(cells):
            continue
        movements.append(
            B3Movement(
                direction=cells[index["Entrada/Saída"]],
                movement_date=cells[index["Data"]],
                movement=cells[index["Movimentação"]],
                product=cells[index["Produto"]],
                quantity=cells[index["Quantidade"]],
                unit_price=cells[index["Preço unitário"]],
            )
        )
    return movements
