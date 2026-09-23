from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from backend.core.database.session import SessionDep
from backend.features.operations.dto import (
    ImportConfirmDTO,
    ImportPreviewDTO,
    ImportResultDTO,
)
from backend.features.operations.importing import (
    UploadedFile,
    confirm_import,
    parse_file,
    preview_import,
)

router = APIRouter(prefix="/api/operations", tags=["operations"])


@router.post("/import/preview")
def preview(
    session: SessionDep, files: Annotated[list[UploadFile], File()]
) -> ImportPreviewDTO:
    """Lê os arquivos e classifica cada linha contra o banco, sem gravar nada."""
    parsed = [
        parse_file(
            UploadedFile(name=file.filename or "arquivo", content=file.file.read())
        )
        for file in files
    ]
    return preview_import(session, parsed)


@router.post("/import/confirm")
def confirm(session: SessionDep, payload: ImportConfirmDTO) -> ImportResultDTO:
    return confirm_import(session, payload)
