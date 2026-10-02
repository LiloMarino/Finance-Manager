from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from backend.core.enum import PortfolioCategory
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, AssetTarget, FixedIncomeInvestment
from backend.domain.rebalance import Item, distribute, imbalance, to_order
from backend.features.brazilian import brazilian
from backend.features.rebalance.dto import (
    AssetTargetDTO,
    OrderDTO,
    PlanDTO,
    PlanInDTO,
    PlanLineDTO,
    RebalanceDTO,
    RebalanceLineDTO,
    TargetsDTO,
    TargetsInDTO,
)
from backend.repository.portfolio import portfolio
from backend.repository.rebalance import (
    FIXED_INCOME_LABEL,
    TargetScope,
    asset_targets,
    member_assets,
    target_scope,
    target_scopes,
)
from backend.repository.subportfolios import subportfolio

ZERO = Decimal(0)
HUNDRED = Decimal(100)


class InvalidTargetsError(FinanceError):
    status = 422


def _subportfolio_view(scope: TargetScope) -> RebalanceDTO:
    found = scope.found
    return RebalanceDTO(
        subportfolio_id=found.id,
        total=scope.total,
        targets_total=scope.targets_total,
        complete=scope.complete,
        imbalance=scope.imbalance,
        max_item_deviation=found.max_item_deviation,
        max_total_deviation=found.max_total_deviation,
        breached=scope.breached,
        lines=[
            RebalanceLineDTO(
                asset_id=line.asset_id,
                label=line.label,
                category=line.category,
                subportfolio_id=found.id,
                subportfolio=found.name,
                value=line.value,
                share=scope.share(line),
                target=line.target,
                deviation=scope.deviation(line),
                gap=line.target * scope.total - line.value,
                breached=scope.line_breached(line),
            )
            for line in scope.lines
        ],
    )


def _general_view(session: Session, today: date) -> RebalanceDTO:
    """A meta combinada: a de cada item é a da subcarteira pesada pela fração dela
    na carteira. O que está fora de subcarteira e o saldo vêm sem meta."""
    view = portfolio(session, today)
    total = view.total
    lines: list[RebalanceLineDTO] = []

    def share(value: Decimal) -> Decimal:
        return value / total if total else ZERO

    for scope in target_scopes(session, today):
        weight = share(scope.total)
        for line in scope.lines:
            target = line.target * weight if scope.complete else None
            lines.append(
                RebalanceLineDTO(
                    asset_id=line.asset_id,
                    label=line.label,
                    category=line.category,
                    subportfolio_id=scope.found.id,
                    subportfolio=scope.found.name,
                    value=line.value,
                    share=share(line.value),
                    target=target,
                    deviation=None if target is None else share(line.value) - target,
                    gap=None if target is None else target * total - line.value,
                    breached=scope.line_breached(line),
                )
            )

    outside = {
        asset.id
        for asset in session.scalars(
            select(Asset).where(Asset.subportfolio_id.is_(None))
        )
    }
    lines.extend(
        RebalanceLineDTO(
            asset_id=position.asset_id,
            label=position.ticker,
            category=PortfolioCategory(position.asset_class),
            subportfolio_id=None,
            subportfolio=None,
            value=position.market_value,
            share=share(position.market_value),
            target=None,
            deviation=None,
            gap=None,
            breached=False,
        )
        for position in view.positions
        if position.asset_id in outside
    )
    loose = set(
        session.scalars(
            select(FixedIncomeInvestment.id).where(
                FixedIncomeInvestment.subportfolio_id.is_(None)
            )
        )
    )
    loose_value = sum(
        (
            holding.gross_value
            for holding in view.fixed_income
            if holding.investment_id in loose
        ),
        ZERO,
    )
    extra = [
        (FIXED_INCOME_LABEL, PortfolioCategory.FIXED_INCOME, loose_value),
        ("Saldo a reinvestir", PortfolioCategory.CASH, view.cash or ZERO),
    ]
    lines.extend(
        RebalanceLineDTO(
            asset_id=None,
            label=label,
            category=category,
            subportfolio_id=None,
            subportfolio=None,
            value=value,
            share=share(value),
            target=None,
            deviation=None,
            gap=None,
            breached=False,
        )
        for label, category, value in extra
        if value
    )
    return RebalanceDTO(
        subportfolio_id=None,
        total=total,
        targets_total=None,
        complete=False,
        imbalance=None,
        max_item_deviation=None,
        max_total_deviation=None,
        breached=any(line.breached for line in lines),
        lines=lines,
    )


def rebalance(
    session: Session, today: date, subportfolio_id: int | None
) -> RebalanceDTO:
    if subportfolio_id is None:
        return _general_view(session, today)
    return _subportfolio_view(
        target_scope(session, today, subportfolio(session, subportfolio_id))
    )


def _percent(value: Decimal) -> Decimal:
    """A fração como o formulário a edita: 0.3 vira 30."""
    return (value * HUNDRED).normalize()


def get_targets(session: Session, subportfolio_id: int) -> TargetsDTO:
    found = subportfolio(session, subportfolio_id)
    targets = asset_targets(session, subportfolio_id)
    return TargetsDTO(
        assets=[
            AssetTargetDTO(
                asset_id=asset.id,
                ticker=asset.ticker,
                target=_percent(targets.get(asset.id, ZERO)),
            )
            for asset in member_assets(session, subportfolio_id)
        ],
        fixed_income_target=_percent(found.fixed_income_target),
        max_item_deviation=_percent(found.max_item_deviation),
        max_total_deviation=_percent(found.max_total_deviation),
    )


def set_targets(session: Session, subportfolio_id: int, payload: TargetsInDTO) -> None:
    """Substitui as metas da subcarteira inteira: o ativo que não veio fica sem."""
    found = subportfolio(session, subportfolio_id)
    member_ids = {asset.id for asset in member_assets(session, subportfolio_id)}
    if any(item.asset_id not in member_ids for item in payload.assets):
        raise InvalidTargetsError("A meta é só dos ativos da subcarteira.")
    total = payload.fixed_income_target + sum(
        (item.target for item in payload.assets), ZERO
    )
    if total != HUNDRED:
        raise InvalidTargetsError(
            f"As metas somam {brazilian(total, 2)}%; o total é 100%."
        )

    session.execute(
        delete(AssetTarget).where(AssetTarget.subportfolio_id == subportfolio_id)
    )
    session.add_all(
        AssetTarget(
            subportfolio_id=subportfolio_id,
            asset_id=item.asset_id,
            share=item.target / HUNDRED,
        )
        for item in payload.assets
        if item.target
    )
    found.fixed_income_target = payload.fixed_income_target / HUNDRED
    found.max_item_deviation = payload.max_item_deviation / HUNDRED
    found.max_total_deviation = payload.max_total_deviation / HUNDRED
    session.commit()


def plan(session: Session, today: date, payload: PlanInDTO) -> PlanDTO:
    """A divisão do aporte em cotas inteiras. Sem venda, cada item só recebe; com
    venda, desce até a parte que só vira dinheiro no vencimento."""
    scope = target_scope(session, today, subportfolio(session, payload.subportfolio_id))
    if not scope.complete:
        raise InvalidTargetsError(
            "As metas da subcarteira somam "
            f"{brazilian(scope.targets_total * HUNDRED, 2)}%; ajuste-as para 100% "
            "antes de dividir o aporte."
        )
    finals = distribute(
        [
            Item(
                value=line.value,
                target=line.target,
                floor=line.locked if payload.allow_sales else line.value,
            )
            for line in scope.lines
        ],
        payload.amount,
    )
    orders = [
        to_order(final - line.value, line.price if line.asset_id is not None else None)
        for line, final in zip(scope.lines, finals, strict=True)
    ]
    after = [
        line.value + order.amount
        for line, order in zip(scope.lines, orders, strict=True)
    ]
    after_total = sum(after, ZERO)

    def share(value: Decimal) -> Decimal:
        return value / after_total if after_total else ZERO

    leftover = payload.amount - sum((order.amount for order in orders), ZERO)
    return PlanDTO(
        orders=[
            OrderDTO(
                asset_id=line.asset_id,
                label=line.label,
                category=line.category,
                amount=order.amount,
                quantity=order.quantity,
                price=line.price,
                share_after=share(value),
            )
            for line, order, value in zip(scope.lines, orders, after, strict=True)
        ],
        lines=[
            PlanLineDTO(
                asset_id=line.asset_id,
                label=line.label,
                category=line.category,
                quantity_before=line.quantity,
                quantity_after=_quantity_after(line.quantity, order.quantity),
                value_before=line.value,
                value_after=value,
                share_before=scope.share(line),
                share_after=share(value),
                target=line.target,
                deviation_before=scope.deviation(line),
                deviation_after=share(value) - line.target,
            )
            for line, order, value in zip(scope.lines, orders, after, strict=True)
        ],
        total_before=scope.total,
        total_after=after_total,
        used=payload.amount - leftover,
        leftover=leftover,
        imbalance_before=scope.imbalance,
        imbalance_after=imbalance(
            share(value) - line.target
            for line, value in zip(scope.lines, after, strict=True)
        ),
        sells_equity=any(
            order.amount < 0 and line.asset_id is not None
            for line, order in zip(scope.lines, orders, strict=True)
        ),
    )


def _quantity_after(before: Decimal | None, moved: Decimal | None) -> Decimal | None:
    """As cotas depois da ordem, que vem com sinal: a compra soma e a venda tira. A
    renda fixa não tem cotas."""
    if before is None:
        return None
    return before if moved is None else before + moved
