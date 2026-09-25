from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import (
    AssetClass,
    FixedIncomeType,
    Indexer,
    PortfolioCategory,
)
from backend.features.portfolio.service import portfolio

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


class PositionDTO(BaseDTO):
    """`price` nulo é ativo sem cotação em cache, valorado pelo custo. A variação do
    dia é nula quando o ativo não tem o fechamento do pregão mais recente, ou não
    tem o anterior a ele."""

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
    day_change: DecimalStr | None
    day_return: DecimalStr | None


class FixedIncomeHoldingDTO(BaseDTO):
    investment_id: int
    label: str
    product_type: FixedIncomeType
    indexer: Indexer
    rate: DecimalStr
    invested: DecimalStr
    gross_value: DecimalStr
    estimated_tax: DecimalStr
    net_value: DecimalStr
    share: DecimalStr
    unrealized_result: DecimalStr
    unrealized_return: DecimalStr | None
    day_change: DecimalStr
    day_return: DecimalStr | None
    as_of: date


class CategoryAllocationDTO(BaseDTO):
    """`cost` é o custo da renda variável e o principal da renda fixa. A variação
    do dia é nula quando nenhum item da categoria tem uma."""

    category: PortfolioCategory
    asset_count: int
    value: DecimalStr
    share: DecimalStr
    cost: DecimalStr
    unrealized_result: DecimalStr
    unrealized_return: DecimalStr | None
    day_change: DecimalStr | None
    day_return: DecimalStr | None


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
    """Frações (`share`, `unrealized_return`, `day_return`) vão de 0 a 1. A de setor
    e segmento é sobre o total da renda variável.

    A variação do dia da renda variável compara o fechamento de `price_date`, o
    pregão mais recente do cache, com o de `previous_price_date`; a da renda fixa é
    a marcação de hoje contra a do dia útil anterior."""

    total: DecimalStr
    day_change: DecimalStr | None
    day_return: DecimalStr | None
    price_date: date | None
    previous_price_date: date | None
    categories: list[CategoryAllocationDTO]
    positions: list[PositionDTO]
    fixed_income: list[FixedIncomeHoldingDTO]
    sectors: list[SectorAllocationDTO]
    segments: list[SegmentAllocationDTO]


@router.get("")
def get_portfolio(session: SessionDep) -> PortfolioDTO:
    return PortfolioDTO.model_validate(portfolio(session, date.today()))
