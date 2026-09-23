"""Remove cash asset class

Revision ID: 7ff5702ffd05
Revises: db2fb10a016b
Create Date: 2026-09-23 00:51:55.517383
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "7ff5702ffd05"
down_revision: str | Sequence[str] | None = "db2fb10a016b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

WITHOUT_CASH = "asset_class IN ('stock', 'fii', 'etf', 'bdr', 'fixed_income')"
WITH_CASH = "asset_class IN ('stock', 'fii', 'etf', 'bdr', 'fixed_income', 'cash')"


def _replace_asset_class_check(sqltext: str) -> None:
    # A CHECK do Enum fica fora do autogenerate; o batch recria a tabela com a nova
    with op.batch_alter_table("assets", recreate="always") as batch_op:
        batch_op.drop_constraint(op.f("ck_assets_asset_class"), type_="check")
        batch_op.create_check_constraint("asset_class", sqltext)


def upgrade() -> None:
    _replace_asset_class_check(WITHOUT_CASH)


def downgrade() -> None:
    _replace_asset_class_check(WITH_CASH)
