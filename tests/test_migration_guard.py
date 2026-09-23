"""Migration só chega ao banco real se preservar todo o dado."""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from backend.core.database.migrate import (
    MigrationError,
    TableFingerprint,
    assert_no_data_loss,
    dry_run,
    fingerprint,
)

BEFORE = {"operations": TableFingerprint(rows=10, filled_cells=60)}


def test_missing_table_is_rejected() -> None:
    """Tabela que existia antes e some depois recusa a migration."""
    with pytest.raises(MigrationError, match="operations sumiu"):
        assert_no_data_loss(BEFORE, {})


def test_lost_row_is_rejected() -> None:
    """Tabela com menos linhas depois recusa a migration."""
    after = {"operations": TableFingerprint(rows=9, filled_cells=54)}

    with pytest.raises(MigrationError, match="linhas"):
        assert_no_data_loss(BEFORE, after)


def test_column_recreated_empty_is_rejected() -> None:
    """Mesmas linhas com menos células preenchidas (coluna removida ou recriada
    vazia) recusa a migration."""
    after = {"operations": TableFingerprint(rows=10, filled_cells=50)}

    with pytest.raises(MigrationError, match="células"):
        assert_no_data_loss(BEFORE, after)


def test_rename_preserving_cells_passes() -> None:
    """Rename de coluna mantém o total de células e passa."""
    assert_no_data_loss(BEFORE, dict(BEFORE))


def test_new_table_passes() -> None:
    """Tabela nova, ainda vazia, passa."""
    after = {**BEFORE, "prices": TableFingerprint(rows=0, filled_cells=0)}

    assert_no_data_loss(BEFORE, after)


def _seed(path: Path) -> None:
    connection = sqlite3.connect(path)
    with connection:
        connection.execute(
            "CREATE TABLE prices (id INTEGER PRIMARY KEY, unit_price TEXT)"
        )
        connection.executemany(
            "INSERT INTO prices (unit_price) VALUES (?)", [("10.5",), ("4.215",)]
        )
    connection.close()


def _rename_as_drop_add(path: Path) -> None:
    connection = sqlite3.connect(path)
    with connection:
        connection.execute("ALTER TABLE prices DROP COLUMN unit_price")
        connection.execute("ALTER TABLE prices ADD COLUMN price_per_unit TEXT")
    connection.close()


def test_dry_run_rejects_and_keeps_real_db_intact(tmp_path: Path) -> None:
    """Um rename feito como DROP + ADD é recusado no dry run, e o banco real
    termina com as mesmas linhas e células."""
    db_path = tmp_path / "finance.db"
    _seed(db_path)
    before = fingerprint(db_path)

    with pytest.raises(MigrationError, match="prices"):
        dry_run(db_path, _rename_as_drop_add)

    assert fingerprint(db_path) == before
