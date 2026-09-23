from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter

from backend.core.dto import BaseDTO

router = APIRouter(prefix="/api/health", tags=["health"])


class HealthDTO(BaseDTO):
    status: str
    version: str
    checked_at: datetime


@router.get("")
def get_health() -> HealthDTO:
    return HealthDTO(status="ok", version="0.1.0", checked_at=datetime.now(UTC))
