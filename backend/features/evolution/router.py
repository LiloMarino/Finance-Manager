from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import PortfolioCategory
from backend.features.evolution.service import evolution

router = APIRouter(prefix="/api/evolution", tags=["evolution"])


class EvolutionPointDTO(BaseDTO):
    """`invested` é o que entrou menos o que saiu até o dia, e `gain` é o
    patrimônio menos ele."""

    day: date
    value: DecimalStr
    invested: DecimalStr
    gain: DecimalStr


class GrowthDTO(BaseDTO):
    """A variação do patrimônio, com os aportes e os resgates dentro; o retorno é
    em fração e nulo quando o patrimônio de partida é zero."""

    change: DecimalStr
    growth_return: DecimalStr | None


class CategoryValueDTO(BaseDTO):
    category: PortfolioCategory
    value: DecimalStr


class EvolutionDTO(BaseDTO):
    """`total` e o crescimento contam até hoje, e o crescimento é nulo quando a
    carteira é mais nova que ele. As categorias são as da carteira toda, com o
    valor de hoje."""

    total: DecimalStr
    last_6_months: GrowthDTO | None
    last_12_months: GrowthDTO | None
    last_24_months: GrowthDTO | None
    categories: list[CategoryValueDTO]
    points: list[EvolutionPointDTO]


@router.get("")
def get_evolution(
    session: SessionDep,
    category: PortfolioCategory | None = None,
    start: date | None = None,
    end: date | None = None,
) -> EvolutionDTO:
    return EvolutionDTO.model_validate(
        evolution(session, date.today(), category=category, start=start, end=end)
    )
