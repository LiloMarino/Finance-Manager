"""Create cash tables

Revision ID: a31cea91ed82
Revises: 3f2c8a91d4e7
Create Date: 2026-09-28 17:20:08.634575
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a31cea91ed82"
down_revision: str | Sequence[str] | None = "3f2c8a91d4e7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "cash_checks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("check_date", sa.Date(), nullable=False),
        sa.Column("balance", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(balance AS REAL) >= 0",
            name=op.f("ck_cash_checks_balance_non_negative"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cash_checks")),
        sa.UniqueConstraint("check_date", name=op.f("uq_cash_checks_check_date")),
    )
    op.create_table(
        "cash_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("alert_threshold", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(alert_threshold AS REAL) >= 0",
            name=op.f("ck_cash_settings_alert_threshold_non_negative"),
        ),
        sa.CheckConstraint("id = 1", name=op.f("ck_cash_settings_single_row")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cash_settings")),
    )
    op.create_table(
        "cash_withdrawals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("withdrawal_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(amount AS REAL) > 0", name=op.f("ck_cash_withdrawals_amount_positive")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cash_withdrawals")),
    )
    # A configuração nasce com o limite padrão de saldo parado
    op.execute("INSERT INTO cash_settings (id, alert_threshold) VALUES (1, '100')")


def downgrade() -> None:
    op.drop_table("cash_withdrawals")
    op.drop_table("cash_settings")
    op.drop_table("cash_checks")
