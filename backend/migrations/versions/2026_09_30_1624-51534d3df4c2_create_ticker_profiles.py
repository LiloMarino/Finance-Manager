"""Create ticker profiles

Revision ID: 51534d3df4c2
Revises: e4c650987688
Create Date: 2026-09-30 16:24:46.059630
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "51534d3df4c2"
down_revision: str | Sequence[str] | None = "e4c650987688"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ticker_profiles",
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("sector", sa.String(), nullable=True),
        sa.Column("industry", sa.String(), nullable=True),
        sa.Column("fetched_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("ticker", name=op.f("pk_ticker_profiles")),
    )


def downgrade() -> None:
    op.drop_table("ticker_profiles")
