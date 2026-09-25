"""Create fetch log

Revision ID: 7e7f94469960
Revises: fe2539efce27
Create Date: 2026-09-24 21:15:15.546731
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "7e7f94469960"
down_revision: str | Sequence[str] | None = "fe2539efce27"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "fetch_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("attempted_at", sa.DateTime(), nullable=False),
        sa.Column("succeeded_at", sa.DateTime(), nullable=True),
        sa.Column("gap", sa.Boolean(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=True),
        sa.Column(
            "series",
            sa.Enum(
                "cdi",
                "selic",
                "ipca",
                name="series",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=True,
        ),
        sa.CheckConstraint(
            "(asset_id IS NULL) <> (series IS NULL)",
            name=op.f("ck_fetch_log_one_target"),
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_fetch_log_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fetch_log")),
        sa.UniqueConstraint("asset_id", name=op.f("uq_fetch_log_asset_id")),
        sa.UniqueConstraint("series", name=op.f("uq_fetch_log_series")),
    )


def downgrade() -> None:
    op.drop_table("fetch_log")
