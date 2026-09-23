from __future__ import annotations

from collections.abc import Sequence
from datetime import date

from backend.domain.index_series import DailyRate


class BusinessCalendar:
    """Dia útil é dia com CDI publicado. Fora do trecho coberto pela série, vale
    dia de semana."""

    def __init__(self, cdi: Sequence[DailyRate]) -> None:
        self._days = {rate.rate_date for rate in cdi}
        self._first = cdi[0].rate_date if cdi else None
        self._last = cdi[-1].rate_date if cdi else None

    def is_business_day(self, day: date) -> bool:
        if (
            self._first is not None
            and self._last is not None
            and (self._first <= day <= self._last)
        ):
            return day in self._days
        return day.weekday() < 5
