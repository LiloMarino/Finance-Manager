"""Add subportfolio icon and color

Revision ID: c51c64b9915f
Revises: 51534d3df4c2
Create Date: 2026-10-01 21:16:24.895863
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c51c64b9915f"
down_revision: str | Sequence[str] | None = "51534d3df4c2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


ICONS = (
    "banknote",
    "sprout",
    "shield",
    "globe",
    "house",
    "graduation-cap",
    "plane",
    "heart",
    "car",
    "baby",
    "gift",
    "umbrella",
    "target",
    "rocket",
    "piggy-bank",
    "briefcase",
    "trending-up",
    "mountain",
    "star",
    "hourglass",
    "zap",
    "leaf",
    "anchor",
    "trophy",
)
COLORS = (
    "green",
    "purple",
    "slate-blue",
    "pink",
    "gold",
    "graphite",
    "teal",
    "wine",
    "terracotta",
    "olive",
    "indigo",
    "brown",
)


def upgrade() -> None:
    with op.batch_alter_table("subportfolios", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "icon",
                sa.Enum(
                    *ICONS,
                    name="subportfolio_icon",
                    native_enum=False,
                    create_constraint=True,
                ),
                server_default="briefcase",
                nullable=False,
            )
        )
        batch_op.add_column(
            sa.Column(
                "color",
                sa.Enum(
                    *COLORS,
                    name="subportfolio_color",
                    native_enum=False,
                    create_constraint=True,
                ),
                server_default="graphite",
                nullable=False,
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("subportfolios", schema=None) as batch_op:
        batch_op.drop_constraint(
            op.f("ck_subportfolios_subportfolio_color"), type_="check"
        )
        batch_op.drop_constraint(
            op.f("ck_subportfolios_subportfolio_icon"), type_="check"
        )
        batch_op.drop_column("color")
        batch_op.drop_column("icon")
