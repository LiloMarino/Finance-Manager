"""O schema que as migrations produzem é o que os models
declaram, inclusive cada CHECK."""

from __future__ import annotations

import sqlite3
from pathlib import Path

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.runtime.migration import MigrationContext
from sqlalchemy import CheckConstraint, Engine

from backend.core.database.migrate import (
    alembic_config,
    current_revision,
    head_revision,
)
from backend.core.models.models import Base


def test_schema_matches_models(engine: Engine) -> None:
    """Depois do upgrade até o head, o `compare_metadata` não acha diferença."""
    with engine.connect() as connection:
        context = MigrationContext.configure(connection, opts={"compare_type": True})
        diff = compare_metadata(context, Base.metadata)

    assert diff == []


def test_every_model_check_is_in_ddl(db_path: Path) -> None:
    """Todo CheckConstraint do metadata, explícito ou gerado por Enum, aparece
    pelo nome no DDL do `sqlite_master`."""
    connection = sqlite3.connect(db_path)
    try:
        ddl = dict(
            connection.execute(
                "SELECT name, sql FROM sqlite_master WHERE type = 'table'"
            ).fetchall()
        )
    finally:
        connection.close()

    expected = [
        (table.name, str(constraint.name))
        for table in Base.metadata.sorted_tables
        for constraint in table.constraints
        if isinstance(constraint, CheckConstraint)
    ]
    # Dois CHECK explícitos na Operation e um por coluna de Enum
    assert len(expected) >= 4
    for table, name in expected:
        assert f"CONSTRAINT {name} CHECK" in ddl[table], f"{table}.{name}"


def test_migrate_records_head_revision(db_path: Path) -> None:
    """O `migrate` deixa a `alembic_version` apontando para o head."""
    assert current_revision(db_path) == head_revision()


def test_downgrade_then_upgrade_again(db_path: Path) -> None:
    """Toda migration desce até a base e sobe de volta até o head."""
    config = alembic_config(db_path)

    command.downgrade(config, "base")
    assert current_revision(db_path) is None

    command.upgrade(config, "head")
    assert current_revision(db_path) == head_revision()


def test_existing_investment_gets_product_type_from_exemption(tmp_path: Path) -> None:
    """O título que já existia ganha o tipo pela isenção: o tributado vira RDB e o
    isento, LCI."""
    db_path = tmp_path / "finance.db"
    config = alembic_config(db_path)
    command.upgrade(config, "4aaa68dd93e9")
    connection = sqlite3.connect(db_path)
    with connection:
        connection.executemany(
            "INSERT INTO fixed_income_investments"
            " (label, indexer, rate, daily_liquidity, tax_exempt)"
            " VALUES (?, 'cdi', '100', 1, ?)",
            [("Caixinha", 0), ("LCI ABC", 1)],
        )
    connection.close()

    command.upgrade(config, "head")

    connection = sqlite3.connect(db_path)
    try:
        rows = connection.execute(
            "SELECT label, product_type FROM fixed_income_investments ORDER BY label"
        ).fetchall()
    finally:
        connection.close()
    assert rows == [("Caixinha", "rdb"), ("LCI ABC", "lci")]
