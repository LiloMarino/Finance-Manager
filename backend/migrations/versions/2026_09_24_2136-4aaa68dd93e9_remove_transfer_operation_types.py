"""Remove transfer operation types

Revision ID: 4aaa68dd93e9
Revises: df5ed39b32a7
Create Date: 2026-09-24 21:36:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "4aaa68dd93e9"
down_revision: str | Sequence[str] | None = "df5ed39b32a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

EVENTS = "operation_type IN ('bonus', 'split', 'reverse_split')"
TRADES = "operation_type IN ('buy', 'sell')"
TRANSFERS = "operation_type IN ('transfer_in', 'transfer_out')"

TYPES = "operation_type IN ('buy', 'sell', 'bonus', 'split', 'reverse_split')"
TYPES_WITH_TRANSFER = (
    "operation_type IN ('buy', 'sell', 'bonus', 'split', 'reverse_split', "
    "'transfer_in', 'transfer_out')"
)
PRICE = (
    f"({TRADES} AND CAST(unit_price AS REAL) > 0)"
    f" OR ({EVENTS} AND CAST(unit_price AS REAL) = 0)"
)
PRICE_WITH_TRANSFER = f"{PRICE} OR ({TRANSFERS} AND CAST(unit_price AS REAL) >= 0)"


def _replace_checks(types: str, price: str) -> None:
    # A CHECK do Enum fica fora do autogenerate; o batch recria a tabela com as novas
    with op.batch_alter_table("operations", recreate="always") as batch_op:
        batch_op.drop_constraint(op.f("ck_operations_operation_type"), type_="check")
        batch_op.drop_constraint(
            op.f("ck_operations_unit_price_by_type"), type_="check"
        )
        batch_op.create_check_constraint("operation_type", types)
        batch_op.create_check_constraint("unit_price_by_type", price)


def upgrade() -> None:
    _replace_checks(TYPES, PRICE)


def downgrade() -> None:
    _replace_checks(TYPES_WITH_TRANSFER, PRICE_WITH_TRANSFER)
