from __future__ import annotations

from datetime import date
from decimal import Decimal
from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from openpyxl import Workbook
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, ImportStatus, OperationType
from backend.core.models.models import Asset, Operation
from backend.domain.position import NegativePositionError
from backend.features.operations.dto import ImportConfirmDTO, NewAssetDTO
from backend.features.operations.importing import (
    MissingAssetClassError,
    ParsedFile,
    confirm_import,
    infer_asset_class,
    preview_import,
)
from backend.features.operations.nubank_note import (
    UnsupportedNoteError,
    parse_nubank_note,
)

B3_HEADER = (
    "Entrada/Saída",
    "Data",
    "Movimentação",
    "Produto",
    "Instituição",
    "Quantidade",
    "Preço unitário",
    "Valor da Operação",
)


def _note(*lines: str, trade_day: str = "05/02/2024") -> str:
    return "\n".join(
        [
            "NOTA DE NEGOCIAÇÃO",
            "Nu Investimentos S.A. - CTVM",
            f"Data pregão {trade_day}",
            *lines,
        ]
    )


BUY_LINE = "BOVESPA C VISTA ABCD11 CI 10 R$ 10,50 R$ 105,00 D"


def _xlsx(*rows: tuple[str | float, ...]) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    assert sheet is not None
    sheet.append(B3_HEADER)
    for row in rows:
        sheet.append(row)
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


def _b3_row(
    movement: str, product: str, quantity: float, price: str | float = "-"
) -> tuple[str | float, ...]:
    return (
        "Credito",
        "05/02/2024",
        movement,
        product,
        "CORRETORA",
        quantity,
        price,
        "-",
    )


def _parsed(name: str, text: str) -> ParsedFile:
    return ParsedFile(name=name, operations=parse_nubank_note(text))


def _confirm_all(session: Session, *files: ParsedFile) -> ImportConfirmDTO:
    preview = preview_import(session, files)
    return ImportConfirmDTO(
        operations=[
            row
            for row in preview.rows
            if row.status in (ImportStatus.NEW, ImportStatus.POSSIBLE_DUPLICATE)
        ],
        new_assets=preview.new_assets,
    )


def _operation_count(session: Session) -> int:
    return session.scalar(select(func.count()).select_from(Operation)) or 0


def test_note_parser_reads_trade_lines() -> None:
    """Cada linha BOVESPA vira compra ou venda na data do pregão, com o preço em
    pt-BR convertido."""
    operations = parse_nubank_note(
        _note(
            BUY_LINE, "BOVESPA V VISTA WXYZ3 ON NM 1.200 R$ 1.234,56 R$ 1.481.472,00 C"
        )
    )

    assert [
        (op.ticker, op.operation_date, op.operation_type, op.quantity, op.unit_price)
        for op in operations
    ] == [
        ("ABCD11", date(2024, 2, 5), OperationType.BUY, Decimal(10), Decimal("10.50")),
        (
            "WXYZ3",
            date(2024, 2, 5),
            OperationType.SELL,
            Decimal(1200),
            Decimal("1234.56"),
        ),
    ]


def test_note_parser_handles_fractional_ticker_and_observation_mark() -> None:
    """O F do fracionário sai do código, e a linha com observação `#` não se perde."""
    operations = parse_nubank_note(
        _note(
            "BOVESPA C FRACIONARIO WXYZ3F ON NM 3 R$ 20,00 R$ 60,00 D",
            "BOVESPA C VISTA ABCD11 CI ER 10 R$ 10,50 R$ 105,00 D",
            "BOVESPA C VISTA ABCD11 CI ER # 1 R$ 10,50 R$ 10,50 D",
        )
    )

    assert [(op.ticker, op.quantity) for op in operations] == [
        ("WXYZ3", Decimal(3)),
        ("ABCD11", Decimal(10)),
        ("ABCD11", Decimal(1)),
    ]


def test_note_from_other_broker_is_refused() -> None:
    """Nota que não é da Nubank é recusada com o motivo."""
    with pytest.raises(UnsupportedNoteError, match="Nubank"):
        parse_nubank_note(
            "Outra Corretora S.A.\nBOVESPA C VISTA ABCD11 CI 1 R$ 1,00 R$ 1,00 D"
        )


def test_asset_class_is_inferred_from_ticker_suffix() -> None:
    """3/4 é ação, 11 começa como FII e 34 é BDR."""
    assert infer_asset_class("WXYZ3") == AssetClass.STOCK
    assert infer_asset_class("ABCD11") == AssetClass.FII
    assert infer_asset_class("EFGH34") == AssetClass.BDR


def test_b3_report_brings_only_corporate_events_and_fraction_auction(
    api: TestClient,
) -> None:
    """Do xlsx da B3 entram os eventos e o leilão da fração, como venda; a liquidação
    de compra e venda fica de fora, com o motivo."""
    content = _xlsx(
        _b3_row("Bonificação em Ativos", "WXYZ3 - EMPRESA WXYZ S/A", 0.05),
        _b3_row("Desdobro", "WXYZ3 - EMPRESA WXYZ S/A", 1),
        _b3_row("Grupamento", "EFGH3 - EMPRESA EFGH S/A", 0.1),
        _b3_row("Leilão de Fração", "WXYZ3 - EMPRESA WXYZ S/A", 0.05, 10.031),
        _b3_row("Transferência - Liquidação", "WXYZ3 - EMPRESA WXYZ S/A", 10, 20.5),
        _b3_row("Fração em Ativos", "WXYZ3 - EMPRESA WXYZ S/A", 0.05),
        _b3_row("Movimentação Inventada", "WXYZ3 - EMPRESA WXYZ S/A", 1),
    )

    preview = api.post(
        "/api/operations/import/preview",
        files=[("files", ("movimentacao.xlsx", content))],
    ).json()

    assert [
        (row["ticker"], row["operation_type"], row["quantity"], row["unit_price"])
        for row in preview["rows"]
    ] == [
        ("WXYZ3", "bonus", "0.05", "0"),
        ("WXYZ3", "split", "1", "0"),
        ("EFGH3", "reverse_split", "0.1", "0"),
        ("WXYZ3", "sell", "0.05", "10.031"),
    ]
    assert [(item["movement"], item["reason"]) for item in preview["ignored"]] == [
        (
            "Transferência - Liquidação",
            "liquidação de compra ou venda: entra pela nota de corretagem",
        ),
        (
            "Fração em Ativos",
            "saída da fração para o leilão: a venda entra pelo Leilão de Fração",
        ),
        ("Movimentação Inventada", "movimentação não reconhecida"),
    ]


def test_unsupported_file_does_not_break_the_batch(api: TestClient) -> None:
    """Um arquivo ilegível vira erro dele mesmo e o resto do lote segue."""
    content = _xlsx(_b3_row("Desdobro", "WXYZ3 - EMPRESA WXYZ S/A", 1))

    preview = api.post(
        "/api/operations/import/preview",
        files=[
            ("files", ("notas.txt", b"qualquer coisa")),
            ("files", ("movimentacao.xlsx", content)),
        ],
    ).json()

    assert [(f["name"], f["source"], f["error"] is None) for f in preview["files"]] == [
        ("notas.txt", None, False),
        ("movimentacao.xlsx", "b3", True),
    ]
    assert len(preview["rows"]) == 1


def test_reimporting_the_same_note_adds_nothing(session: Session) -> None:
    """Depois de confirmada, a mesma nota volta toda como `já existe`, e confirmar de
    novo o mesmo preview grava zero."""
    note = _parsed("nota.pdf", _note(BUY_LINE))
    payload = _confirm_all(session, note)

    first = confirm_import(session, payload)
    second = confirm_import(session, payload)
    preview = preview_import(session, [note])

    assert (first.created, second.created, second.skipped) == (1, 0, 1)
    assert [row.status for row in preview.rows] == [ImportStatus.EXISTING]
    assert _operation_count(session) == 1


def test_same_file_twice_in_one_batch_counts_once(session: Session) -> None:
    """O mesmo arquivo solto duas vezes no lote não dobra: as linhas do segundo
    saem como repetidas no lote."""
    note = _parsed("nota.pdf", _note(BUY_LINE))
    copy = _parsed("nota (1).pdf", _note(BUY_LINE))

    preview = preview_import(session, [note, copy])
    confirm_import(session, _confirm_all(session, note, copy))

    assert [row.status for row in preview.rows] == [
        ImportStatus.NEW,
        ImportStatus.REPEATED_IN_BATCH,
    ]
    assert _operation_count(session) == 1


def test_identical_executions_in_one_note_all_enter(session: Session) -> None:
    """Duas execuções idênticas na mesma nota são duas compras, e entram as duas."""
    note = _parsed("nota.pdf", _note(BUY_LINE, BUY_LINE))

    result = confirm_import(session, _confirm_all(session, note))

    assert result.created == 2


def test_same_day_with_different_numbers_is_a_possible_duplicate(
    session: Session,
) -> None:
    """Se o banco já tem operação do mesmo ativo, dia e tipo, a linha sem par exato
    sai como possível duplicata: é a mesma execução registrada de outro jeito."""
    confirm_import(
        session,
        ImportConfirmDTO(
            operations=parse_nubank_note(
                _note("BOVESPA C VISTA ABCD11 CI 11 R$ 10,50 R$ 115,50 D")
            ),
            new_assets=[NewAssetDTO(ticker="ABCD11", asset_class=AssetClass.FII)],
        ),
    )

    preview = preview_import(
        session,
        [
            _parsed(
                "nota.pdf",
                _note(BUY_LINE, "BOVESPA C VISTA ABCD11 CI ER # 1 R$ 10,50 R$ 10,50 D"),
            )
        ],
    )

    assert [row.status for row in preview.rows] == [
        ImportStatus.POSSIBLE_DUPLICATE,
        ImportStatus.POSSIBLE_DUPLICATE,
    ]


def test_new_asset_needs_a_class(session: Session) -> None:
    """Confirmar sem a classe de um ativo novo é recusado, e nada é gravado."""
    payload = ImportConfirmDTO(
        operations=parse_nubank_note(_note(BUY_LINE)), new_assets=[]
    )

    with pytest.raises(MissingAssetClassError, match="ativos novos: ABCD11"):
        confirm_import(session, payload)
    session.rollback()

    assert session.scalar(select(func.count()).select_from(Asset)) == 0


def test_import_that_leaves_a_negative_position_is_refused(session: Session) -> None:
    """Uma venda sem posição recusa o lote inteiro."""
    note = _parsed(
        "nota.pdf", _note("BOVESPA V VISTA ABCD11 CI 10 R$ 10,50 R$ 105,00 C")
    )

    with pytest.raises(NegativePositionError):
        confirm_import(session, _confirm_all(session, note))
    session.rollback()

    assert _operation_count(session) == 0
