from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import AssetClass, Indexer, PortfolioCategory
from backend.features.portfolio.service import portfolio

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


class PositionDTO(BaseDTO):
    """`price` nulo é ativo sem cotação em cache, valorado pelo custo."""

    asset_id: int
    ticker: str
    asset_class: AssetClass
    sector: str | None
    segment: str | None
    quantity: DecimalStr
    average_price: DecimalStr
    total_cost: DecimalStr
    price: DecimalStr | None
    price_date: date | None
    market_value: DecimalStr
    share: DecimalStr
    unrealized_result: DecimalStr
    unrealized_return: DecimalStr | None


class FixedIncomeHoldingDTO(BaseDTO):
    investment_id: int
    label: str
    indexer: Indexer
    rate: DecimalStr
    invested: DecimalStr
    gross_value: DecimalStr
    estimated_tax: DecimalStr
    net_value: DecimalStr
    share: DecimalStr
    as_of: date


class CategoryAllocationDTO(BaseDTO):
    category: PortfolioCategory
    value: DecimalStr
    share: DecimalStr


class SectorAllocationDTO(BaseDTO):
    """`sector` nulo é o que está sem classificação."""

    sector: str | None
    value: DecimalStr
    share: DecimalStr


class SegmentAllocationDTO(BaseDTO):
    sector: str | None
    segment: str | None
    value: DecimalStr
    share: DecimalStr


class PortfolioDTO(BaseDTO):
    """Frações (`share`, `unrealized_return`) vão de 0 a 1. A de setor e segmento
    é sobre o total da renda variável."""

    total: DecimalStr
    categories: list[CategoryAllocationDTO]
    positions: list[PositionDTO]
    fixed_income: list[FixedIncomeHoldingDTO]
    sectors: list[SectorAllocationDTO]
    segments: list[SegmentAllocationDTO]


@router.get("")
def get_portfolio(session: SessionDep) -> PortfolioDTO:
    return PortfolioDTO.model_validate(portfolio(session, date.today()))
