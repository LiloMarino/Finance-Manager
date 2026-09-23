from __future__ import annotations

import sqlite3
from pathlib import Path

from backend.core.database.backup import snapshot


def _count_rows(path: Path) -> int:
    connection = sqlite3.connect(path)
    try:
        (count,) = connection.execute("SELECT COUNT(*) FROM t").fetchone()
        return count
    finally:
        connection.close()


def _seed(path: Path) -> None:
    connection = sqlite3.connect(path)
    with connection:
        connection.execute("CREATE TABLE t (v TEXT)")
        connection.executemany("INSERT INTO t VALUES (?)", [("a",), ("b",)])
    connection.close()


def test_snapshot_copies_database(tmp_path: Path) -> None:
    """O snapshot é um banco SQLite válido com os mesmos dados."""
    db_path = tmp_path / "finance.db"
    _seed(db_path)

    target = snapshot(db_path, tmp_path / "backups", keep=3)

    assert target is not None
    assert _count_rows(target) == 2


def test_rotation_keeps_most_recent(tmp_path: Path) -> None:
    """Com `keep=2`, sobram só os dois snapshots mais recentes."""
    db_path = tmp_path / "finance.db"
    _seed(db_path)
    backup_dir = tmp_path / "backups"

    targets = [snapshot(db_path, backup_dir, keep=2) for _ in range(4)]

    assert sorted(backup_dir.iterdir()) == targets[-2:]


def test_missing_database_yields_no_snapshot(tmp_path: Path) -> None:
    """Sem banco, não há snapshot nem pasta de backup."""
    assert snapshot(tmp_path / "nada.db", tmp_path / "backups", keep=3) is None
    assert not (tmp_path / "backups").exists()
