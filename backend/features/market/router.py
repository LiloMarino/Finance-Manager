from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends

from backend.adapters.yfinance_provider import YFinanceProvider
from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import AssetClass
from backend.domain.market_data import MarketDataProvider
from backend.features.market.service import latest_prices, refresh_prices

router = APIRouter(prefix="/api/market", tags=["market"])


class AssetPriceDTO(BaseDTO):
    asset_id: int
    ticker: str
    asset_class: AssetClass
    close: DecimalStr | None
    price_date: date | None


class RefreshReportDTO(BaseDTO):
    updated: list[str]
    failed: list[str]


def get_provider() -> MarketDataProvider:
    return YFinanceProvider()


ProviderDep = Annotated[MarketDataProvider, Depends(get_provider)]


@router.get("/prices")
def list_prices(session: SessionDep) -> list[AssetPriceDTO]:
    return [AssetPriceDTO.model_validate(price) for price in latest_prices(session)]


@router.post("/prices/refresh")
def refresh(session: SessionDep, provider: ProviderDep) -> RefreshReportDTO:
    """Sem rede não é erro: o ticker vai para `failed` e o cache fica como estava."""
    report = refresh_prices(session, provider, date.today())
    return RefreshReportDTO.model_validate(report)
