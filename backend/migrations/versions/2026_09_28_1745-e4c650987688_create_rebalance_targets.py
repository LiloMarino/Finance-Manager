"""Create rebalance targets

Revision ID: e4c650987688
Revises: a31cea91ed82
Create Date: 2026-09-28 17:45:18.454887
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "e4c650987688"
down_revision: str | Sequence[str] | None = "a31cea91ed82"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

FRACTION_COLUMNS = ("fixed_income_target", "max_item_deviation", "max_total_deviation")


def upgrade() -> None:
    op.create_table(
        "asset_targets",
        sa.Column("subportfolio_id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("share", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(share AS REAL) BETWEEN 0 AND 1",
            name=op.f("ck_asset_targets_share_fraction"),
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_asset_targets_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["subportfolio_id"],
            ["subportfolios.id"],
            name=op.f("fk_asset_targets_subportfolio_id_subportfolios"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "subportfolio_id", "asset_id", name=op.f("pk_asset_targets")
        ),
    )
    with op.batch_alter_table("asset_targets", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_asset_targets_asset_id"), ["asset_id"], unique=False
        )

    with op.batch_alter_table("subportfolios", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "fixed_income_target", sa.String(), server_default="0", nullable=False
            )
        )
        batch_op.add_column(
            sa.Column(
                "max_item_deviation", sa.String(), server_default="0.05", nullable=False
            )
        )
        batch_op.add_column(
            sa.Column(
                "max_total_deviation",
                sa.String(),
                server_default="0.07",
                nullable=False,
            )
        )
        for column in FRACTION_COLUMNS:
            batch_op.create_check_constraint(
                f"{column}_fraction", f"CAST({column} AS REAL) BETWEEN 0 AND 1"
            )


def downgrade() -> None:
    with op.batch_alter_table("subportfolios", schema=None) as batch_op:
        for column in FRACTION_COLUMNS:
            batch_op.drop_constraint(
                op.f(f"ck_subportfolios_{column}_fraction"), "check"
            )
        batch_op.drop_column("max_total_deviation")
        batch_op.drop_column("max_item_deviation")
        batch_op.drop_column("fixed_income_target")

    with op.batch_alter_table("asset_targets", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_asset_targets_asset_id"))

    op.drop_table("asset_targets")
