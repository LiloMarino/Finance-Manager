from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from backend.core.enum import FixedIncomeType, Indexer, IndexSeries
from backend.domain.fixed_income import Application, FixedIncomeTerms
from backend.domain.index_series import DailyRate
from backend.domain.projection import Assumptions, current_rates, project

TOLERANCE = Decimal("1e-20")


def _daily(start: date, end: date, value: str) -> list[DailyRate]:
    days = (start + timedelta(days=offset) for offset in range((end - start).days))
    return [
        DailyRate(rate_date=day, value=Decimal(value))
        for day in days
        if day.weekday() < 5
    ]


def _monthly(first: date, count: int, value: str) -> list[DailyRate]:
    months: list[DailyRate] = []
    for offset in range(count):
        index = first.year * 12 + first.month - 1 + offset
        months.append(
            DailyRate(
                rate_date=date(index // 12, index % 12 + 1, 1), value=Decimal(value)
            )
        )
    return months


def test_current_rates_annualize_the_last_value() -> None:
    """O CDI e a Selic do último dia viram taxa ao ano por 252 dias úteis, e o IPCA
    é o acumulado dos últimos 12 meses, cada um com a data do último dado."""
    rates = {
        IndexSeries.CDI: _daily(date(2024, 1, 1), date(2024, 2, 1), "0.05"),
        IndexSeries.SELIC: _daily(date(2024, 1, 1), date(2024, 2, 1), "0.04"),
        IndexSeries.IPCA: _monthly(date(2023, 1, 1), 12, "0.5"),
    }

    current = current_rates(rates)

    assert current.cdi == (Decimal("1.0005") ** 252 - 1) * 100
    assert current.selic == (Decimal("1.0004") ** 252 - 1) * 100
    assert current.ipca is not None
    assert abs(current.ipca - (Decimal("1.005") ** 12 - 1) * 100) < TOLERANCE
    assert current.cdi_date == date(2024, 1, 31)
    assert current.ipca_date == date(2023, 12, 1)


def test_current_ipca_needs_twelve_months() -> None:
    """Com menos de 12 meses de IPCA no cache, não há acumulado de 12 meses."""
    rates = {IndexSeries.IPCA: _monthly(date(2023, 1, 1), 11, "0.5")}

    current = current_rates(rates)

    assert current.ipca is None
    assert current.cdi is None


def test_projection_starts_after_the_last_real_value() -> None:
    """A série real fica como está; depois dela, o CDI projetado entra em cada dia de
    semana, e o IPCA no dia 1 de cada mês."""
    real_cdi = _daily(date(2024, 1, 1), date(2024, 1, 10), "0.05")
    rates = {
        IndexSeries.CDI: real_cdi,
        IndexSeries.IPCA: _monthly(date(2023, 11, 1), 2, "0.5"),
    }
    assumptions = Assumptions(cdi=Decimal(10), selic=Decimal(10), ipca=Decimal(4))

    projected = project(rates, assumptions, date(2024, 1, 1), date(2024, 1, 20))

    cdi = projected[IndexSeries.CDI]
    assert cdi[: len(real_cdi)] == real_cdi
    future = cdi[len(real_cdi) :]
    assert [rate.rate_date for rate in future] == [
        day
        for day in (date(2024, 1, 10) + timedelta(days=offset) for offset in range(11))
        if day.weekday() < 5
    ]
    daily = (Decimal("1.1") ** (Decimal(1) / 252) - 1) * 100
    assert all(rate.value == daily for rate in future)
    assert [rate.rate_date for rate in projected[IndexSeries.IPCA]][-1] == date(
        2024, 1, 1
    )


def test_edited_projection_changes_only_the_future() -> None:
    """Mudar o CDI projetado não mexe no que o título rendeu até o último dado real,
    só no que ele rende depois."""
    rates = {IndexSeries.CDI: _daily(date(2024, 1, 1), date(2024, 3, 1), "0.05")}
    terms = FixedIncomeTerms(
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.CDI,
        rate=Decimal(100),
        maturity_date=None,
    )
    start, last_real, end = date(2024, 1, 2), date(2024, 3, 1), date(2024, 6, 3)
    values = [
        Application(
            terms,
            start,
            project(
                rates,
                Assumptions(cdi=Decimal(cdi), selic=Decimal(0), ipca=Decimal(0)),
                start,
                end,
            ),
            end,
        )
        for cdi in ("8", "14")
    ]

    assert values[0].factor(last_real) == values[1].factor(last_real)
    assert values[0].factor(end) < values[1].factor(end)
