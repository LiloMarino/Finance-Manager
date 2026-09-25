from __future__ import annotations

from datetime import date
from decimal import Decimal

from backend.core.enum import IndexSeries
from backend.domain.benchmarks import benchmark_levels
from backend.domain.index_series import DailyRate


def _rates(values: dict[date, str]) -> list[DailyRate]:
    return [
        DailyRate(rate_date=day, value=Decimal(value))
        for day, value in sorted(values.items())
    ]


def test_cdi_level_compounds_the_daily_rate() -> None:
    """CDI de 0,05% ao dia em três dias úteis leva o nível a 1,0005³: a taxa de um
    dia rende até o fechamento do dia útil seguinte."""
    days = [date(2024, 3, 4), date(2024, 3, 5), date(2024, 3, 6), date(2024, 3, 7)]
    rates = {IndexSeries.CDI: _rates({day: "0.05" for day in days[:3]})}

    levels = benchmark_levels(IndexSeries.CDI, rates, days)

    rate = Decimal("1.0005")
    assert levels == [1, rate, rate**2, rate**3]


def test_ipca_level_spreads_the_month_over_calendar_days() -> None:
    """IPCA de 1% em março rende pró-rata por dia corrido e chega a 1,01 no
    primeiro dia de abril."""
    days = [date(2024, 3, 1), date(2024, 3, 15), date(2024, 4, 1)]
    rates = {IndexSeries.IPCA: _rates({date(2024, 3, 1): "1"})}

    levels = benchmark_levels(IndexSeries.IPCA, rates, days)

    assert levels is not None
    assert levels[0] == 1
    assert abs(levels[1] - Decimal("1.01") ** (Decimal(14) / Decimal(31))) < Decimal(
        "1e-20"
    )
    assert abs(levels[2] - Decimal("1.01")) < Decimal("1e-20")


def test_ibov_level_repeats_the_last_close() -> None:
    """O IBOV é o fechamento sobre o do primeiro dia, e o dia sem pregão repete o
    último fechamento."""
    days = [date(2024, 3, 4), date(2024, 3, 5), date(2024, 3, 6)]
    rates = {
        IndexSeries.IBOV: _rates(
            {date(2024, 3, 4): "120000", date(2024, 3, 5): "126000"}
        )
    }

    assert benchmark_levels(IndexSeries.IBOV, rates, days) == [
        1,
        Decimal("1.05"),
        Decimal("1.05"),
    ]


def test_series_without_value_until_first_day_has_no_level() -> None:
    """Sem valor publicado até o primeiro dia, a referência fica sem nível, em vez
    de começar no meio do período."""
    days = [date(2024, 3, 4), date(2024, 3, 5)]
    late = {IndexSeries.IBOV: _rates({date(2024, 3, 5): "120000"})}

    assert benchmark_levels(IndexSeries.IBOV, {}, days) is None
    assert benchmark_levels(IndexSeries.IBOV, late, days) is None
    assert benchmark_levels(IndexSeries.CDI, {}, days) is None
