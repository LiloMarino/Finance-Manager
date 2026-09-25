from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import AssetClass, IndexSeries
from backend.features.market.indexes import latest_indexes, refresh_indexes
from backend.features.market.service import refresh_prices
from backend.features.providers import IndexProviderDep, ProviderDep
from backend.repository.market import latest_prices

router = APIRouter(prefix="/api/market", tags=["market"])


class AssetPriceDTO(BaseDTO):
    asset_id: int
    ticker: str
    asset_class: AssetClass
    close: DecimalStr | None
    price_date: date | None


class LatestIndexDTO(BaseDTO):
    series: IndexSeries
    value: DecimalStr | None
    rate_date: date | None


class RefreshReportDTO(BaseDTO):
    updated: list[str]
    failed: list[str]


@router.get("/prices")
def list_prices(session: SessionDep) -> list[AssetPriceDTO]:
    return [AssetPriceDTO.model_validate(price) for price in latest_prices(session)]


@router.post("/prices/refresh")
def refresh(session: SessionDep, provider: ProviderDep) -> RefreshReportDTO:
    """Com o cache em dia, responde sem sair da máquina. Sem rede não é erro: o cache
    fica como estava, e o ticker vai para `failed` quando a falta é problema novo."""
    report = refresh_prices(session, provider, datetime.now())
    return RefreshReportDTO.model_validate(report)


@router.get("/indexes")
def list_indexes(session: SessionDep) -> list[LatestIndexDTO]:
    return [LatestIndexDTO.model_validate(index) for index in latest_indexes(session)]


@router.post("/indexes/refresh")
def refresh_index_series(
    session: SessionDep, provider: IndexProviderDep, market: ProviderDep
) -> RefreshReportDTO:
    """Com o cache em dia, responde sem sair da máquina. Sem rede não é erro: o cache
    fica como estava, e a série vai para `failed` quando a falta é problema novo."""
    report = refresh_indexes(session, provider, market, datetime.now())
    return RefreshReportDTO.model_validate(report)
