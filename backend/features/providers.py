"""Os sistemas externos injetados nas rotas: os testes trocam cada um por um fake."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from backend.adapters.bcb_sgs_provider import BcbSgsProvider
from backend.adapters.windows_task_scheduler import WindowsTaskScheduler
from backend.adapters.yfinance_provider import YFinanceProvider
from backend.domain.index_series import IndexSeriesProvider
from backend.domain.market_data import MarketDataProvider
from backend.domain.task_schedule import TaskScheduler


def get_provider() -> MarketDataProvider:
    return YFinanceProvider()


def get_index_provider() -> IndexSeriesProvider:
    return BcbSgsProvider()


def get_scheduler() -> TaskScheduler:
    return WindowsTaskScheduler()


ProviderDep = Annotated[MarketDataProvider, Depends(get_provider)]
IndexProviderDep = Annotated[IndexSeriesProvider, Depends(get_index_provider)]
SchedulerDep = Annotated[TaskScheduler, Depends(get_scheduler)]
