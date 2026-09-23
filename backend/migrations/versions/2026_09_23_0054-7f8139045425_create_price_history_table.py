"""Create price_history table

Revision ID: 7f8139045425
Revises: 7ff5702ffd05
Create Date: 2026-09-23 00:54:30.030146
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "7f8139045425"
down_revision: str | Sequence[str] | None = "7ff5702ffd05"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "price_history",
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("price_date", sa.Date(), nullable=False),
        sa.Column("close", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(close AS REAL) > 0", name=op.f("ck_price_history_close_positive")
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_price_history_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "asset_id", "price_date", name=op.f("pk_price_history")
        ),
    )


def downgrade() -> None:
    op.drop_table("price_history")
