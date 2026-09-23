from __future__ import annotations

from collections.abc import Iterator
from functools import cache
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from backend.config import settings
from backend.core.database.engine import create_engine_for


@cache
def get_engine() -> Engine:
    """A engine conecta só no primeiro request: o `create_app` continua sem tocar
    no banco."""
    return create_engine_for(settings.database.path)


def get_session() -> Iterator[Session]:
    with Session(get_engine()) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
