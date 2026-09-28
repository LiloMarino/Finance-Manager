"""Create subportfolios

Revision ID: 3f2c8a91d4e7
Revises: 645d1fc35ade
Create Date: 2026-09-28 12:00:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "3f2c8a91d4e7"
down_revision: str | Sequence[str] | None = "645d1fc35ade"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

MEMBER_TABLES = ("assets", "fixed_income_investments")


def upgrade() -> None:
    op.create_table(
        "subportfolios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_subportfolios")),
        sa.UniqueConstraint("name", name=op.f("uq_subportfolios_name")),
    )
    for table in MEMBER_TABLES:
        with op.batch_alter_table(table, schema=None) as batch_op:
            batch_op.add_column(
                sa.Column("subportfolio_id", sa.Integer(), nullable=True)
            )
            batch_op.create_index(
                batch_op.f(f"ix_{table}_subportfolio_id"),
                ["subportfolio_id"],
                unique=False,
            )
            batch_op.create_foreign_key(
                batch_op.f(f"fk_{table}_subportfolio_id_subportfolios"),
                "subportfolios",
                ["subportfolio_id"],
                ["id"],
                ondelete="SET NULL",
            )


def downgrade() -> None:
    for table in MEMBER_TABLES:
        with op.batch_alter_table(table, schema=None) as batch_op:
            batch_op.drop_constraint(
                batch_op.f(f"fk_{table}_subportfolio_id_subportfolios"),
                type_="foreignkey",
            )
            batch_op.drop_index(batch_op.f(f"ix_{table}_subportfolio_id"))
            batch_op.drop_column("subportfolio_id")

    op.drop_table("subportfolios")
