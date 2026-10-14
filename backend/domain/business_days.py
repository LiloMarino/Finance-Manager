from __future__ import annotations

from collections.abc import Sequence
from datetime import date, timedelta
from functools import cache

from backend.domain.index_series import DailyRate

ONE_DAY = timedelta(days=1)

# Feriados nacionais de data fixa, como (mês, dia)
FIXED_HOLIDAYS = (
    (1, 1),
    (4, 21),
    (5, 1),
    (9, 7),
    (10, 12),
    (11, 2),
    (11, 15),
    (12, 25),
)
# A Consciência Negra é feriado nacional desde 2024
BLACK_CONSCIOUSNESS_SINCE = 2024


def easter(year: int) -> date:
    """O domingo de Páscoa do calendário gregoriano, pelo algoritmo de Meeus."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    weekday = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * weekday) // 451
    month, day = divmod(h + weekday - 7 * m + 114, 31)
    return date(year, month, day + 1)


@cache
def national_holidays(year: int) -> frozenset[date]:
    """Os feriados nacionais do ano: os de data fixa e os que andam com a Páscoa
    (Carnaval, Sexta-feira Santa e Corpus Christi)."""
    sunday = easter(year)
    holidays = {date(year, month, day) for month, day in FIXED_HOLIDAYS}
    if year >= BLACK_CONSCIOUSNESS_SINCE:
        holidays.add(date(year, 11, 20))
    holidays.update(sunday + timedelta(days=offset) for offset in (-48, -47, -2, 60))
    return frozenset(holidays)


class BusinessCalendar:
    """Dia útil é dia com CDI publicado. Fora do trecho coberto pela série, vale
    dia de semana que não é feriado nacional."""

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
        return day.weekday() < 5 and day not in national_holidays(day.year)

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
