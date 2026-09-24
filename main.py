from __future__ import annotations

import uvicorn

from backend.config import settings
from backend.core.database.startup import prepare_database
from backend.core.logger import setup_logging

if __name__ == "__main__":
    setup_logging(settings.logging.level)
    # O app sobe com o banco já no head
    prepare_database(settings)

    uvicorn.run(
        "backend.app:create_app",
        factory=True,
        host=settings.server.host,
        port=settings.server.port,
    )
