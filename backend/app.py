from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.core.errors import FinanceError
from backend.core.logger import setup_logging
from backend.features import register_routes


def _envelope(status_code: int, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


async def handle_finance_error(_: Request, exc: Exception) -> JSONResponse:
    status = exc.status if isinstance(exc, FinanceError) else 500
    return _envelope(status, str(exc))


async def handle_validation_error(_: Request, exc: Exception) -> JSONResponse:
    """Achata o 422 do Pydantic no envelope único: `detail` é sempre string, que é
    o que o `getApiErrorMessage` do front lê pra montar o toast."""
    if not isinstance(exc, RequestValidationError):
        return _envelope(500, str(exc))

    parts = [
        f"{'.'.join(str(item) for item in error['loc'][1:]) or 'corpo'}: {error['msg']}"
        for error in exc.errors()
    ]
    return _envelope(422, "; ".join(parts))


def create_app() -> FastAPI:
    setup_logging(settings.logging.level)

    app = FastAPI(title="Finance Manager", version="0.1.0")

    # O front do Vite roda em outra origem só em desenvolvimento; em produção ele
    # é servido pelo próprio backend a partir de backend/static.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:4173"],
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type"],
    )

    app.add_exception_handler(FinanceError, handle_finance_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)

    register_routes(app)
    return app
