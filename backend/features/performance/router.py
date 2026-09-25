from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import PortfolioCategory
from backend.features.performance.service import performance

router = APIRouter(prefix="/api/performance", tags=["performance"])


class ReturnPointDTO(BaseDTO):
    day: date
    cumulative_return: DecimalStr


class PerformanceDTO(BaseDTO):
    """Retornos em fração (0,1 é 10%), pela variação da cota, sem contar aportes e
    resgates. `start` é o dia cujo fechamento é a base do período, nulo quando ele
    começa com a carteira, e os pontos acumulam desde essa base. Os retornos
    recentes contam até hoje e são nulos quando a carteira é mais nova que eles."""

    first_date: date | None
    start: date | None
    end: date | None
    since_inception: DecimalStr | None
    period: DecimalStr | None
    last_6_months: DecimalStr | None
    last_12_months: DecimalStr | None
    last_24_months: DecimalStr | None
    points: list[ReturnPointDTO]


@router.get("")
def get_performance(
    session: SessionDep,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
) -> PerformanceDTO:
    return PerformanceDTO.model_validate(
        performance(
            session,
            date.today(),
            category=category,
            asset_id=asset_id,
            start=start,
            end=end,
        )
    )
