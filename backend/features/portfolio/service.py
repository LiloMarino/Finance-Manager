from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, Indexer, PortfolioCategory
from backend.core.models.models import Asset
from backend.domain.position import ZERO, Position, current_positions
from backend.repository.fixed_income import MarkedInvestment, marked_investments
from backend.repository.market import AssetPrice, latest_prices
from backend.repository.operations import operation_records
from backend.repository.sectors import Classification, classifications


@dataclass(frozen=True, slots=True, kw_only=True)
class AssetPosition:
    """A posição a mercado. Sem cotação em cache, o ativo vale o custo, e `price`
    fica nulo."""

    asset_id: int
    ticker: str
    asset_class: AssetClass
    sector: str | None
    segment: str | None
    quantity: Decimal
    average_price: Decimal
    total_cost: Decimal
    price: Decimal | None
    price_date: date | None
    market_value: Decimal
    share: Decimal
    unrealized_result: Decimal
    unrealized_return: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class FixedIncomeHolding:
    investment_id: int
    label: str
    indexer: Indexer
    rate: Decimal
    invested: Decimal
    gross_value: Decimal
    estimated_tax: Decimal
    net_value: Decimal
    share: Decimal
    as_of: date


@dataclass(frozen=True, slots=True, kw_only=True)
class CategoryAllocation:
    category: PortfolioCategory
    value: Decimal
    share: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class SectorAllocation:
    """`sector` nulo é o que está sem classificação."""

    sector: str | None
    value: Decimal
    share: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class SegmentAllocation:
    sector: str | None
    segment: str | None
    value: Decimal
    share: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class Portfolio:
    """O patrimônio de hoje: renda variável a mercado e renda fixa pelo valor
    bruto marcado. Setor e segmento dividem só a renda variável, e a fração deles é
    sobre o total dela."""

    total: Decimal
    categories: list[CategoryAllocation]
    positions: list[AssetPosition]
    fixed_income: list[FixedIncomeHolding]
    sectors: list[SectorAllocation]
    segments: list[SegmentAllocation]


def _share(value: Decimal, total: Decimal) -> Decimal:
    return value / total if total else ZERO


@dataclass(frozen=True, slots=True, kw_only=True)
class _Valued:
    asset: Asset
    position: Position
    price: AssetPrice | None
    classification: Classification | None

    @property
    def market_value(self) -> Decimal:
        if self.price is None or self.price.close is None:
            return self.position.total_cost
        return self.position.quantity * self.price.close


def _asset_position(valued: _Valued, total: Decimal) -> AssetPosition:
    cost = valued.position.total_cost
    result = valued.market_value - cost
    return AssetPosition(
        asset_id=valued.asset.id,
        ticker=valued.asset.ticker,
        asset_class=valued.asset.asset_class,
        sector=valued.classification.sector if valued.classification else None,
        segment=valued.classification.segment if valued.classification else None,
        quantity=valued.position.quantity,
        average_price=valued.position.average_price,
        total_cost=cost,
        price=valued.price.close if valued.price else None,
        price_date=valued.price.price_date if valued.price else None,
        market_value=valued.market_value,
        share=_share(valued.market_value, total),
        unrealized_result=result,
        unrealized_return=result / cost if cost else None,
    )


def _fixed_income_holding(
    investment: MarkedInvestment, total: Decimal
) -> FixedIncomeHolding:
    return FixedIncomeHolding(
        investment_id=investment.id,
        label=investment.label,
        indexer=investment.indexer,
        rate=investment.rate,
        invested=investment.invested,
        gross_value=investment.gross_value,
        estimated_tax=investment.estimated_tax,
        net_value=investment.net_value,
        share=_share(investment.gross_value, total),
        as_of=investment.as_of,
    )


def _by_classification(
    valued: list[_Valued],
) -> tuple[list[SectorAllocation], list[SegmentAllocation]]:
    """A renda variável por setor e por segmento, do maior valor para o menor."""
    equity = sum((item.market_value for item in valued), ZERO)
    by_sector: defaultdict[str | None, Decimal] = defaultdict(Decimal)
    by_segment: defaultdict[tuple[str | None, str | None], Decimal] = defaultdict(
        Decimal
    )
    for item in valued:
        found = item.classification
        by_sector[found.sector if found else None] += item.market_value
        key = (found.sector, found.segment) if found else (None, None)
        by_segment[key] += item.market_value
    sectors = [
        SectorAllocation(sector=sector, value=value, share=_share(value, equity))
        for sector, value in by_sector.items()
    ]
    segments = [
        SegmentAllocation(
            sector=sector, segment=segment, value=value, share=_share(value, equity)
        )
        for (sector, segment), value in by_segment.items()
    ]
    return (
        sorted(sectors, key=lambda item: item.value, reverse=True),
        sorted(segments, key=lambda item: item.value, reverse=True),
    )


def portfolio(session: Session, today: date) -> Portfolio:
    positions = current_positions(operation_records(session))
    prices = {price.asset_id: price for price in latest_prices(session)}
    classes = classifications(session)
    valued = [
        _Valued(
            asset=asset,
            position=position,
            price=prices.get(asset.id),
            classification=(
                classes.get(asset.segment_id) if asset.segment_id is not None else None
            ),
        )
        for asset in session.scalars(select(Asset).order_by(Asset.ticker))
        if (position := positions.get(asset.ticker)) is not None
        and position.quantity != 0
    ]
    investments = [
        investment
        for investment in marked_investments(session, today)
        if investment.gross_value > 0
    ]

    by_category: defaultdict[PortfolioCategory, Decimal] = defaultdict(Decimal)
    for item in valued:
        by_category[PortfolioCategory(item.asset.asset_class)] += item.market_value
    for investment in investments:
        by_category[PortfolioCategory.FIXED_INCOME] += investment.gross_value
    total = sum(by_category.values(), ZERO)
    sectors, segments = _by_classification(valued)

    return Portfolio(
        total=total,
        categories=[
            CategoryAllocation(
                category=category,
                value=by_category[category],
                share=_share(by_category[category], total),
            )
            for category in PortfolioCategory
            if by_category[category] > 0
        ],
        positions=[_asset_position(item, total) for item in valued],
        fixed_income=[
            _fixed_income_holding(investment, total) for investment in investments
        ],
        sectors=sectors,
        segments=segments,
    )
