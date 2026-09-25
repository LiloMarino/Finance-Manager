from __future__ import annotations

from collections.abc import Sequence
from datetime import date, timedelta

from backend.domain.index_series import DailyRate

ONE_DAY = timedelta(days=1)


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

    def previous(self, day: date) -> date:
        """O último dia útil antes de `day`."""
        day -= ONE_DAY
        while not self.is_business_day(day):
            day -= ONE_DAY
        return day

    def on_or_before(self, day: date) -> date:
        return day if self.is_business_day(day) else self.previous(day)

    def on_or_after(self, day: date) -> date:
        while not self.is_business_day(day):
            day += ONE_DAY
        return day
