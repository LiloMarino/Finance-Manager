"""create income events

Revision ID: a34e089a610c
Revises: 8c4904fc06c4
Create Date: 2026-09-25 15:57:13.390876
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a34e089a610c"
down_revision: str | Sequence[str] | None = "8c4904fc06c4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "income_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column(
            "income_type",
            sa.Enum(
                "dividend",
                "jcp",
                "distribution",
                name="income_type",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("quantity", sa.String(), nullable=False),
        sa.Column("unit_price", sa.String(), nullable=False),
        sa.Column("amount", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(amount AS REAL) > 0", name=op.f("ck_income_events_amount_positive")
        ),
        sa.CheckConstraint(
            "CAST(quantity AS REAL) > 0",
            name=op.f("ck_income_events_quantity_positive"),
        ),
        sa.CheckConstraint(
            "CAST(unit_price AS REAL) >= 0",
            name=op.f("ck_income_events_unit_price_not_negative"),
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_income_events_asset_id_assets"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_income_events")),
    )
    with op.batch_alter_table("income_events", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_income_events_asset_id"), ["asset_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_income_events_payment_date"), ["payment_date"], unique=False
        )


def downgrade() -> None:
    with op.batch_alter_table("income_events", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_income_events_payment_date"))
        batch_op.drop_index(batch_op.f("ix_income_events_asset_id"))

    op.drop_table("income_events")
