"""Importação de arquivos em dois passos: o preview não grava nada, o confirmar grava
as linhas escolhidas.

Importar é idempotente. Uma operação é identificada por
`(ticker, data, tipo, quantidade, preço)`, e um provento por
`(ticker, data, tipo, quantidade, valor líquido)`; de cada chave entram só as
ocorrências que o banco ainda não tem. Dentro de um lote, cada arquivo é um retrato
completo do que cobre: a mesma chave em dois arquivos é a mesma linha, e conta pelo
arquivo que a traz mais vezes.
"""

from __future__ import annotations

import re
from collections import Counter
from collections.abc import Callable, Hashable, Iterable, Sequence
from dataclasses import dataclass, field, replace
from datetime import date
from decimal import Decimal
from pathlib import Path

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.adapters.b3_movements import read_b3_report
from backend.adapters.pdf_text import extract_pdf_text
from backend.core.enum import (
    AssetClass,
    ImportSource,
    ImportStatus,
    IncomeType,
    OperationType,
)
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, IncomeEvent, Operation
from backend.domain.income import IncomeRecord
from backend.domain.position import CORPORATE_EVENTS, OperationRecord
from backend.features.imports.b3_report import parse_b3_movements
from backend.features.imports.dto import (
    IgnoredMovementDTO,
    ImportConfirmDTO,
    ImportedIncomeDTO,
    ImportedOperationDTO,
    ImportFileDTO,
    ImportPreviewDTO,
    ImportResultDTO,
    IncomePreviewRowDTO,
    NewAssetDTO,
    PreviewRowDTO,
)
from backend.features.imports.nubank_note import parse_nubank_note
from backend.repository.income import income_records
from backend.repository.market import drop_price_cache
from backend.repository.operations import check_positions, operation_records
from backend.repository.tickers import resolve_tickers

type OperationKey = tuple[str, date, OperationType, Decimal, Decimal]
type IncomeKey = tuple[str, date, IncomeType, Decimal, Decimal]

BDR_SUFFIXES = ("31", "32", "33", "34", "35", "39")


class ImportFileError(ValueError):
    pass


class MissingAssetClassError(FinanceError):
    status = 422


@dataclass(frozen=True, slots=True, kw_only=True)
class UploadedFile:
    name: str
    content: bytes


@dataclass(frozen=True, slots=True, kw_only=True)
class ParsedFile:
    name: str
    source: ImportSource | None = None
    operations: list[ImportedOperationDTO] = field(
        default_factory=list[ImportedOperationDTO]
    )
    income: list[ImportedIncomeDTO] = field(default_factory=list[ImportedIncomeDTO])
    ignored: list[IgnoredMovementDTO] = field(default_factory=list[IgnoredMovementDTO])
    error: str | None = None


def _operation_key(operation: ImportedOperationDTO | OperationRecord) -> OperationKey:
    return (
        operation.ticker,
        operation.operation_date,
        operation.operation_type,
        operation.quantity,
        operation.unit_price,
    )


def _operation_day(
    operation: ImportedOperationDTO | OperationRecord,
) -> tuple[str, date, OperationType]:
    return (operation.ticker, operation.operation_date, operation.operation_type)


def _income_key(income: ImportedIncomeDTO | IncomeRecord) -> IncomeKey:
    """Sem o valor por unidade: o relatório de proventos recebidos arredonda ele, e é
    o mesmo provento do relatório de movimentação."""
    return (
        income.ticker,
        income.payment_date,
        income.income_type,
        income.quantity,
        income.amount,
    )


def _income_day(
    income: ImportedIncomeDTO | IncomeRecord,
) -> tuple[str, date, IncomeType]:
    return (income.ticker, income.payment_date, income.income_type)


def infer_asset_class(ticker: str) -> AssetClass:
    """Pelo sufixo do código. O 11 é FII, ETF ou unit, e quem decide é o usuário no
    preview; FII é só o ponto de partida."""
    suffix = re.search(r"(\d+)$", ticker)
    digits = suffix.group(1) if suffix else ""
    if digits.endswith(BDR_SUFFIXES):
        return AssetClass.BDR
    if digits.endswith("11"):
        return AssetClass.FII
    return AssetClass.STOCK


def _parse(file: UploadedFile) -> ParsedFile:
    extension = Path(file.name).suffix.lower()
    if extension == ".xlsx":
        try:
            report = read_b3_report(file.content)
        except Exception as error:
            raise ImportFileError(f"Não foi possível ler o xlsx: {error}") from error
        parsed = parse_b3_movements(file.name, report.movements)
        return ParsedFile(
            name=file.name,
            source=ImportSource.B3_INCOME if report.income_only else ImportSource.B3,
            operations=parsed.operations,
            income=parsed.income,
            ignored=parsed.ignored,
        )
    if extension == ".pdf":
        try:
            text = extract_pdf_text(file.content)
        except Exception as error:
            raise ImportFileError("Não foi possível ler o PDF.") from error
        return ParsedFile(
            name=file.name,
            source=ImportSource.NUBANK,
            operations=parse_nubank_note(text),
        )
    raise ImportFileError(
        "Formato não suportado: envie um relatório da B3 em xlsx ou a nota de "
        "corretagem em PDF."
    )


def parse_file(file: UploadedFile) -> ParsedFile:
    """Um arquivo ruim vira erro dele mesmo, sem derrubar o resto do lote."""
    try:
        return _parse(file)
    except ValueError as error:
        return ParsedFile(name=file.name, error=str(error))


def _known_tickers(session: Session, tickers: Iterable[str]) -> set[str]:
    return set(session.scalars(select(Asset.ticker).where(Asset.ticker.in_(tickers))))


def _current_tickers[T: ImportedOperationDTO | ImportedIncomeDTO](
    session: Session, rows: Sequence[T]
) -> list[T]:
    """Cada linha com o ticker atual do ativo: o arquivo anterior a uma troca de
    ticker traz o antigo, e ela é do mesmo ativo."""
    resolved = resolve_tickers(session, {row.ticker for row in rows})
    return [
        row.model_copy(update={"ticker": resolved.get(row.ticker, row.ticker)})
        for row in rows
    ]


def _classify[R: BaseModel, K: Hashable, D: Hashable](
    files: Sequence[tuple[str, Sequence[R]]],
    key: Callable[[R], K],
    day: Callable[[R], D],
    existing_keys: Counter[K],
    existing_days: set[D],
) -> list[tuple[str, R, ImportStatus]]:
    """O status de cada linha do lote, na ordem dos arquivos: a primeira ocorrência
    de uma chave no lote é a que conta, e as que passam do máximo de um arquivo são
    repetição."""
    in_batch: Counter[K] = Counter()
    for _, rows in files:
        in_batch |= Counter(key(row) for row in rows)

    seen: Counter[K] = Counter()
    classified: list[tuple[str, R, ImportStatus]] = []
    for name, rows in files:
        for row in rows:
            found = key(row)
            seen[found] += 1
            if seen[found] > in_batch[found]:
                status = ImportStatus.REPEATED_IN_BATCH
            elif seen[found] <= existing_keys[found]:
                status = ImportStatus.EXISTING
            elif day(row) in existing_days:
                status = ImportStatus.POSSIBLE_DUPLICATE
            else:
                status = ImportStatus.NEW
            classified.append((name, row, status))
    return classified


def preview_import(session: Session, files: Sequence[ParsedFile]) -> ImportPreviewDTO:
    files = [
        replace(
            file,
            operations=_current_tickers(session, file.operations),
            income=_current_tickers(session, file.income),
        )
        for file in files
    ]

    operation_tickers = {op.ticker for file in files for op in file.operations}
    existing_operations = operation_records(session, operation_tickers)
    rows = [
        PreviewRowDTO(**op.model_dump(), file=name, status=status)
        for name, op, status in _classify(
            [(file.name, file.operations) for file in files],
            _operation_key,
            _operation_day,
            Counter(_operation_key(op) for op in existing_operations),
            {_operation_day(op) for op in existing_operations},
        )
    ]

    # O relatório de movimentação vem antes: é a linha dele, com o valor por unidade
    # em 3 casas, que fica quando o de proventos recebidos traz o mesmo provento
    income_files = sorted(files, key=lambda file: file.source is ImportSource.B3_INCOME)
    income_tickers = {row.ticker for file in files for row in file.income}
    existing_income = income_records(session, income_tickers)
    income_rows = [
        IncomePreviewRowDTO(**row.model_dump(), file=name, status=status)
        for name, row, status in _classify(
            [(file.name, file.income) for file in income_files],
            _income_key,
            _income_day,
            Counter(_income_key(row) for row in existing_income),
            {_income_day(row) for row in existing_income},
        )
    ]

    pending = (ImportStatus.NEW, ImportStatus.POSSIBLE_DUPLICATE)
    candidates = {row.ticker for row in rows if row.status in pending} | {
        row.ticker for row in income_rows if row.status in pending
    }
    new_tickers = sorted(candidates - _known_tickers(session, candidates))
    return ImportPreviewDTO(
        files=[
            ImportFileDTO(name=file.name, source=file.source, error=file.error)
            for file in files
        ],
        rows=rows,
        income_rows=income_rows,
        ignored=[movement for file in files for movement in file.ignored],
        new_assets=[
            NewAssetDTO(ticker=ticker, asset_class=infer_asset_class(ticker))
            for ticker in new_tickers
        ],
    )


def confirm_import(session: Session, payload: ImportConfirmDTO) -> ImportResultDTO:
    """Grava as linhas escolhidas que o banco ainda não tem, numa transação só.

    A regra de multiplicidade roda de novo aqui: confirmar duas vezes o mesmo preview
    grava na segunda vez zero linhas.
    """
    operations = _current_tickers(session, payload.operations)
    income = _current_tickers(session, payload.income)
    tickers = {op.ticker for op in operations} | {row.ticker for row in income}
    assets = {
        asset.ticker: asset
        for asset in session.scalars(select(Asset).where(Asset.ticker.in_(tickers)))
    }
    classes = {asset.ticker: asset.asset_class for asset in payload.new_assets}
    missing = sorted(tickers - assets.keys() - classes.keys())
    if missing:
        raise MissingAssetClassError(
            "Informe a classe dos ativos novos: " + ", ".join(missing)
        )

    created_assets = sorted(tickers - assets.keys())
    for ticker in created_assets:
        assets[ticker] = Asset(ticker=ticker, asset_class=classes[ticker])
    session.add_all(assets[ticker] for ticker in created_assets)
    session.flush()

    remaining = Counter(
        _operation_key(op) for op in operation_records(session, tickers)
    )
    created = 0
    evented: set[int] = set()
    for op in operations:
        key = _operation_key(op)
        if remaining[key] > 0:
            remaining[key] -= 1
            continue
        session.add(
            Operation(
                asset_id=assets[op.ticker].id,
                operation_date=op.operation_date,
                operation_type=op.operation_type,
                quantity=op.quantity,
                unit_price=op.unit_price,
            )
        )
        created += 1
        if op.operation_type in CORPORATE_EVENTS:
            evented.add(assets[op.ticker].id)

    remaining_income = Counter(
        _income_key(row) for row in income_records(session, tickers)
    )
    income_created = 0
    for row in income:
        key = _income_key(row)
        if remaining_income[key] > 0:
            remaining_income[key] -= 1
            continue
        session.add(
            IncomeEvent(
                asset_id=assets[row.ticker].id,
                payment_date=row.payment_date,
                income_type=row.income_type,
                quantity=row.quantity,
                unit_price=row.unit_price,
                amount=row.amount,
            )
        )
        income_created += 1

    check_positions(session, tickers)
    drop_price_cache(session, evented)
    session.commit()
    return ImportResultDTO(
        created=created,
        skipped=len(payload.operations) - created,
        income_created=income_created,
        income_skipped=len(payload.income) - income_created,
        assets_created=created_assets,
    )
