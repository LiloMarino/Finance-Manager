from __future__ import annotations

import logging
import sqlite3
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


def vacuum_into(source: Path, target: Path) -> None:
    """Cópia consistente do banco, mesmo aberto.

    Roda numa conexão própria, em autocommit: o VACUUM faz commit implícito, e a
    transação do Alembic segue intacta até registrar a `alembic_version`.
    """
    target.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(source, isolation_level=None)
    try:
        connection.execute("VACUUM INTO ?", (str(target),))
    finally:
        connection.close()


def snapshot(db_path: Path, backup_dir: Path, keep: int) -> Path | None:
    """Snapshot com timestamp em `backup_dir`, mantendo só os `keep` mais recentes."""
    if not db_path.exists():
        return None

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    target = backup_dir / f"{db_path.stem}-{stamp}.db"
    vacuum_into(db_path, target)
    logger.info("Snapshot do banco em %s", target)

    # O timestamp no nome ordena os snapshots cronologicamente
    snapshots = sorted(backup_dir.glob(f"{db_path.stem}-*.db"))
    for old in snapshots[:-keep]:
        old.unlink()

    return target
