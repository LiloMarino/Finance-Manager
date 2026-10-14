from __future__ import annotations

from datetime import date
from decimal import Decimal

from backend.domain.business_days import BusinessCalendar, easter
from backend.domain.index_series import DailyRate


def test_easter_follows_gregorian_calendar() -> None:
    """A Páscoa cai nos domingos conhecidos de cada ano."""
    assert easter(2024) == date(2024, 3, 31)
    assert easter(2025) == date(2025, 4, 20)
    assert easter(2026) == date(2026, 4, 5)


def test_national_holidays_after_series_are_not_business_days() -> None:
    """Depois do último CDI publicado, feriado nacional que cai em dia de semana não
    é dia útil: os de data fixa e os que andam com a Páscoa."""
    calendar = BusinessCalendar(
        [DailyRate(rate_date=date(2026, 1, 2), value=Decimal("0.05"))]
    )

    for holiday in (
        date(2026, 2, 16),
        date(2026, 2, 17),
        date(2026, 4, 3),
        date(2026, 6, 4),
        date(2026, 10, 12),
        date(2026, 11, 20),
    ):
        assert not calendar.is_business_day(holiday), holiday
    assert calendar.is_business_day(date(2026, 10, 13))
    assert calendar.previous(date(2026, 10, 13)) == date(2026, 10, 9)


def test_published_series_decides_business_days_it_covers() -> None:
    """Dentro do trecho da série, dia útil é dia com CDI publicado, mesmo que o
    calendário de feriados diga outra coisa."""
    published = [date(2023, 11, 17), date(2023, 11, 20), date(2023, 11, 21)]
    calendar = BusinessCalendar(
        [DailyRate(rate_date=day, value=Decimal("0.05")) for day in published]
    )

    assert calendar.is_business_day(date(2023, 11, 20))
