"""Importação de arquivos em dois passos: o preview não grava nada, o confirmar grava
as linhas escolhidas.

Importar é idempotente. Uma operação é identificada por
`(ticker, data, tipo, quantidade, preço)`, e dessa chave entram só as ocorrências que
o banco ainda não tem. Dentro de um lote, cada arquivo é um retrato completo do que
cobre: a mesma chave em dois arquivos é a mesma operação, e conta pelo arquivo que a
traz mais vezes.
"""

from __future__ import annotations

import re
from collections import Counter
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field, replace
from datetime import date
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.adapters.b3_movements import read_b3_movements
from backend.adapters.pdf_text import extract_pdf_text
from backend.core.enum import AssetClass, ImportSource, ImportStatus, OperationType
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, Operation
from backend.domain.position import OperationRecord
from backend.features.operations.b3_report import parse_b3_movements
from backend.features.operations.dto import (
    IgnoredMovementDTO,
    ImportConfirmDTO,
    ImportedOperationDTO,
    ImportFileDTO,
    ImportPreviewDTO,
    ImportResultDTO,
    NewAssetDTO,
    PreviewRowDTO,
)
from backend.features.operations.nubank_note import parse_nubank_note
from backend.repository.operations import check_positions, operation_records
from backend.repository.tickers import resolve_tickers

type Key = tuple[str, date, OperationType, Decimal, Decimal]
type Day = tuple[str, date, OperationType]

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
    ignored: list[IgnoredMovementDTO] = field(default_factory=list[IgnoredMovementDTO])
    error: str | None = None


def _key(operation: ImportedOperationDTO | OperationRecord) -> Key:
    return (
        operation.ticker,
        operation.operation_date,
        operation.operation_type,
        operation.quantity,
        operation.unit_price,
    )


def _day(operation: ImportedOperationDTO | OperationRecord) -> Day:
    return (operation.ticker, operation.operation_date, operation.operation_type)


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
            movements = read_b3_movements(file.content)
        except Exception as error:
            raise ImportFileError(f"Não foi possível ler o xlsx: {error}") from error
        operations, ignored = parse_b3_movements(file.name, movements)
        return ParsedFile(
            name=file.name,
            source=ImportSource.B3,
            operations=operations,
            ignored=ignored,
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
        "Formato não suportado: envie o xlsx de movimentação da B3 ou a nota de "
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


def _current_tickers[T: ImportedOperationDTO](
    session: Session, operations: Sequence[T]
) -> list[T]:
    """Cada operação com o ticker atual do ativo: a nota anterior a uma troca de
    ticker traz o antigo, e ela é do mesmo ativo."""
    resolved = resolve_tickers(session, {op.ticker for op in operations})
    return [
        op.model_copy(update={"ticker": resolved.get(op.ticker, op.ticker)})
        for op in operations
    ]


def preview_import(session: Session, files: Sequence[ParsedFile]) -> ImportPreviewDTO:
    files = [
        replace(file, operations=_current_tickers(session, file.operations))
        for file in files
    ]
    operations = [op for file in files for op in file.operations]
    tickers = {op.ticker for op in operations}
    existing = operation_records(session, tickers)
    existing_keys = Counter(_key(op) for op in existing)
    existing_days = {_day(op) for op in existing}

    in_batch: Counter[Key] = Counter()
    for file in files:
        in_batch |= Counter(_key(op) for op in file.operations)

    seen: Counter[Key] = Counter()
    rows: list[PreviewRowDTO] = []
    for file in files:
        for op in file.operations:
            key = _key(op)
            seen[key] += 1
            if seen[key] > in_batch[key]:
                status = ImportStatus.REPEATED_IN_BATCH
            elif seen[key] <= existing_keys[key]:
                status = ImportStatus.EXISTING
            elif _day(op) in existing_days:
                status = ImportStatus.POSSIBLE_DUPLICATE
            else:
                status = ImportStatus.NEW
            rows.append(PreviewRowDTO(**op.model_dump(), file=file.name, status=status))

    candidates = {
        row.ticker
        for row in rows
        if row.status in (ImportStatus.NEW, ImportStatus.POSSIBLE_DUPLICATE)
    }
    new_tickers = sorted(candidates - _known_tickers(session, candidates))
    return ImportPreviewDTO(
        files=[
            ImportFileDTO(name=file.name, source=file.source, error=file.error)
            for file in files
        ],
        rows=rows,
        ignored=[movement for file in files for movement in file.ignored],
        new_assets=[
            NewAssetDTO(ticker=ticker, asset_class=infer_asset_class(ticker))
            for ticker in new_tickers
        ],
    )


def confirm_import(session: Session, payload: ImportConfirmDTO) -> ImportResultDTO:
    """Grava as linhas escolhidas que o banco ainda não tem, numa transação só.

    A regra de multiplicidade roda de novo aqui: confirmar duas vezes o mesmo preview
    grava na segunda vez zero operações.
    """
    operations = _current_tickers(session, payload.operations)
    tickers = {op.ticker for op in operations}
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

    remaining = Counter(_key(op) for op in operation_records(session, tickers))
    created = 0
    for op in operations:
        key = _key(op)
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

    check_positions(session, tickers)
    session.commit()
    return ImportResultDTO(
        created=created,
        skipped=len(payload.operations) - created,
        assets_created=created_assets,
    )
