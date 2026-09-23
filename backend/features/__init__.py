"""Mapa único da API: cada domínio expõe seu router e é registrado aqui."""

from __future__ import annotations

from fastapi import FastAPI

from backend.core.dto import ERROR_RESPONSES
from backend.features.health.router import router as health_router
from backend.features.market.router import router as market_router


def register_routes(app: FastAPI) -> None:
    app.include_router(health_router, responses=ERROR_RESPONSES)
    app.include_router(market_router, responses=ERROR_RESPONSES)
