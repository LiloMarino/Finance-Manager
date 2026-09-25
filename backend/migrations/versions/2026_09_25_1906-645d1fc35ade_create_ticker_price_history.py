"""Create ticker price history

Revision ID: 645d1fc35ade
Revises: a34e089a610c
Create Date: 2026-09-25 19:06:06.693074
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "645d1fc35ade"
down_revision: str | Sequence[str] | None = "a34e089a610c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ONE_OF_THREE = (
    "(asset_id IS NOT NULL) + (series IS NOT NULL) + (ticker IS NOT NULL) = 1"
)
ONE_OF_TWO = "(asset_id IS NULL) <> (series IS NULL)"


def upgrade() -> None:
    op.create_table(
        "ticker_price_history",
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("price_date", sa.Date(), nullable=False),
        sa.Column("close", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(close AS REAL) > 0",
            name=op.f("ck_ticker_price_history_close_positive"),
        ),
        sa.PrimaryKeyConstraint(
            "ticker", "price_date", name=op.f("pk_ticker_price_history")
        ),
    )
    # A CHECK fica fora do autogenerate; o batch recria a tabela com a nova
    with op.batch_alter_table("fetch_log", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("ticker", sa.String(), nullable=True))
        batch_op.create_unique_constraint(batch_op.f("uq_fetch_log_ticker"), ["ticker"])
        batch_op.drop_constraint(op.f("ck_fetch_log_one_target"), type_="check")
        batch_op.create_check_constraint("one_target", ONE_OF_THREE)


def downgrade() -> None:
    # O registro de ticker é cache: sai do banco antes de a CHECK antiga voltar
    op.execute("DELETE FROM fetch_log WHERE ticker IS NOT NULL")
    with op.batch_alter_table("fetch_log", recreate="always") as batch_op:
        batch_op.drop_constraint(op.f("ck_fetch_log_one_target"), type_="check")
        batch_op.create_check_constraint("one_target", ONE_OF_TWO)
        batch_op.drop_constraint(batch_op.f("uq_fetch_log_ticker"), type_="unique")
        batch_op.drop_column("ticker")

    op.drop_table("ticker_price_history")
