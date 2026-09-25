from __future__ import annotations

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.features.simulation.dto import (
    ComparisonDTO,
    ComparisonInDTO,
    CurrentRatesDTO,
    InstallmentsDTO,
    InstallmentsInDTO,
)
from backend.features.simulation.service import (
    compare_options,
    rates_now,
    simulate_installments,
)

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


@router.get("/rates")
def current(session: SessionDep) -> CurrentRatesDTO:
    """O ponto de partida da projeção: o último valor real de cada série."""
    return rates_now(session)


@router.post("/fixed-income")
def fixed_income(session: SessionDep, payload: ComparisonInDTO) -> ComparisonDTO:
    """Conta sobre os valores enviados, sem gravar nada."""
    return compare_options(session, payload)


@router.post("/installments")
def installments(session: SessionDep, payload: InstallmentsInDTO) -> InstallmentsDTO:
    """Conta sobre os valores enviados, sem gravar nada."""
    return simulate_installments(session, payload)
