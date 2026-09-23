"""create darf payments table

Revision ID: fe2539efce27
Revises: b45466cb3f6f
Create Date: 2026-09-23 16:06:01.960042
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "fe2539efce27"
down_revision: str | Sequence[str] | None = "b45466cb3f6f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "darf_payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("paid_on", sa.Date(), nullable=False),
        sa.Column("amount", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(amount AS REAL) > 0", name=op.f("ck_darf_payments_amount_positive")
        ),
        sa.CheckConstraint(
            "month BETWEEN 1 AND 12", name=op.f("ck_darf_payments_month_valid")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_darf_payments")),
        sa.UniqueConstraint("year", "month", name=op.f("uq_darf_payments_year_month")),
    )


def downgrade() -> None:
    op.drop_table("darf_payments")
