from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import PortfolioCategory
from backend.features.risk_return.service import risk_return

router = APIRouter(prefix="/api/risk-return", tags=["risk-return"])


class RiskPointDTO(BaseDTO):
    """`period_return` em fração (0,1 é 10%), pela variação da cota, com os
    proventos. `volatility` também em fração, anualizada, e nula com menos de 20
    retornos diários; `returns` é quantos entraram na conta."""

    period_return: DecimalStr
    volatility: float | None
    returns: int


class RiskItemDTO(BaseDTO):
    """Um ativo ou um título, com o valor no fim do período."""

    asset_id: int | None
    investment_id: int | None
    label: str
    category: PortfolioCategory
    value: DecimalStr
    risk: RiskPointDTO


class RiskReturnDTO(BaseDTO):
    """`start` é o dia cujo fechamento é a base do período, nulo quando ele começa
    com a carteira. Cada item conta desde o próprio começo, se for depois."""

    start: date | None
    end: date | None
    portfolio: RiskPointDTO | None
    items: list[RiskItemDTO]


@router.get("")
def get_risk_return(
    session: SessionDep,
    category: PortfolioCategory | None = None,
    subportfolio_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
) -> RiskReturnDTO:
    return RiskReturnDTO.model_validate(
        risk_return(
            session,
            date.today(),
            category=category,
            subportfolio_id=subportfolio_id,
            start=start,
            end=end,
        )
    )
