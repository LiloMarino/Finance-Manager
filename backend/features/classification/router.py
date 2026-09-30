from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.classification.dto import AcceptInDTO, PendingDTO, SuggestionDTO
from backend.features.classification.service import accept, pending, suggestion_for
from backend.features.providers import ProfileProviderDep

router = APIRouter(prefix="/api/classification", tags=["classification"])


@router.get("/suggestion")
def suggestion(
    ticker: str, session: SessionDep, provider: ProfileProviderDep
) -> SuggestionDTO | None:
    """O setor e o segmento sugeridos para o ticker. Nulo quando a fonte não conhece o
    ticker ou não o classifica; a fonte fora do ar, sem perfil em cache, dá 503."""
    return suggestion_for(session, provider, ticker, datetime.now())


@router.get("/pending")
def list_pending(session: SessionDep, provider: ProfileProviderDep) -> PendingDTO:
    return pending(session, provider, datetime.now())


@router.post("/accept", status_code=status.HTTP_204_NO_CONTENT)
def accept_all(session: SessionDep, payload: AcceptInDTO) -> None:
    accept(session, payload)
