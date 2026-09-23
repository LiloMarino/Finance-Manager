from __future__ import annotations

from typing import Literal

from alembic import context
from alembic.autogenerate.api import AutogenContext
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

from backend.config import settings
from backend.core.database.engine import sqlite_url
from backend.core.models.models import Base, DecimalText

# A URL vem do `migrate.py`; pela CLI (sem alembic.ini) vale a do config.toml
config = context.config
url = config.get_section(config.config_ini_section, {}).get(
    "sqlalchemy.url"
) or sqlite_url(settings.database.path)


def render_item(
    type_: str, obj: object, autogen_context: AutogenContext
) -> str | Literal[False]:
    """`DecimalText` sai na migration como o tipo base.

    A migration fica sem import do tipo customizado, e `alter_column(existing_type=)`
    recebe um tipo que ele sabe refletir.
    """
    if type_ == "type" and isinstance(obj, DecimalText):
        return "sa.String()"
    return False


def run_migrations() -> None:
    # Engine sem o listener de FK: o batch do SQLite recria a tabela com DROP +
    # RENAME, e é o `foreign_key_check` do dry run que confere as FKs no fim.
    engine = create_engine(url, poolclass=NullPool)
    try:
        with engine.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=Base.metadata,
                render_as_batch=True,
                compare_type=True,
                render_item=render_item,
            )
            with context.begin_transaction():
                context.run_migrations()
    finally:
        engine.dispose()


run_migrations()
