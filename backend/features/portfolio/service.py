from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass
from backend.core.models.models import Asset
from backend.domain.position import current_positions
from backend.repository.operations import operation_records


@dataclass(frozen=True, slots=True, kw_only=True)
class AssetPosition:
    asset_id: int
    ticker: str
    asset_class: AssetClass
    quantity: Decimal
    average_price: Decimal
    total_cost: Decimal


def open_positions(session: Session) -> list[AssetPosition]:
    """Ativos com posição hoje: quantidade, PM e custo, recalculados das operações."""
    positions = current_positions(operation_records(session))
    assets = session.scalars(select(Asset).order_by(Asset.ticker))
    return [
        AssetPosition(
            asset_id=asset.id,
            ticker=asset.ticker,
            asset_class=asset.asset_class,
            quantity=position.quantity,
            average_price=position.average_price,
            total_cost=position.total_cost,
        )
        for asset in assets
        if (position := positions.get(asset.ticker)) is not None
        and position.quantity != 0
    ]
