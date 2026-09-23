"""Create assets and operations tables

Revision ID: db2fb10a016b
Revises:
Create Date: 2026-09-22 21:03:29.899580
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "db2fb10a016b"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column(
            "asset_class",
            sa.Enum(
                "stock",
                "fii",
                "etf",
                "bdr",
                "fixed_income",
                "cash",
                name="asset_class",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("cnpj", sa.String(length=18), nullable=True),
        sa.Column("sector", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_assets")),
        sa.UniqueConstraint("ticker", name=op.f("uq_assets_ticker")),
    )
    op.create_table(
        "operations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("operation_date", sa.Date(), nullable=False),
        sa.Column(
            "operation_type",
            sa.Enum(
                "buy",
                "sell",
                "bonus",
                "split",
                "reverse_split",
                "transfer_in",
                "transfer_out",
                name="operation_type",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("quantity", sa.String(), nullable=False),
        sa.Column("unit_price", sa.String(), nullable=False),
        sa.CheckConstraint(
            "(operation_type IN ('buy', 'sell') AND CAST(unit_price AS REAL) > 0) OR (operation_type IN ('bonus', 'split', 'reverse_split') AND CAST(unit_price AS REAL) = 0) OR (operation_type IN ('transfer_in', 'transfer_out') AND CAST(unit_price AS REAL) >= 0)",
            name=op.f("ck_operations_unit_price_by_type"),
        ),
        sa.CheckConstraint(
            "CAST(quantity AS REAL) > 0", name=op.f("ck_operations_quantity_positive")
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_operations_asset_id_assets"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_operations")),
    )
    with op.batch_alter_table("operations", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_operations_asset_id"), ["asset_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_operations_operation_date"), ["operation_date"], unique=False
        )


def downgrade() -> None:
    with op.batch_alter_table("operations", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_operations_operation_date"))
        batch_op.drop_index(batch_op.f("ix_operations_asset_id"))

    op.drop_table("operations")
    op.drop_table("assets")
