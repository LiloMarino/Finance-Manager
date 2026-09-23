"""Migrations do banco, com três garantias:

1. schema igual aos models: `compare_metadata`, em `tests/test_migrations.py`;
2. CHECKs presentes no DDL: também em `tests/test_migrations.py`;
3. dado preservado: `dry_run` aqui, sobre uma cópia do banco real, antes de migrar.
"""

from __future__ import annotations

import logging
import sqlite3
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory

from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

from backend.core.database.backup import vacuum_into
from backend.core.database.engine import sqlite_url

logger = logging.getLogger(__name__)

PYPROJECT = Path(__file__).resolve().parents[3] / "pyproject.toml"


class MigrationError(Exception):
    """Migration recusada: o banco real fica como estava."""


@dataclass(frozen=True, slots=True, kw_only=True)
class TableFingerprint:
    rows: int
    filled_cells: int


type Fingerprint = dict[str, TableFingerprint]


def alembic_config(db_path: Path) -> Config:
    config = Config(toml_file=PYPROJECT)
    # O ConfigParser interpola `%`; dobrar é o escape
    config.set_main_option("sqlalchemy.url", sqlite_url(db_path).replace("%", "%%"))
    return config


def head_revision() -> str | None:
    script = ScriptDirectory.from_config(Config(toml_file=PYPROJECT))
    return script.get_current_head()


def current_revision(db_path: Path) -> str | None:
    engine = create_engine(sqlite_url(db_path), poolclass=NullPool)
    try:
        with engine.connect() as connection:
            return MigrationContext.configure(connection).get_current_revision()
    finally:
        engine.dispose()


def upgrade(db_path: Path) -> None:
    command.upgrade(alembic_config(db_path), "head")


def fingerprint(db_path: Path) -> Fingerprint:
    """Linhas e células preenchidas por tabela.

    Rename de coluna preserva o total de células; coluna removida ou recriada vazia
    o reduz.
    """
    connection = sqlite3.connect(db_path)
    try:
        tables: list[str] = [
            name
            for (name,) in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table' "
                "AND name NOT LIKE 'sqlite_%' AND name != 'alembic_version'"
            )
        ]
        result: Fingerprint = {}
        for table in tables:
            columns: list[str] = [
                row[1] for row in connection.execute(f'PRAGMA table_info("{table}")')
            ]
            filled = " + ".join(f'COUNT("{column}")' for column in columns)
            rows, filled_cells = connection.execute(
                f'SELECT COUNT(*), {filled} FROM "{table}"'
            ).fetchone()
            result[table] = TableFingerprint(rows=rows, filled_cells=filled_cells)
        return result
    finally:
        connection.close()


def assert_no_data_loss(before: Fingerprint, after: Fingerprint) -> None:
    problems: list[str] = []
    for table, old in before.items():
        new = after.get(table)
        if new is None:
            problems.append(f"a tabela {table} sumiu")
        elif new.rows < old.rows:
            problems.append(f"{table} caiu de {old.rows} para {new.rows} linhas")
        elif new.filled_cells < old.filled_cells:
            problems.append(
                f"{table} caiu de {old.filled_cells} para {new.filled_cells} "
                "células preenchidas (coluna removida ou recriada vazia)"
            )
    if problems:
        raise MigrationError("A migration perderia dado: " + "; ".join(problems))


def assert_foreign_keys(db_path: Path) -> None:
    connection = sqlite3.connect(db_path)
    try:
        violations = connection.execute("PRAGMA foreign_key_check").fetchall()
    finally:
        connection.close()
    if violations:
        raise MigrationError(
            f"A migration quebraria {len(violations)} chaves estrangeiras"
        )


def dry_run(db_path: Path, apply: Callable[[Path], None]) -> None:
    """Aplica `apply` numa cópia do banco e só retorna se nenhum dado se perdeu."""
    with TemporaryDirectory() as tmp:
        copy = Path(tmp) / db_path.name
        vacuum_into(db_path, copy)
        before = fingerprint(copy)
        apply(copy)
        assert_no_data_loss(before, fingerprint(copy))
        assert_foreign_keys(copy)


def migrate(db_path: Path) -> None:
    """Leva o banco ao head. Banco com dado só migra depois de passar no dry run."""
    head = head_revision()
    if db_path.exists():
        if current_revision(db_path) == head:
            return
        dry_run(db_path, upgrade)
    else:
        db_path.parent.mkdir(parents=True, exist_ok=True)

    upgrade(db_path)
    logger.info("Banco migrado até %s", head)
