"""create fixed income and index history tables

Revision ID: b45466cb3f6f
Revises: 7f8139045425
Create Date: 2026-09-23 15:05:23.353772
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b45466cb3f6f"
down_revision: str | Sequence[str] | None = "7f8139045425"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

WITHOUT_FIXED_INCOME = "asset_class IN ('stock', 'fii', 'etf', 'bdr')"
WITH_FIXED_INCOME = "asset_class IN ('stock', 'fii', 'etf', 'bdr', 'fixed_income')"


def _replace_asset_class_check(sqltext: str, *, length: int) -> None:
    # A CHECK do Enum fica fora do autogenerate; o batch recria a tabela com a nova,
    # e o VARCHAR acompanha o maior valor do enum
    with op.batch_alter_table("assets", recreate="always") as batch_op:
        batch_op.alter_column(
            "asset_class",
            existing_type=sa.VARCHAR(),
            type_=sa.VARCHAR(length=length),
            existing_nullable=False,
        )
        batch_op.drop_constraint(op.f("ck_assets_asset_class"), type_="check")
        batch_op.create_check_constraint("asset_class", sqltext)


def upgrade() -> None:
    op.create_table(
        "fixed_income_investments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column(
            "indexer",
            sa.Enum(
                "cdi",
                "selic",
                "ipca",
                "prefixed",
                name="indexer",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("rate", sa.String(), nullable=False),
        sa.Column("maturity_date", sa.Date(), nullable=True),
        sa.Column("daily_liquidity", sa.Boolean(), nullable=False),
        sa.Column("tax_exempt", sa.Boolean(), nullable=False),
        sa.CheckConstraint(
            "CAST(rate AS REAL) > 0",
            name=op.f("ck_fixed_income_investments_rate_positive"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fixed_income_investments")),
        sa.UniqueConstraint("label", name=op.f("uq_fixed_income_investments_label")),
    )
    op.create_table(
        "index_history",
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
            nullable=False,
        ),
        sa.Column("rate_date", sa.Date(), nullable=False),
        sa.Column("value", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("series", "rate_date", name=op.f("pk_index_history")),
    )
    op.create_table(
        "fixed_income_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("investment_id", sa.Integer(), nullable=False),
        sa.Column("movement_date", sa.Date(), nullable=False),
        sa.Column(
            "movement_type",
            sa.Enum(
                "application",
                "redemption",
                name="movement_type",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("amount", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(amount AS REAL) > 0",
            name=op.f("ck_fixed_income_movements_amount_positive"),
        ),
        sa.ForeignKeyConstraint(
            ["investment_id"],
            ["fixed_income_investments.id"],
            name=op.f(
                "fk_fixed_income_movements_investment_id_fixed_income_investments"
            ),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fixed_income_movements")),
    )
    with op.batch_alter_table("fixed_income_movements", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_fixed_income_movements_investment_id"),
            ["investment_id"],
            unique=False,
        )

    _replace_asset_class_check(WITHOUT_FIXED_INCOME, length=5)


def downgrade() -> None:
    _replace_asset_class_check(WITH_FIXED_INCOME, length=12)

    with op.batch_alter_table("fixed_income_movements", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_fixed_income_movements_investment_id"))

    op.drop_table("fixed_income_movements")
    op.drop_table("index_history")
    op.drop_table("fixed_income_investments")
