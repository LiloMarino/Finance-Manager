"""Create asset ticker history

Revision ID: df5ed39b32a7
Revises: 7e7f94469960
Create Date: 2026-09-24 21:27:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "df5ed39b32a7"
down_revision: str | Sequence[str] | None = "7e7f94469960"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "asset_ticker_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("valid_until", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_asset_ticker_history_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_asset_ticker_history")),
        sa.UniqueConstraint("ticker", name=op.f("uq_asset_ticker_history_ticker")),
    )
    with op.batch_alter_table("asset_ticker_history", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_asset_ticker_history_asset_id"), ["asset_id"], unique=False
        )


def downgrade() -> None:
    with op.batch_alter_table("asset_ticker_history", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_asset_ticker_history_asset_id"))

    op.drop_table("asset_ticker_history")
