from __future__ import annotations

from datetime import date

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.rebalance.dto import (
    PlanDTO,
    PlanInDTO,
    RebalanceDTO,
    TargetsDTO,
    TargetsInDTO,
)
from backend.features.rebalance.service import get_targets, plan, rebalance, set_targets

router = APIRouter(prefix="/api/rebalance", tags=["rebalance"])


@router.get("")
def get_rebalance(
    session: SessionDep, subportfolio_id: int | None = None
) -> RebalanceDTO:
    """A meta de uma subcarteira ou, sem `subportfolio_id`, a combinada da geral."""
    return rebalance(session, date.today(), subportfolio_id)


@router.post("/plan")
def get_plan(session: SessionDep, payload: PlanInDTO) -> PlanDTO:
    """Conta sobre o aporte enviado, sem gravar nada."""
    return plan(session, date.today(), payload)


@router.get("/{subportfolio_id}/targets")
def read_targets(session: SessionDep, subportfolio_id: int) -> TargetsDTO:
    return get_targets(session, subportfolio_id)


@router.put("/{subportfolio_id}/targets", status_code=status.HTTP_204_NO_CONTENT)
def write_targets(
    session: SessionDep, subportfolio_id: int, payload: TargetsInDTO
) -> None:
    set_targets(session, subportfolio_id, payload)
