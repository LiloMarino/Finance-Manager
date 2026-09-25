from __future__ import annotations

from collections.abc import Iterable
from datetime import date, timedelta
from decimal import Decimal

from backend.core.enum import (
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    IndexSeries,
)
from backend.domain.fixed_income import FixedIncomeTerms, Movement, mark
from backend.domain.index_series import DailyRate

APPLICATION = FixedIncomeMovementType.APPLICATION
REDEMPTION = FixedIncomeMovementType.REDEMPTION
PLACES = Decimal("1e-12")


def _terms(
    indexer: Indexer = Indexer.PREFIXED,
    rate: str = "12",
    *,
    maturity_date: date | None = None,
    product_type: FixedIncomeType = FixedIncomeType.CDB,
) -> FixedIncomeTerms:
    return FixedIncomeTerms(
        product_type=product_type,
        indexer=indexer,
        rate=Decimal(rate),
        maturity_date=maturity_date,
    )


def _movement(
    day: date, amount: str, movement_type: FixedIncomeMovementType = APPLICATION
) -> Movement:
    return Movement(
        movement_date=day, movement_type=movement_type, amount=Decimal(amount)
    )


def _weekdays(start: date, end: date) -> list[date]:
    """Dias de semana de `start` a `end`, exclusive."""
    days = (start + timedelta(days=offset) for offset in range((end - start).days))
    return [day for day in days if day.weekday() < 5]


def _series(days: Iterable[date], value: str) -> list[DailyRate]:
    return [DailyRate(rate_date=day, value=Decimal(value)) for day in days]


def _round(value: Decimal) -> Decimal:
    return value.quantize(PLACES)


def test_prefixed_compounds_by_business_days() -> None:
    """Sem série do CDI, o dia útil é dia de semana, e o pré rende
    `(1 + taxa)^(dias úteis / 252)`."""
    start, today = date(2024, 1, 1), date(2024, 1, 15)

    marking = mark(_terms(), [_movement(start, "1000")], {}, today)

    expected = Decimal(1000) * Decimal("1.12") ** (Decimal(10) / Decimal(252))
    assert _round(marking.gross_value) == _round(expected)
    assert marking.invested == Decimal(1000)


def test_cdi_percentage_skips_days_without_cdi() -> None:
    """110% do CDI rende `1 + CDI * 1,1` por dia com CDI publicado; o dia de semana
    sem CDI (feriado) não rende."""
    start, today = date(2024, 1, 1), date(2024, 1, 15)
    holiday = date(2024, 1, 3)
    days = [day for day in _weekdays(start, today) if day != holiday]
    rates = {IndexSeries.CDI: _series(days, "0.05")}

    marking = mark(_terms(Indexer.CDI, "110"), [_movement(start, "1000")], rates, today)

    expected = Decimal(1000) * Decimal("1.00055") ** len(days)
    assert _round(marking.gross_value) == _round(expected)
    assert marking.series_date == days[-1]


def test_cdi_projects_last_rate_after_series_ends() -> None:
    """Depois do último CDI publicado, os dias de semana rendem pelo último valor, e
    `series_date` avisa até onde o dado é real."""
    start, today = date(2024, 1, 1), date(2024, 1, 15)
    published = _weekdays(start, date(2024, 1, 8))
    rates = {IndexSeries.CDI: _series(published, "0.05")}

    marking = mark(_terms(Indexer.CDI, "100"), [_movement(start, "1000")], rates, today)

    expected = Decimal(1000) * Decimal("1.0005") ** len(_weekdays(start, today))
    assert _round(marking.gross_value) == _round(expected)
    assert marking.series_date == date(2024, 1, 5)


def test_selic_with_zero_spread_follows_its_own_series() -> None:
    """Título na Selic sem spread rende pela série da Selic, com o calendário do
    CDI."""
    start, today = date(2024, 1, 1), date(2024, 1, 8)
    days = _weekdays(start, today)
    rates = {
        IndexSeries.CDI: _series(days, "0.05"),
        IndexSeries.SELIC: _series(days, "0.04"),
    }

    marking = mark(_terms(Indexer.SELIC, "0"), [_movement(start, "1000")], rates, today)

    assert _round(marking.gross_value) == _round(Decimal(1000) * Decimal("1.0004") ** 5)


def test_selic_spread_compounds_on_top_of_selic() -> None:
    """Selic + 0,1% a.a.: cada dia útil rende a Selic do dia vezes
    `1,001^(1/252)`."""
    start, today = date(2024, 1, 1), date(2024, 1, 8)
    days = _weekdays(start, today)
    rates = {
        IndexSeries.CDI: _series(days, "0.05"),
        IndexSeries.SELIC: _series(days, "0.04"),
    }

    marking = mark(
        _terms(Indexer.SELIC, "0.1"), [_movement(start, "1000")], rates, today
    )

    daily = Decimal("1.0004") * Decimal("1.001") ** (Decimal(1) / Decimal(252))
    assert _round(marking.gross_value) == _round(Decimal(1000) * daily**5)


def test_ipca_accrues_monthly_rate_by_calendar_day() -> None:
    """O IPCA do mês rende pró-rata por dia corrido, e a taxa real, por dia útil."""
    start, today = date(2024, 4, 1), date(2024, 5, 1)
    rates = {IndexSeries.IPCA: _series([start], "1")}

    marking = mark(_terms(Indexer.IPCA, "6"), [_movement(start, "1000")], rates, today)

    business_days = Decimal(len(_weekdays(start, today)))
    expected = (
        Decimal(1000) * Decimal("1.01") * Decimal("1.06") ** (business_days / 252)
    )
    assert _round(marking.gross_value) == _round(expected)


def test_partial_redemption_is_subtracted_linearly() -> None:
    """O resgate bruto sai do saldo e deixa de render dali em diante: o saldo é a
    aplicação corrigida menos o resgate corrigido desde a data dele."""
    start, redemption, today = date(2024, 1, 1), date(2024, 1, 8), date(2024, 1, 15)
    daily = Decimal("1.12") ** (Decimal(1) / Decimal(252))

    marking = mark(
        _terms(),
        [_movement(start, "1000"), _movement(redemption, "500", REDEMPTION)],
        {},
        today,
    )

    expected = Decimal(1000) * daily**10 - Decimal(500) * daily**5
    assert _round(marking.gross_value) == _round(expected)


def test_tax_follows_each_application_age() -> None:
    """Cada aplicação paga a alíquota da própria idade: a de 400 dias, 17,5%; a de
    100 dias, 22,5%."""
    today = date(2025, 6, 2)
    old, recent = today - timedelta(days=400), today - timedelta(days=100)

    marking = mark(
        _terms(), [_movement(old, "1000"), _movement(recent, "1000")], {}, today
    )

    alone_old = mark(_terms(), [_movement(old, "1000")], {}, today)
    alone_recent = mark(_terms(), [_movement(recent, "1000")], {}, today)
    old_gain = alone_old.gross_value - Decimal(1000)
    recent_gain = alone_recent.gross_value - Decimal(1000)
    expected = old_gain * Decimal("0.175") + recent_gain * Decimal("0.225")
    assert _round(marking.estimated_tax) == _round(expected)
    assert _round(marking.net_value) == _round(marking.gross_value - expected)


def test_redemption_consumes_oldest_application_first() -> None:
    """O resgate do valor inteiro da aplicação mais antiga a tira do IR: sobra só a
    recente, com a alíquota dela."""
    today = date(2025, 6, 2)
    old, recent = today - timedelta(days=400), today - timedelta(days=100)
    old_value = mark(_terms(), [_movement(old, "1000")], {}, recent).gross_value

    marking = mark(
        _terms(),
        [
            _movement(old, "1000"),
            _movement(recent, str(old_value), REDEMPTION),
            _movement(recent, "1000"),
        ],
        {},
        today,
    )

    alone_recent = mark(_terms(), [_movement(recent, "1000")], {}, today)
    assert _round(marking.invested) == Decimal(1000)
    assert _round(marking.estimated_tax) == _round(
        (alone_recent.gross_value - Decimal(1000)) * Decimal("0.225")
    )


def test_redemption_above_balance_closes_investment() -> None:
    """Resgate maior que o saldo estimado zera o título: a diferença é o erro da
    estimativa."""
    start, today = date(2024, 1, 1), date(2024, 1, 15)

    marking = mark(
        _terms(),
        [_movement(start, "1000"), _movement(today, "2000", REDEMPTION)],
        {},
        today,
    )

    assert marking.gross_value == 0
    assert marking.invested == 0
    assert marking.estimated_tax == 0


def test_tax_exempt_product_has_no_tax() -> None:
    """Título de tipo isento (LCI) não tem IR estimado."""
    start, today = date(2024, 1, 1), date(2024, 6, 3)

    marking = mark(
        _terms(product_type=FixedIncomeType.LCI), [_movement(start, "1000")], {}, today
    )

    assert marking.gross_value > Decimal(1000)
    assert marking.estimated_tax == 0
    assert marking.net_value == marking.gross_value


def test_value_stops_at_maturity() -> None:
    """Depois do vencimento o título para de render: a marcação é a do vencimento."""
    start, maturity = date(2024, 1, 1), date(2024, 3, 1)
    terms = _terms(maturity_date=maturity)

    late = mark(terms, [_movement(start, "1000")], {}, date(2024, 9, 2))
    on_maturity = mark(terms, [_movement(start, "1000")], {}, maturity)

    assert late.as_of == maturity
    assert late.gross_value == on_maturity.gross_value
