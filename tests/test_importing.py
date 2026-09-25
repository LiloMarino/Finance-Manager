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
from backend.core.models.models import Asset, IncomeEvent, Operation
from backend.domain.position import NegativePositionError
from backend.features.imports.dto import ImportConfirmDTO, NewAssetDTO
from backend.features.imports.importing import (
    MissingAssetClassError,
    ParsedFile,
    confirm_import,
    infer_asset_class,
    preview_import,
)
from backend.features.imports.nubank_note import (
    UnsupportedNoteError,
    parse_nubank_note,
)

INCOME_HEADER = (
    "Produto",
    "Pagamento",
    "Tipo de Evento",
    "Instituição",
    "Quantidade",
    "Preço unitário",
    "Valor líquido",
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


def _xlsx(*rows: tuple[str | float, ...], header: tuple[str, ...] = B3_HEADER) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    assert sheet is not None
    sheet.append(header)
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


def _income_row(
    day: str, movement: str, product: str, quantity: float, price: float, amount: float
) -> tuple[str | float, ...]:
    return ("Credito", day, movement, product, "CORRETORA", quantity, price, amount)


# O mesmo provento nos dois relatórios: o de proventos recebidos traz a quantidade
# como texto e o valor por unidade em 2 casas
EXTRACT_JCP = _income_row(
    "15/03/2024",
    "Juros Sobre Capital Próprio",
    "WXYZ3 - EMPRESA WXYZ S/A",
    10,
    0.235,
    2,
)
RECEIVED_JCP: tuple[str | float, ...] = (
    "WXYZ3 - EMPRESA WXYZ S/A",
    "15/03/2024",
    "Juros Sobre Capital Próprio",
    "CORRETORA",
    "10",
    0.24,
    2,
)
RECEIVED_FOOTER: list[tuple[str | float, ...]] = [
    ("", "", "", "", "", "", ""),
    ("", "", "", "", "", "", "Total"),
]

type Preview = dict[str, list[dict[str, str]]]


def _preview_files(api: TestClient, *files: tuple[str, bytes]) -> Preview:
    return api.post(
        "/api/import/preview", files=[("files", file) for file in files]
    ).json()


def _confirm_preview(api: TestClient, preview: Preview) -> dict[str, int]:
    """Confirma as linhas novas e as possíveis duplicatas do preview."""
    pending = ("new", "possible_duplicate")
    operation_fields = (
        "ticker",
        "operation_date",
        "operation_type",
        "quantity",
        "unit_price",
    )
    income_fields = (
        "ticker",
        "payment_date",
        "income_type",
        "quantity",
        "unit_price",
        "amount",
    )
    return api.post(
        "/api/import/confirm",
        json={
            "operations": [
                {key: row[key] for key in operation_fields}
                for row in preview["rows"]
                if row["status"] in pending
            ],
            "income": [
                {key: row[key] for key in income_fields}
                for row in preview["income_rows"]
                if row["status"] in pending
            ],
            "new_assets": preview["new_assets"],
        },
    ).json()


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
        income=[
            row
            for row in preview.income_rows
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
        "/api/import/preview",
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
        "/api/import/preview",
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


def test_b3_report_brings_income_with_gross_unit_price_and_net_amount(
    api: TestClient,
) -> None:
    """Dividendo, JCP e rendimento do relatório de movimentação viram proventos, com
    o valor por unidade bruto e o valor líquido; o evento em dinheiro cancelado fica
    de fora, com o motivo."""
    content = _xlsx(
        _income_row("15/03/2024", "Dividendo", "WXYZ3 - EMPRESA WXYZ S/A", 10, 0.5, 5),
        EXTRACT_JCP,
        _income_row("14/03/2024", "Rendimento", "ABCD11 - FUNDO ABCD", 20, 1, 20),
        (
            "Debito",
            "15/03/2024",
            "Evento em Dinheiro - Excluído",
            "EFGH3 - EMPRESA EFGH S/A",
            "CORRETORA",
            0.1,
            "-",
            "-",
        ),
    )

    preview = _preview_files(api, ("movimentacao.xlsx", content))

    assert [
        (
            row["ticker"],
            row["income_type"],
            row["quantity"],
            row["unit_price"],
            row["amount"],
            row["status"],
        )
        for row in preview["income_rows"]
    ] == [
        ("WXYZ3", "dividend", "10", "0.5", "5", "new"),
        ("WXYZ3", "jcp", "10", "0.235", "2", "new"),
        ("ABCD11", "distribution", "20", "1", "20", "new"),
    ]
    assert preview["rows"] == []
    assert [(item["movement"], item["reason"]) for item in preview["ignored"]] == [
        (
            "Evento em Dinheiro - Excluído",
            "evento em dinheiro cancelado: não houve pagamento",
        )
    ]
    assert [asset["ticker"] for asset in preview["new_assets"]] == ["ABCD11", "WXYZ3"]


def test_received_income_report_is_read_without_the_footer(api: TestClient) -> None:
    """O relatório de proventos recebidos entra pelo cabeçalho dele, e o rodapé com o
    total não vira linha."""
    content = _xlsx(RECEIVED_JCP, *RECEIVED_FOOTER, header=INCOME_HEADER)

    preview = _preview_files(api, ("proventos.xlsx", content))

    assert preview["files"][0]["source"] == "b3_income"
    assert [
        (
            row["ticker"],
            row["income_type"],
            row["quantity"],
            row["unit_price"],
            row["amount"],
        )
        for row in preview["income_rows"]
    ] == [("WXYZ3", "jcp", "10", "0.24", "2")]


def test_both_b3_reports_in_one_batch_keep_the_extract_row(
    api: TestClient, session: Session
) -> None:
    """Os dois relatórios trazem o mesmo provento: ele entra uma vez só, com o valor
    por unidade em 3 casas do relatório de movimentação, em qualquer ordem dos
    arquivos. Importar de novo grava zero."""
    received = _xlsx(RECEIVED_JCP, *RECEIVED_FOOTER, header=INCOME_HEADER)
    extract = _xlsx(EXTRACT_JCP)

    preview = _preview_files(
        api, ("proventos.xlsx", received), ("movimentacao.xlsx", extract)
    )
    statuses = [(row["file"], row["status"]) for row in preview["income_rows"]]
    result = _confirm_preview(api, preview)
    again = _confirm_preview(
        api,
        _preview_files(
            api, ("movimentacao.xlsx", extract), ("proventos.xlsx", received)
        ),
    )

    assert statuses == [
        ("movimentacao.xlsx", "new"),
        ("proventos.xlsx", "repeated_in_batch"),
    ]
    assert result["income_created"] == 1
    assert again["income_created"] == 0
    assert [event.unit_price for event in session.scalars(select(IncomeEvent))] == [
        Decimal("0.235")
    ]


def test_same_income_twice_on_a_day_enters_twice(api: TestClient) -> None:
    """Dois rendimentos iguais no mesmo dia do mesmo arquivo são dois pagamentos."""
    row = _income_row(
        "15/03/2024", "Rendimento", "WXYZ3 - EMPRESA WXYZ S/A", 2, 0.005, 0.01
    )
    content = _xlsx(row, row)

    result = _confirm_preview(api, _preview_files(api, ("movimentacao.xlsx", content)))

    assert result["income_created"] == 2


def test_income_differing_from_a_registered_one_is_a_possible_duplicate(
    api: TestClient,
) -> None:
    """Um provento do mesmo ativo, dia e tipo de um já gravado, sem par exato, sai
    como possível duplicata: é o mesmo pagamento cadastrado de outro jeito."""
    first = _xlsx(
        _income_row("15/03/2024", "Dividendo", "WXYZ3 - EMPRESA WXYZ S/A", 10, 0.5, 5)
    )
    _confirm_preview(api, _preview_files(api, ("movimentacao.xlsx", first)))
    other = _xlsx(
        _income_row(
            "15/03/2024", "Dividendo", "WXYZ3 - EMPRESA WXYZ S/A", 10, 0.51, 5.1
        )
    )

    preview = _preview_files(api, ("movimentacao.xlsx", other))

    assert [row["status"] for row in preview["income_rows"]] == ["possible_duplicate"]


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
            income=[],
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
        operations=parse_nubank_note(_note(BUY_LINE)), income=[], new_assets=[]
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
