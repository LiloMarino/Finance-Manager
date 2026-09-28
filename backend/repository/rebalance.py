"""Os itens da meta de rebalanceamento de cada subcarteira, e os limites que furaram.

A Carteira dá o valor de cada item; a meta, os limites e a filiação vêm das
tabelas da subcarteira."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import LiquidityTier, PortfolioCategory
from backend.core.models.models import Asset, AssetTarget, Subportfolio
from backend.domain.rebalance import imbalance
from backend.repository.market import latest_prices
from backend.repository.portfolio import Portfolio, portfolio

ZERO = Decimal(0)
ONE = Decimal(1)
FIXED_INCOME_LABEL = "Renda fixa"


@dataclass(frozen=True, slots=True, kw_only=True)
class TargetLine:
    """Um item da subcarteira: o valor de hoje, a meta em fração, o piso do que só
    vira dinheiro no vencimento e o preço da cota, nulo na renda fixa."""

    asset_id: int | None
    label: str
    category: PortfolioCategory
    value: Decimal
    target: Decimal
    locked: Decimal
    price: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class TargetScope:
    found: Subportfolio
    total: Decimal
    lines: list[TargetLine]

    @property
    def targets_total(self) -> Decimal:
        return sum((line.target for line in self.lines), ZERO)

    @property
    def complete(self) -> bool:
        """Só a meta que soma 100% é avaliada: a subcarteira sem meta não fura."""
        return self.targets_total == ONE

    def share(self, line: TargetLine) -> Decimal:
        return line.value / self.total if self.total else ZERO

    def deviation(self, line: TargetLine) -> Decimal:
        return self.share(line) - line.target

    @property
    def imbalance(self) -> Decimal:
        return imbalance(self.deviation(line) for line in self.lines)

    def line_breached(self, line: TargetLine) -> bool:
        return (
            self.complete and abs(self.deviation(line)) > self.found.max_item_deviation
        )

    @property
    def breached(self) -> bool:
        return self.complete and (
            self.imbalance > self.found.max_total_deviation
            or any(self.line_breached(line) for line in self.lines)
        )


def member_assets(session: Session, subportfolio_id: int) -> list[Asset]:
    return list(
        session.scalars(
            select(Asset)
            .where(Asset.subportfolio_id == subportfolio_id)
            .order_by(Asset.ticker)
        )
    )


def asset_targets(session: Session, subportfolio_id: int) -> dict[int, Decimal]:
    """As metas dos membros de hoje; a de um ativo que saiu fica sem efeito."""
    return {
        asset_id: share
        for asset_id, share in session.execute(
            select(AssetTarget.asset_id, AssetTarget.share)
            .join(Asset, Asset.id == AssetTarget.asset_id)
            .where(
                AssetTarget.subportfolio_id == subportfolio_id,
                Asset.subportfolio_id == subportfolio_id,
            )
        ).tuples()
    }


def _locked(view: Portfolio) -> Decimal:
    return sum(
        (item.value for item in view.liquidity if item.tier is LiquidityTier.LOCKED),
        ZERO,
    )


def target_scope(session: Session, today: date, found: Subportfolio) -> TargetScope:
    """Os itens da meta: cada ativo membro com posição ou com meta, e a renda fixa
    inteira como um item só, se tiver título ou meta."""
    view = portfolio(session, today, found.id)
    targets = asset_targets(session, found.id)
    positions = {position.asset_id: position for position in view.positions}
    prices = {price.asset_id: price.close for price in latest_prices(session)}
    lines: list[TargetLine] = []
    for asset in member_assets(session, found.id):
        position = positions.get(asset.id)
        if position is None and asset.id not in targets:
            continue
        lines.append(
            TargetLine(
                asset_id=asset.id,
                label=asset.ticker,
                category=PortfolioCategory(asset.asset_class),
                value=position.market_value if position else ZERO,
                target=targets.get(asset.id, ZERO),
                locked=ZERO,
                price=position.price if position else prices.get(asset.id),
            )
        )
    fixed_income = sum((holding.gross_value for holding in view.fixed_income), ZERO)
    if fixed_income or found.fixed_income_target:
        lines.append(
            TargetLine(
                asset_id=None,
                label=FIXED_INCOME_LABEL,
                category=PortfolioCategory.FIXED_INCOME,
                value=fixed_income,
                target=found.fixed_income_target,
                locked=_locked(view),
                price=None,
            )
        )
    return TargetScope(found=found, total=view.total, lines=lines)


def target_scopes(session: Session, today: date) -> list[TargetScope]:
    return [
        target_scope(session, today, found)
        for found in session.scalars(select(Subportfolio).order_by(Subportfolio.name))
    ]


@dataclass(frozen=True, slots=True, kw_only=True)
class Breach:
    """Uma subcarteira fora do limite: os itens que passaram do desvio máximo e o
    desbalanceamento, os dois em fração."""

    subportfolio_id: int
    name: str
    items: list[tuple[str, Decimal]]
    imbalance: Decimal
    max_item_deviation: Decimal
    max_total_deviation: Decimal


def breaches(session: Session, today: date) -> list[Breach]:
    return [
        Breach(
            subportfolio_id=scope.found.id,
            name=scope.found.name,
            items=[
                (line.label, scope.deviation(line))
                for line in scope.lines
                if scope.line_breached(line)
            ],
            imbalance=scope.imbalance,
            max_item_deviation=scope.found.max_item_deviation,
            max_total_deviation=scope.found.max_total_deviation,
        )
        for scope in target_scopes(session, today)
        if scope.breached
    ]
