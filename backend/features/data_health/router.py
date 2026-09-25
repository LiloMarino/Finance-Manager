from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.features.data_health.dto import DataIssueDTO
from backend.features.data_health.service import data_issues

router = APIRouter(prefix="/api/data-health", tags=["data-health"])


@router.get("")
def list_issues(session: SessionDep) -> list[DataIssueDTO]:
    return data_issues(session, datetime.now())
