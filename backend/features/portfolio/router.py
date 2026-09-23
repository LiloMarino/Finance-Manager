from __future__ import annotations

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import AssetClass
from backend.features.portfolio.service import open_positions

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


class PositionDTO(BaseDTO):
    asset_id: int
    ticker: str
    asset_class: AssetClass
    quantity: DecimalStr
    average_price: DecimalStr
    total_cost: DecimalStr


@router.get("/positions")
def positions(session: SessionDep) -> list[PositionDTO]:
    return [
        PositionDTO.model_validate(position) for position in open_positions(session)
    ]
