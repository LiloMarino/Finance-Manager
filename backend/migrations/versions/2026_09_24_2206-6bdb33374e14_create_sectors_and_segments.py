"""create sectors and segments

Revision ID: 6bdb33374e14
Revises: 6e551f9edb62
Create Date: 2026-09-24 22:06:07.212760
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "6bdb33374e14"
down_revision: str | Sequence[str] | None = "6e551f9edb62"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "sectors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sectors")),
        sa.UniqueConstraint("name", name=op.f("uq_sectors_name")),
    )
    op.create_table(
        "segments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sector_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["sector_id"],
            ["sectors.id"],
            name=op.f("fk_segments_sector_id_sectors"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_segments")),
        sa.UniqueConstraint(
            "sector_id", "name", name=op.f("uq_segments_sector_id_name")
        ),
    )
    with op.batch_alter_table("segments", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_segments_sector_id"), ["sector_id"], unique=False
        )

    with op.batch_alter_table("assets", schema=None) as batch_op:
        batch_op.add_column(sa.Column("segment_id", sa.Integer(), nullable=True))
        batch_op.create_index(
            batch_op.f("ix_assets_segment_id"), ["segment_id"], unique=False
        )
        batch_op.create_foreign_key(
            batch_op.f("fk_assets_segment_id_segments"),
            "segments",
            ["segment_id"],
            ["id"],
            ondelete="RESTRICT",
        )
        batch_op.drop_column("sector")


def downgrade() -> None:
    with op.batch_alter_table("assets", schema=None) as batch_op:
        batch_op.add_column(sa.Column("sector", sa.VARCHAR(), nullable=True))
        batch_op.drop_constraint(
            batch_op.f("fk_assets_segment_id_segments"), type_="foreignkey"
        )
        batch_op.drop_index(batch_op.f("ix_assets_segment_id"))
        batch_op.drop_column("segment_id")

    with op.batch_alter_table("segments", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_segments_sector_id"))

    op.drop_table("segments")
    op.drop_table("sectors")
