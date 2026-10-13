"""Os sistemas externos injetados nas rotas: os testes trocam cada um por um fake."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from backend.adapters.b3_history_archive import B3HistoryArchive
from backend.adapters.bcb_sgs_provider import BcbSgsProvider
from backend.adapters.windows_task_scheduler import WindowsTaskScheduler
from backend.adapters.yfinance_provider import (
    YFinanceProfileProvider,
    YFinanceProvider,
    YFinanceTickerSearch,
)
from backend.domain.classification import ProfileProvider
from backend.domain.index_series import IndexSeriesProvider
from backend.domain.market_data import HistoryArchive, MarketDataProvider
from backend.domain.task_schedule import TaskScheduler
from backend.domain.ticker_search import TickerSearchProvider


def get_provider() -> MarketDataProvider:
    return YFinanceProvider()


def get_archive() -> HistoryArchive:
    return B3HistoryArchive()


def get_index_provider() -> IndexSeriesProvider:
    return BcbSgsProvider()


def get_scheduler() -> TaskScheduler:
    return WindowsTaskScheduler()


def get_ticker_search() -> TickerSearchProvider:
    return YFinanceTickerSearch()


def get_profile_provider() -> ProfileProvider:
    return YFinanceProfileProvider()


ProviderDep = Annotated[MarketDataProvider, Depends(get_provider)]
ArchiveDep = Annotated[HistoryArchive, Depends(get_archive)]
IndexProviderDep = Annotated[IndexSeriesProvider, Depends(get_index_provider)]
SchedulerDep = Annotated[TaskScheduler, Depends(get_scheduler)]
TickerSearchDep = Annotated[TickerSearchProvider, Depends(get_ticker_search)]
ProfileProviderDep = Annotated[ProfileProvider, Depends(get_profile_provider)]
