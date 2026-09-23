from __future__ import annotations

import sqlite3
from pathlib import Path

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.pool import ConnectionPoolEntry


def sqlite_url(path: Path) -> str:
    return f"sqlite:///{path.as_posix()}"


def _enable_foreign_keys(
    dbapi_connection: sqlite3.Connection, _: ConnectionPoolEntry
) -> None:
    dbapi_connection.execute("PRAGMA foreign_keys=ON")


def create_engine_for(path: Path) -> Engine:
    """Engine da aplicação: toda conexão sai com FK ligada, que o SQLite nasce sem."""
    path.parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(sqlite_url(path))
    event.listen(engine, "connect", _enable_foreign_keys)
    return engine
