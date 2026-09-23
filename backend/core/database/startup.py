from __future__ import annotations

from backend.config import Settings
from backend.core.database.backup import snapshot
from backend.core.database.migrate import migrate


def prepare_database(settings: Settings) -> None:
    """Snapshot e depois migration: o snapshot do start é o backup pré-migration."""
    snapshot(settings.database.path, settings.backup.dir, settings.backup.keep)
    migrate(settings.database.path)
