from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import Engine, delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.core.enum import AssetClass, OperationType
from backend.core.models.models import Asset, Operation

# 1/7 no contexto padrão: dízima com 28 dígitos significativos, o mesmo tamanho de
# um preço médio calculado.
LONG_REPEATING_DECIMAL = Decimal(1) / Decimal(7)


def _asset(session: Session) -> Asset:
    asset = Asset(ticker="ABCD11", asset_class=AssetClass.ETF)
    session.add(asset)
    session.flush()
    return asset


def _operation(
    asset: Asset, operation_type: OperationType, quantity: str, unit_price: str
) -> Operation:
    return Operation(
        asset_id=asset.id,
        operation_date=date(2024, 2, 7),
        operation_type=operation_type,
        quantity=Decimal(quantity),
        unit_price=Decimal(unit_price),
    )


def test_decimal_round_trips_through_sqlite(engine: Engine) -> None:
    """Decimal volta do SQLite com todos os dígitos e com a escala original."""
    with Session(engine) as session:
        asset = _asset(session)
        session.add(
            _operation(asset, OperationType.BUY, "10.10", str(LONG_REPEATING_DECIMAL))
        )
        session.commit()

    with Session(engine) as session:
        stored = session.scalars(select(Operation)).one()

    assert str(stored.quantity) == "10.10"
    assert stored.unit_price == LONG_REPEATING_DECIMAL


@pytest.mark.parametrize(
    ("operation_type", "quantity", "unit_price"),
    [
        (OperationType.BUY, "0", "10"),
        (OperationType.SELL, "-1", "10"),
        (OperationType.BUY, "1", "0"),
        (OperationType.SPLIT, "1", "0.01"),
    ],
)
def test_check_rejects_invalid_operation(
    engine: Engine, operation_type: OperationType, quantity: str, unit_price: str
) -> None:
    """Os CHECK do banco barram quantidade não positiva e preço incoerente com o tipo."""
    with Session(engine) as session:
        asset = _asset(session)
        session.add(_operation(asset, operation_type, quantity, unit_price))

        with pytest.raises(IntegrityError, match="CHECK"):
            session.flush()


def test_corporate_event_quantity_rules_fit(engine: Engine) -> None:
    """Bonificação e grupamento (quantidade como fator) passam pelos CHECK."""
    with Session(engine) as session:
        asset = _asset(session)
        session.add_all(
            [
                _operation(asset, OperationType.BUY, "17", "10.66"),
                _operation(asset, OperationType.BONUS, "0.05", "0"),
                _operation(asset, OperationType.REVERSE_SPLIT, "0.1", "0"),
            ]
        )
        session.flush()


def test_asset_with_operations_cannot_be_deleted(engine: Engine) -> None:
    """A FK é RESTRICT: apagar um ativo com operações falha, e as operações ficam."""
    with Session(engine) as session:
        asset = _asset(session)
        session.add(_operation(asset, OperationType.BUY, "1", "10"))
        session.flush()

        with pytest.raises(IntegrityError, match="FOREIGN KEY"):
            session.execute(delete(Asset).where(Asset.id == asset.id))
