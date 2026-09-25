"""Add IBOV index series

Revision ID: 8c4904fc06c4
Revises: 6bdb33374e14
Create Date: 2026-09-25 00:30:02.757713
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "8c4904fc06c4"
down_revision: str | Sequence[str] | None = "6bdb33374e14"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLES = ("index_history", "fetch_log")
SERIES = "series IN ('cdi', 'selic', 'ipca', 'ibov')"
SERIES_WITHOUT_IBOV = "series IN ('cdi', 'selic', 'ipca')"


def _replace_checks(series: str) -> None:
    # A CHECK do Enum fica fora do autogenerate; o batch recria a tabela com a nova
    for table in TABLES:
        with op.batch_alter_table(table, recreate="always") as batch_op:
            batch_op.drop_constraint(op.f(f"ck_{table}_series"), type_="check")
            batch_op.create_check_constraint("series", series)


def upgrade() -> None:
    _replace_checks(SERIES)


def downgrade() -> None:
    # O IBOV é cache: sai do banco antes de a CHECK antiga voltar
    for table in TABLES:
        op.execute(f"DELETE FROM {table} WHERE series = 'ibov'")
    _replace_checks(SERIES_WITHOUT_IBOV)
