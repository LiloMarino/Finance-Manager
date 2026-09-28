from __future__ import annotations

import logging
from pathlib import Path


def setup_logging(level: str, log_file: Path | None = None) -> None:
    """No console, a hora basta; o arquivo junta vários dias e leva a data."""
    if log_file is not None:
        log_file.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
        datefmt="%H:%M:%S" if log_file is None else "%Y-%m-%d %H:%M:%S",
        filename=log_file,
        encoding="utf-8",
    )
