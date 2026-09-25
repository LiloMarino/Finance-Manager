"""add fixed income product type

Revision ID: 6e551f9edb62
Revises: 4aaa68dd93e9
Create Date: 2026-09-24 21:55:34.364822
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "6e551f9edb62"
down_revision: str | Sequence[str] | None = "4aaa68dd93e9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

PRODUCT_TYPES = (
    "cdb",
    "rdb",
    "lc",
    "lci",
    "lca",
    "cri",
    "cra",
    "debenture",
    "incentivized_debenture",
    "treasury_selic",
    "treasury_prefixed",
    "treasury_ipca",
)
TAX_EXEMPT = "('lci', 'lca', 'cri', 'cra', 'incentivized_debenture')"

RATE_POSITIVE = "CAST(rate AS REAL) > 0"
RATE_BY_INDEXER = "indexer = 'selic' OR CAST(rate AS REAL) > 0"
TREASURY_INDEXER = (
    "product_type NOT IN ('treasury_selic', 'treasury_prefixed', 'treasury_ipca')"
    " OR (product_type = 'treasury_selic' AND indexer = 'selic')"
    " OR (product_type = 'treasury_prefixed' AND indexer = 'prefixed')"
    " OR (product_type = 'treasury_ipca' AND indexer = 'ipca')"
)


def upgrade() -> None:
    with op.batch_alter_table("fixed_income_investments") as batch_op:
        batch_op.add_column(
            sa.Column(
                "product_type",
                sa.Enum(
                    *PRODUCT_TYPES,
                    name="product_type",
                    native_enum=False,
                    create_constraint=True,
                ),
                nullable=True,
            )
        )

    # O título isento vira LCI e o tributado, RDB: a isenção passa a sair do tipo
    op.execute(
        "UPDATE fixed_income_investments SET product_type = "
        "CASE WHEN tax_exempt THEN 'lci' ELSE 'rdb' END"
    )

    with op.batch_alter_table(
        "fixed_income_investments", recreate="always"
    ) as batch_op:
        batch_op.alter_column(
            "product_type", existing_type=sa.VARCHAR(length=22), nullable=False
        )
        batch_op.drop_column("tax_exempt")
        batch_op.drop_constraint(
            op.f("ck_fixed_income_investments_rate_positive"), type_="check"
        )
        batch_op.create_check_constraint("rate_by_indexer", RATE_BY_INDEXER)
        batch_op.create_check_constraint("treasury_indexer", TREASURY_INDEXER)


def downgrade() -> None:
    with op.batch_alter_table("fixed_income_investments") as batch_op:
        batch_op.add_column(sa.Column("tax_exempt", sa.Boolean(), nullable=True))

    op.execute(
        f"UPDATE fixed_income_investments SET tax_exempt = product_type IN {TAX_EXEMPT}"
    )

    with op.batch_alter_table(
        "fixed_income_investments", recreate="always"
    ) as batch_op:
        batch_op.alter_column("tax_exempt", existing_type=sa.Boolean(), nullable=False)
        batch_op.drop_constraint(
            op.f("ck_fixed_income_investments_treasury_indexer"), type_="check"
        )
        batch_op.drop_constraint(
            op.f("ck_fixed_income_investments_rate_by_indexer"), type_="check"
        )
        batch_op.drop_constraint(
            op.f("ck_fixed_income_investments_product_type"), type_="check"
        )
        batch_op.drop_column("product_type")
        batch_op.create_check_constraint("rate_positive", RATE_POSITIVE)
