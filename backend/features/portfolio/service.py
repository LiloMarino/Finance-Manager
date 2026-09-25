from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    FixedIncomeType,
    Indexer,
    PortfolioCategory,
)
from backend.core.models.models import Asset
from backend.domain.position import ZERO, Position, current_positions
from backend.repository.fixed_income import MarkedInvestment, marked_investments
from backend.repository.market import AssetPrice, latest_prices
from backend.repository.operations import operation_records
from backend.repository.sectors import Classification, classifications


@dataclass(frozen=True, slots=True, kw_only=True)
class AssetPosition:
    """A posição a mercado. Sem cotação em cache, o ativo vale o custo, e `price`
    fica nulo. A variação do dia é nula quando o último fechamento do ativo não é
    o do pregão mais recente do cache, ou quando não há o anterior a ele."""

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
    day_change: Decimal | None
    day_return: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class FixedIncomeHolding:
    """O resultado é o bruto marcado menos o principal aplicado."""

    investment_id: int
    label: str
    product_type: FixedIncomeType
    indexer: Indexer
    rate: Decimal
    invested: Decimal
    gross_value: Decimal
    estimated_tax: Decimal
    net_value: Decimal
    share: Decimal
    unrealized_result: Decimal
    unrealized_return: Decimal | None
    day_change: Decimal
    day_return: Decimal | None
    as_of: date


@dataclass(frozen=True, slots=True, kw_only=True)
class CategoryAllocation:
    """A soma dos itens da categoria. `cost` é o custo da renda variável e o
    principal da renda fixa; a variação do dia soma só os itens que têm uma."""

    category: PortfolioCategory
    asset_count: int
    value: Decimal
    share: Decimal
    cost: Decimal
    unrealized_result: Decimal
    unrealized_return: Decimal | None
    day_change: Decimal | None
    day_return: Decimal | None


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
    sobre o total dela.

    A variação do dia da renda variável é o fechamento de `price_date`, o pregão
    mais recente do cache, contra o de `previous_price_date`; a da renda fixa é a
    marcação de hoje contra a do dia útil anterior."""

    total: Decimal
    day_change: Decimal | None
    day_return: Decimal | None
    price_date: date | None
    previous_price_date: date | None
    categories: list[CategoryAllocation]
    positions: list[AssetPosition]
    fixed_income: list[FixedIncomeHolding]
    sectors: list[SectorAllocation]
    segments: list[SegmentAllocation]


def _share(value: Decimal, total: Decimal) -> Decimal:
    return value / total if total else ZERO


def _day_return(change: Decimal, value: Decimal) -> Decimal | None:
    """A variação sobre o valor da véspera, que é o de hoje menos ela."""
    before = value - change
    return change / before if before else None


@dataclass(slots=True)
class _Totals:
    """O acumulado de uma categoria; `day_value` é o valor de hoje só dos itens
    com variação do dia, que é a base do percentual dela."""

    count: int = 0
    value: Decimal = ZERO
    cost: Decimal = ZERO
    day_change: Decimal | None = None
    day_value: Decimal = ZERO

    def add(self, value: Decimal, cost: Decimal, day_change: Decimal | None) -> None:
        self.count += 1
        self.value += value
        self.cost += cost
        if day_change is not None:
            self.day_change = (self.day_change or ZERO) + day_change
            self.day_value += value

    def allocation(
        self, category: PortfolioCategory, total: Decimal
    ) -> CategoryAllocation:
        result = self.value - self.cost
        return CategoryAllocation(
            category=category,
            asset_count=self.count,
            value=self.value,
            share=_share(self.value, total),
            cost=self.cost,
            unrealized_result=result,
            unrealized_return=result / self.cost if self.cost else None,
            day_change=self.day_change,
            day_return=(
                None
                if self.day_change is None
                else _day_return(self.day_change, self.day_value)
            ),
        )


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

    def day_change(self, session_date: date | None) -> Decimal | None:
        price = self.price
        if (
            price is None
            or price.close is None
            or price.previous_close is None
            or price.price_date != session_date
        ):
            return None
        return self.position.quantity * (price.close - price.previous_close)


def _asset_position(
    valued: _Valued, total: Decimal, session_date: date | None
) -> AssetPosition:
    cost = valued.position.total_cost
    result = valued.market_value - cost
    day_change = valued.day_change(session_date)
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
        day_change=day_change,
        day_return=(
            None if day_change is None else _day_return(day_change, valued.market_value)
        ),
    )


def _fixed_income_holding(
    investment: MarkedInvestment, total: Decimal
) -> FixedIncomeHolding:
    result = investment.gross_value - investment.invested
    return FixedIncomeHolding(
        investment_id=investment.id,
        label=investment.label,
        product_type=investment.product_type,
        indexer=investment.indexer,
        rate=investment.rate,
        invested=investment.invested,
        gross_value=investment.gross_value,
        estimated_tax=investment.estimated_tax,
        net_value=investment.net_value,
        share=_share(investment.gross_value, total),
        unrealized_result=result,
        unrealized_return=(
            result / investment.invested if investment.invested else None
        ),
        day_change=investment.day_change,
        day_return=_day_return(investment.day_change, investment.gross_value),
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

    # O "hoje" da renda variável é o pregão mais recente entre os ativos em carteira
    session_date = max(
        (
            item.price.price_date
            for item in valued
            if item.price and item.price.price_date
        ),
        default=None,
    )
    previous_date = max(
        (
            item.price.previous_date
            for item in valued
            if item.price
            and item.price.price_date == session_date
            and item.price.previous_date
        ),
        default=None,
    )

    by_category: defaultdict[PortfolioCategory, _Totals] = defaultdict(_Totals)
    for item in valued:
        by_category[PortfolioCategory(item.asset.asset_class)].add(
            item.market_value, item.position.total_cost, item.day_change(session_date)
        )
    for investment in investments:
        by_category[PortfolioCategory.FIXED_INCOME].add(
            investment.gross_value, investment.invested, investment.day_change
        )
    total = sum((totals.value for totals in by_category.values()), ZERO)
    changed = [
        totals for totals in by_category.values() if totals.day_change is not None
    ]
    day_change = (
        sum((totals.day_change or ZERO for totals in changed), ZERO)
        if changed
        else None
    )
    sectors, segments = _by_classification(valued)

    return Portfolio(
        total=total,
        day_change=day_change,
        day_return=(
            None
            if day_change is None
            else _day_return(
                day_change, sum((totals.day_value for totals in changed), ZERO)
            )
        ),
        price_date=session_date,
        previous_price_date=previous_date,
        categories=[
            by_category[category].allocation(category, total)
            for category in PortfolioCategory
            if by_category[category].value > 0
        ],
        positions=[_asset_position(item, total, session_date) for item in valued],
        fixed_income=[
            _fixed_income_holding(investment, total) for investment in investments
        ],
        sectors=sectors,
        segments=segments,
    )
