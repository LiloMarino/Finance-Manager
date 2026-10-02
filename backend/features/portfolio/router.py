from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import (
    AssetClass,
    FixedIncomeType,
    Indexer,
    LiquidityTier,
    PortfolioCategory,
)
from backend.repository.portfolio import portfolio

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


class SubtotalDTO(BaseDTO):
    """A soma de um grupo de itens. `cost` é o custo da renda variável e o
    principal da renda fixa. A variação do dia é nula quando nenhum item do grupo
    tem uma."""

    asset_count: int
    value: DecimalStr
    share: DecimalStr
    cost: DecimalStr
    unrealized_result: DecimalStr
    unrealized_return: DecimalStr | None
    day_change: DecimalStr | None
    day_return: DecimalStr | None


class CategoryAllocationDTO(SubtotalDTO):
    category: PortfolioCategory


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


class LiquidityAllocationDTO(BaseDTO):
    """O quanto do patrimônio vira dinheiro em cada prazo: hoje (`daily`: saldo e
    renda fixa com liquidez diária), em 2 dias úteis (`intermediate`: renda
    variável) e no vencimento (`locked`: renda fixa sem liquidez diária)."""

    tier: LiquidityTier
    value: DecimalStr
    share: DecimalStr


class MaturityBucketDTO(BaseDTO):
    """O bruto de hoje dos títulos travados que vencem no período que começa em
    `start`; nulo é o travado sem vencimento."""

    start: date | None
    value: DecimalStr


class PortfolioDTO(BaseDTO):
    """Frações (`share`, `unrealized_return`, `day_return`) vão de 0 a 1. A de setor
    e segmento é sobre o total da renda variável.

    A variação do dia da renda variável compara o fechamento de `price_date`, o
    pregão mais recente do cache, com o de `previous_price_date`; a da renda fixa é
    a marcação de hoje contra a do dia útil anterior.

    `cash` é o saldo de investimento, nulo na subcarteira e antes da abertura. O
    resultado não realizado é o das categorias investidas, sem o saldo. `equity`
    soma a renda variável inteira."""

    total: DecimalStr
    cash: DecimalStr | None
    unrealized_result: DecimalStr
    unrealized_return: DecimalStr | None
    day_change: DecimalStr | None
    day_return: DecimalStr | None
    price_date: date | None
    previous_price_date: date | None
    categories: list[CategoryAllocationDTO]
    equity: SubtotalDTO | None
    positions: list[PositionDTO]
    fixed_income: list[FixedIncomeHoldingDTO]
    sectors: list[SectorAllocationDTO]
    segments: list[SegmentAllocationDTO]
    liquidity: list[LiquidityAllocationDTO]
    maturities_by_month: list[MaturityBucketDTO]
    maturities_by_year: list[MaturityBucketDTO]


@router.get("")
def get_portfolio(
    session: SessionDep, subportfolio_id: int | None = None
) -> PortfolioDTO:
    return PortfolioDTO.model_validate(
        portfolio(session, date.today(), subportfolio_id)
    )
