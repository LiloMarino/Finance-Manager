from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from itertools import count

from backend.core.enum import (
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    OperationType,
    PortfolioCategory,
)
from backend.domain.daily_series import (
    DailyLine,
    aggregate,
    chart_indices,
    equity_line,
    months_before,
    period_bounds,
)
from backend.domain.fixed_income import FixedIncomeTerms, Movement, daily_gross, mark
from backend.domain.market_data import DailyClose
from backend.domain.position import OperationRecord

_ids = count(1)

# Segunda a sexta de uma semana e a segunda seguinte
DAYS = [
    date(2024, 3, 4),
    date(2024, 3, 5),
    date(2024, 3, 6),
    date(2024, 3, 7),
    date(2024, 3, 8),
    date(2024, 3, 11),
]


def _op(
    operation_type: OperationType, quantity: str, unit_price: str, day: date
) -> OperationRecord:
    return OperationRecord(
        id=next(_ids),
        ticker="ABCD11",
        operation_date=day,
        operation_type=operation_type,
        quantity=Decimal(quantity),
        unit_price=Decimal(unit_price),
    )


def _closes(*pairs: tuple[date, str]) -> list[DailyClose]:
    return [DailyClose(price_date=day, close=Decimal(close)) for day, close in pairs]


def test_value_is_quantity_times_the_last_close() -> None:
    """O valor do dia é a quantidade vezes o fechamento; dia sem pregão repete o
    último, e a compra entra como entrada no dia dela."""
    values, inflows, outflows = equity_line(
        [_op(OperationType.BUY, "10", "10", DAYS[1])],
        _closes((DAYS[1], "11"), (DAYS[3], "12")),
        DAYS,
    )

    assert values == [0, 110, 110, 120, 120, 120]
    assert inflows == [0, 100, 0, 0, 0, 0]
    assert outflows == [0] * 6


def test_asset_without_close_is_worth_its_cost() -> None:
    """Antes do primeiro fechamento em cache, o ativo vale o custo."""
    values, _, _ = equity_line(
        [_op(OperationType.BUY, "10", "10", DAYS[0])],
        _closes((DAYS[2], "13")),
        DAYS,
    )

    assert values == [100, 100, 130, 130, 130, 130]


def test_split_converts_the_quantity_before_it_to_todays_basis() -> None:
    """O fechamento vem ajustado pelo desdobro desde a véspera da data gravada: a
    quantidade anterior ao evento é convertida pelo fator, e o valor não salta."""
    values, _, _ = equity_line(
        [
            _op(OperationType.BUY, "10", "20", DAYS[0]),
            _op(OperationType.SPLIT, "10", "0", DAYS[3]),
        ],
        # O fechamento real era 20; ajustado pelo desdobro de 1 para 2, é 10
        _closes((DAYS[0], "10"), (DAYS[2], "10"), (DAYS[4], "10")),
        DAYS,
    )

    assert values == [200] * 6


def test_reverse_split_and_bonus_use_their_own_factor() -> None:
    """O grupamento divide a quantidade pelo fator gravado, e a bonificação soma a
    quantidade bonificada: os dois convertem o passado pelo mesmo fator."""
    values, _, _ = equity_line(
        [
            _op(OperationType.BUY, "100", "1", DAYS[0]),
            _op(OperationType.REVERSE_SPLIT, "0.1", "0", DAYS[1]),
            _op(OperationType.BONUS, "5", "0", DAYS[3]),
        ],
        # Base de hoje: 10 cotas depois do grupamento, 15 depois da bonificação
        _closes((DAYS[0], "6.60")),
        DAYS,
    )

    assert values == [99, 99, 99, 99, 99, 99]


def test_day_trade_counts_both_legs_as_flows() -> None:
    """No day trade, a compra e a venda entram inteiras como entrada e saída, e só
    a sobra move a quantidade."""
    values, inflows, outflows = equity_line(
        [
            _op(OperationType.BUY, "10", "10", DAYS[0]),
            _op(OperationType.BUY, "5", "10", DAYS[1]),
            _op(OperationType.SELL, "5", "12", DAYS[1]),
        ],
        _closes((DAYS[0], "10")),
        DAYS,
    )

    assert values == [100] * 6
    assert inflows == [100, 50, 0, 0, 0, 0]
    assert outflows == [0, 60, 0, 0, 0, 0]


def test_flow_on_a_non_business_day_enters_the_next_one() -> None:
    """Um fluxo de fim de semana entra no dia útil seguinte da série."""
    _, inflows, _ = equity_line(
        [_op(OperationType.BUY, "1", "10", date(2024, 3, 9))],
        _closes((DAYS[0], "10")),
        DAYS,
    )

    assert inflows == [0, 0, 0, 0, 0, 10]


def test_fixed_income_series_matches_the_marking_of_each_day() -> None:
    """A série da renda fixa é, em cada dia, o bruto que a marcação daria com as
    movimentações até ele."""
    terms = FixedIncomeTerms(
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=None,
    )
    movements = [
        Movement(
            movement_date=date(2024, 1, 2),
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=Decimal(1000),
        ),
        Movement(
            movement_date=date(2024, 1, 20),
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=Decimal(500),
        ),
        Movement(
            movement_date=date(2024, 2, 10),
            movement_type=FixedIncomeMovementType.REDEMPTION,
            amount=Decimal(300),
        ),
    ]
    days = [date(2024, 1, 1) + timedelta(days=offset) for offset in range(60)]

    series = daily_gross(terms, movements, {}, days)

    for day, gross in zip(days, series, strict=True):
        until = [movement for movement in movements if movement.movement_date <= day]
        expected = mark(terms, until, {}, day).gross_value
        assert gross.quantize(Decimal("1e-12")) == expected.quantize(Decimal("1e-12"))


def test_aggregate_sums_lines_from_the_first_day_with_activity() -> None:
    """A soma das linhas começa no primeiro dia com valor ou fluxo."""
    zero = [Decimal(0)] * 3
    line = DailyLine(
        category=PortfolioCategory.FII,
        asset_id=1,
        investment_id=None,
        values=[Decimal(0), Decimal(100), Decimal(110)],
        inflows=[Decimal(0), Decimal(100), Decimal(0)],
        outflows=zero,
        income=zero,
    )
    other = DailyLine(
        category=PortfolioCategory.FIXED_INCOME,
        asset_id=None,
        investment_id=1,
        values=[Decimal(0), Decimal(0), Decimal(50)],
        inflows=[Decimal(0), Decimal(0), Decimal(50)],
        outflows=zero,
        income=zero,
    )

    points = aggregate(DAYS[:3], [line, other])

    assert [(point.day, point.value, point.inflow) for point in points] == [
        (DAYS[1], 100, 100),
        (DAYS[2], 160, 50),
    ]


def test_months_before_clamps_to_the_end_of_a_shorter_month() -> None:
    """Seis meses antes de 31/08 é 29/02 num ano bissexto."""
    assert months_before(date(2024, 8, 31), 6) == date(2024, 2, 29)
    assert months_before(date(2024, 1, 15), 12) == date(2023, 1, 15)


def test_period_bounds_are_the_days_inside_the_period() -> None:
    """O período pega os dias da série entre as pontas, inclusive."""
    assert period_bounds(DAYS, date(2024, 3, 5), date(2024, 3, 9)) == (1, 4)
    assert period_bounds(DAYS, None, None) == (0, 5)
    assert period_bounds(DAYS, date(2024, 3, 12), None) is None


def test_long_chart_keeps_one_point_per_month() -> None:
    """Acima de um ano, o gráfico fica com o primeiro dia, o último de cada mês e o
    último da série; até um ano, todos os dias."""
    days = [date(2023, 1, 2) + timedelta(days=offset) for offset in range(400)]

    kept = [days[index] for index in chart_indices(days)]

    assert kept[0] == days[0]
    assert kept[1] == date(2023, 1, 31)
    assert kept[-1] == days[-1]
    assert len(kept) == 15
    assert chart_indices(days[:300]) == list(range(300))
