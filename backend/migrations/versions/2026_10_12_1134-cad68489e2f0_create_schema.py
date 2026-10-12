"""Create schema

Revision ID: cad68489e2f0
Revises:
Create Date: 2026-10-12 11:34:06.674082
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "cad68489e2f0"
down_revision: str | Sequence[str] | None = None
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
    # A configuração nasce com o limite padrão de saldo parado
    op.execute("INSERT INTO cash_settings (id, alert_threshold) VALUES (1, '100')")
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
    op.create_table(
        "index_history",
        sa.Column(
            "series",
            sa.Enum(
                "cdi",
                "selic",
                "ipca",
                "ibov",
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
        "sectors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sectors")),
        sa.UniqueConstraint("name", name=op.f("uq_sectors_name")),
    )
    op.create_table(
        "subportfolios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column(
            "icon",
            sa.Enum(
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
                name="subportfolio_icon",
                native_enum=False,
                create_constraint=True,
            ),
            server_default="briefcase",
            nullable=False,
        ),
        sa.Column(
            "color",
            sa.Enum(
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
                name="subportfolio_color",
                native_enum=False,
                create_constraint=True,
            ),
            server_default="graphite",
            nullable=False,
        ),
        sa.Column(
            "fixed_income_target", sa.String(), server_default="0", nullable=False
        ),
        sa.Column(
            "max_item_deviation", sa.String(), server_default="0.05", nullable=False
        ),
        sa.Column(
            "max_total_deviation", sa.String(), server_default="0.07", nullable=False
        ),
        sa.CheckConstraint(
            "CAST(fixed_income_target AS REAL) BETWEEN 0 AND 1",
            name=op.f("ck_subportfolios_fixed_income_target_fraction"),
        ),
        sa.CheckConstraint(
            "CAST(max_item_deviation AS REAL) BETWEEN 0 AND 1",
            name=op.f("ck_subportfolios_max_item_deviation_fraction"),
        ),
        sa.CheckConstraint(
            "CAST(max_total_deviation AS REAL) BETWEEN 0 AND 1",
            name=op.f("ck_subportfolios_max_total_deviation_fraction"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_subportfolios")),
        sa.UniqueConstraint("name", name=op.f("uq_subportfolios_name")),
    )
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
    op.create_table(
        "ticker_profiles",
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("sector", sa.String(), nullable=True),
        sa.Column("industry", sa.String(), nullable=True),
        sa.Column("fetched_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("ticker", name=op.f("pk_ticker_profiles")),
    )
    op.create_table(
        "fixed_income_investments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column(
            "product_type",
            sa.Enum(
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
                name="product_type",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
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
        sa.Column("subportfolio_id", sa.Integer(), nullable=True),
        sa.CheckConstraint(
            "indexer = 'selic' OR CAST(rate AS REAL) > 0",
            name=op.f("ck_fixed_income_investments_rate_by_indexer"),
        ),
        sa.CheckConstraint(
            "product_type NOT IN ('treasury_selic', 'treasury_prefixed', 'treasury_ipca') OR (product_type = 'treasury_selic' AND indexer = 'selic') OR (product_type = 'treasury_prefixed' AND indexer = 'prefixed') OR (product_type = 'treasury_ipca' AND indexer = 'ipca')",
            name=op.f("ck_fixed_income_investments_treasury_indexer"),
        ),
        sa.ForeignKeyConstraint(
            ["subportfolio_id"],
            ["subportfolios.id"],
            name=op.f("fk_fixed_income_investments_subportfolio_id_subportfolios"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fixed_income_investments")),
        sa.UniqueConstraint("label", name=op.f("uq_fixed_income_investments_label")),
    )
    with op.batch_alter_table("fixed_income_investments", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_fixed_income_investments_subportfolio_id"),
            ["subportfolio_id"],
            unique=False,
        )

    op.create_table(
        "segments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sector_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["sector_id"],
            ["sectors.id"],
            name=op.f("fk_segments_sector_id_sectors"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_segments")),
        sa.UniqueConstraint(
            "sector_id", "name", name=op.f("uq_segments_sector_id_name")
        ),
    )
    with op.batch_alter_table("segments", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_segments_sector_id"), ["sector_id"], unique=False
        )

    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column(
            "asset_class",
            sa.Enum(
                "stock",
                "fii",
                "etf",
                "bdr",
                name="asset_class",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("cnpj", sa.String(length=18), nullable=True),
        sa.Column("segment_id", sa.Integer(), nullable=True),
        sa.Column("subportfolio_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["segment_id"],
            ["segments.id"],
            name=op.f("fk_assets_segment_id_segments"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["subportfolio_id"],
            ["subportfolios.id"],
            name=op.f("fk_assets_subportfolio_id_subportfolios"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_assets")),
        sa.UniqueConstraint("ticker", name=op.f("uq_assets_ticker")),
    )
    with op.batch_alter_table("assets", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_assets_segment_id"), ["segment_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_assets_subportfolio_id"), ["subportfolio_id"], unique=False
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

    op.create_table(
        "asset_targets",
        sa.Column("subportfolio_id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("share", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(share AS REAL) BETWEEN 0 AND 1",
            name=op.f("ck_asset_targets_share_fraction"),
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_asset_targets_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["subportfolio_id"],
            ["subportfolios.id"],
            name=op.f("fk_asset_targets_subportfolio_id_subportfolios"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "subportfolio_id", "asset_id", name=op.f("pk_asset_targets")
        ),
    )
    with op.batch_alter_table("asset_targets", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_asset_targets_asset_id"), ["asset_id"], unique=False
        )

    op.create_table(
        "asset_ticker_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("valid_until", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_asset_ticker_history_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_asset_ticker_history")),
        sa.UniqueConstraint("ticker", name=op.f("uq_asset_ticker_history_ticker")),
    )
    with op.batch_alter_table("asset_ticker_history", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_asset_ticker_history_asset_id"), ["asset_id"], unique=False
        )

    op.create_table(
        "fetch_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("attempted_at", sa.DateTime(), nullable=False),
        sa.Column("succeeded_at", sa.DateTime(), nullable=True),
        sa.Column("gap", sa.Boolean(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=True),
        sa.Column(
            "series",
            sa.Enum(
                "cdi",
                "selic",
                "ipca",
                "ibov",
                name="series",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=True,
        ),
        sa.Column("ticker", sa.String(), nullable=True),
        sa.CheckConstraint(
            "(asset_id IS NOT NULL) + (series IS NOT NULL) + (ticker IS NOT NULL) = 1",
            name=op.f("ck_fetch_log_one_target"),
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_fetch_log_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fetch_log")),
        sa.UniqueConstraint("asset_id", name=op.f("uq_fetch_log_asset_id")),
        sa.UniqueConstraint("series", name=op.f("uq_fetch_log_series")),
        sa.UniqueConstraint("ticker", name=op.f("uq_fetch_log_ticker")),
    )
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

    op.create_table(
        "operations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("operation_date", sa.Date(), nullable=False),
        sa.Column(
            "operation_type",
            sa.Enum(
                "buy",
                "sell",
                "bonus",
                "split",
                "reverse_split",
                name="operation_type",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("quantity", sa.String(), nullable=False),
        sa.Column("unit_price", sa.String(), nullable=False),
        sa.CheckConstraint(
            "(operation_type IN ('buy', 'sell') AND CAST(unit_price AS REAL) > 0) OR (operation_type IN ('bonus', 'split', 'reverse_split') AND CAST(unit_price AS REAL) = 0)",
            name=op.f("ck_operations_unit_price_by_type"),
        ),
        sa.CheckConstraint(
            "CAST(quantity AS REAL) > 0", name=op.f("ck_operations_quantity_positive")
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_operations_asset_id_assets"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_operations")),
    )
    with op.batch_alter_table("operations", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_operations_asset_id"), ["asset_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_operations_operation_date"), ["operation_date"], unique=False
        )

    op.create_table(
        "price_history",
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("price_date", sa.Date(), nullable=False),
        sa.Column("close", sa.String(), nullable=False),
        sa.CheckConstraint(
            "CAST(close AS REAL) > 0", name=op.f("ck_price_history_close_positive")
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
            name=op.f("fk_price_history_asset_id_assets"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "asset_id", "price_date", name=op.f("pk_price_history")
        ),
    )


def downgrade() -> None:
    op.drop_table("price_history")
    with op.batch_alter_table("operations", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_operations_operation_date"))
        batch_op.drop_index(batch_op.f("ix_operations_asset_id"))

    op.drop_table("operations")
    with op.batch_alter_table("income_events", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_income_events_payment_date"))
        batch_op.drop_index(batch_op.f("ix_income_events_asset_id"))

    op.drop_table("income_events")
    op.drop_table("fetch_log")
    with op.batch_alter_table("asset_ticker_history", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_asset_ticker_history_asset_id"))

    op.drop_table("asset_ticker_history")
    with op.batch_alter_table("asset_targets", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_asset_targets_asset_id"))

    op.drop_table("asset_targets")
    with op.batch_alter_table("fixed_income_movements", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_fixed_income_movements_investment_id"))

    op.drop_table("fixed_income_movements")
    with op.batch_alter_table("assets", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_assets_subportfolio_id"))
        batch_op.drop_index(batch_op.f("ix_assets_segment_id"))

    op.drop_table("assets")
    with op.batch_alter_table("segments", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_segments_sector_id"))

    op.drop_table("segments")
    with op.batch_alter_table("fixed_income_investments", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_fixed_income_investments_subportfolio_id"))

    op.drop_table("fixed_income_investments")
    op.drop_table("ticker_profiles")
    op.drop_table("ticker_price_history")
    op.drop_table("subportfolios")
    op.drop_table("sectors")
    op.drop_table("index_history")
    op.drop_table("darf_payments")
    op.drop_table("cash_withdrawals")
    op.drop_table("cash_settings")
    op.drop_table("cash_checks")
