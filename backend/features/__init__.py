"""Mapa único da API: cada domínio expõe seu router e é registrado aqui."""

from __future__ import annotations

from fastapi import FastAPI

from backend.core.dto import ERROR_RESPONSES
from backend.features.assets.router import router as assets_router
from backend.features.data_health.router import router as data_health_router
from backend.features.fixed_income.router import router as fixed_income_router
from backend.features.health.router import router as health_router
from backend.features.market.router import router as market_router
from backend.features.operations.router import router as operations_router
from backend.features.portfolio.router import router as portfolio_router
from backend.features.sectors.router import router as sectors_router
from backend.features.tax.router import router as tax_router


def register_routes(app: FastAPI) -> None:
    app.include_router(health_router, responses=ERROR_RESPONSES)
    app.include_router(market_router, responses=ERROR_RESPONSES)
    app.include_router(operations_router, responses=ERROR_RESPONSES)
    app.include_router(assets_router, responses=ERROR_RESPONSES)
    app.include_router(sectors_router, responses=ERROR_RESPONSES)
    app.include_router(portfolio_router, responses=ERROR_RESPONSES)
    app.include_router(fixed_income_router, responses=ERROR_RESPONSES)
    app.include_router(tax_router, responses=ERROR_RESPONSES)
    app.include_router(data_health_router, responses=ERROR_RESPONSES)
