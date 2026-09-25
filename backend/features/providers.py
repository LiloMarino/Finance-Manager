"""As fontes externas injetadas nas rotas: os testes trocam cada uma por um fake."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from backend.adapters.bcb_sgs_provider import BcbSgsProvider
from backend.adapters.yfinance_provider import YFinanceProvider
from backend.domain.index_series import IndexSeriesProvider
from backend.domain.market_data import MarketDataProvider


def get_provider() -> MarketDataProvider:
    return YFinanceProvider()


def get_index_provider() -> IndexSeriesProvider:
    return BcbSgsProvider()


ProviderDep = Annotated[MarketDataProvider, Depends(get_provider)]
IndexProviderDep = Annotated[IndexSeriesProvider, Depends(get_index_provider)]
