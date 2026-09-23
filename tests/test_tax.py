from __future__ import annotations

from datetime import date
from decimal import Decimal
from itertools import count

from backend.core.enum import AssetClass, DarfStatus, LossPool, OperationType, TradeType
from backend.domain.business_days import BusinessCalendar
from backend.domain.index_series import DailyRate
from backend.domain.position import OperationRecord
from backend.domain.tax import (
    RULES,
    MonthlyTax,
    TaxRules,
    assess,
    darf_status,
    rules_for,
)

_ids = count(1)

CLASSES = {
    "ABCD3": AssetClass.STOCK,
    "WXYZ3": AssetClass.STOCK,
    "EFGH11": AssetClass.FII,
    "IJKL11": AssetClass.ETF,
    "MNOP34": AssetClass.BDR,
}
WEEKDAYS = BusinessCalendar([])


def _op(
    operation_type: OperationType,
    quantity: str,
    unit_price: str,
    day: date,
    ticker: str = "ABCD3",
) -> OperationRecord:
    return OperationRecord(
        id=next(_ids),
        ticker=ticker,
        operation_date=day,
        operation_type=operation_type,
        quantity=Decimal(quantity),
        unit_price=Decimal(unit_price),
    )


def _buy(
    quantity: str, price: str, day: date, ticker: str = "ABCD3"
) -> OperationRecord:
    return _op(OperationType.BUY, quantity, price, day, ticker)


def _sell(
    quantity: str, price: str, day: date, ticker: str = "ABCD3"
) -> OperationRecord:
    return _op(OperationType.SELL, quantity, price, day, ticker)


def _assess(
    *operations: OperationRecord, today: date
) -> dict[tuple[int, int], MonthlyTax]:
    return {
        (month.year, month.month): month
        for month in assess(operations, CLASSES, today, WEEKDAYS)
    }


def _pool(month: MonthlyTax, pool: LossPool) -> Decimal:
    return next(item.loss_after for item in month.pools if item.pool is pool)


def test_month_nets_every_sale_before_taxing() -> None:
    """O imposto sai do líquido do mês: o lucro de uma venda e o prejuízo de outra
    se anulam antes da alíquota, em qualquer ordem."""
    months = _assess(
        _buy("1000", "30", date(2024, 1, 10)),
        _buy("1000", "30", date(2024, 1, 10), "WXYZ3"),
        _sell("1000", "40", date(2024, 3, 4)),
        _sell("1000", "20", date(2024, 3, 5), "WXYZ3"),
        today=date(2024, 3, 31),
    )

    march = months[(2024, 3)]
    assert march.gross_result == 0
    assert march.tax == 0
    assert _pool(march, LossPool.COMMON) == 0


def test_etf_gain_is_compensated_by_stock_loss() -> None:
    """Ações, ETF e BDR em operação comum formam um conjunto só: o prejuízo de
    ações compensa o ganho com ETF no mês seguinte."""
    months = _assess(
        _buy("1000", "30", date(2024, 1, 10)),
        _sell("1000", "20", date(2024, 2, 5)),
        _buy("100", "100", date(2024, 1, 10), "IJKL11"),
        _sell("100", "150", date(2024, 3, 5), "IJKL11"),
        today=date(2024, 3, 31),
    )

    assert _pool(months[(2024, 2)], LossPool.COMMON) == Decimal(10000)
    march = months[(2024, 3)]
    assert march.compensated == Decimal(5000)
    assert march.tax == 0
    assert _pool(march, LossPool.COMMON) == Decimal(5000)


def test_fii_loss_only_offsets_fii_gains() -> None:
    """O prejuízo com FII fica num conjunto à parte: não abate o ganho com ETF, que
    paga 15%, e abate o ganho seguinte com FII, que pagaria 20%."""
    months = _assess(
        _buy("100", "100", date(2024, 1, 10), "EFGH11"),
        _sell("100", "80", date(2024, 2, 5), "EFGH11"),
        _buy("100", "100", date(2024, 1, 10), "IJKL11"),
        _sell("100", "150", date(2024, 2, 5), "IJKL11"),
        _buy("100", "100", date(2024, 3, 4), "EFGH11"),
        _sell("100", "130", date(2024, 4, 5), "EFGH11"),
        today=date(2024, 4, 30),
    )

    assert months[(2024, 2)].tax == Decimal("750.00")
    assert _pool(months[(2024, 2)], LossPool.FII) == Decimal(2000)
    april = months[(2024, 4)]
    assert april.compensated == Decimal(2000)
    assert april.tax == Decimal("200.00")


def test_day_trade_pairs_same_day_trades_and_pays_twenty_percent() -> None:
    """Compra e venda no mesmo dia pareiam pelo preço do dia, não pelo PM da
    carteira, pagam 20% e não têm isenção."""
    months = _assess(
        _buy("100", "10", date(2024, 1, 10)),
        _buy("100", "20", date(2024, 2, 5)),
        _sell("100", "25", date(2024, 2, 5)),
        today=date(2024, 2, 29),
    )

    february = months[(2024, 2)]
    [category] = february.categories
    assert category.trade_type is TradeType.DAY_TRADE
    assert category.result == Decimal(500)
    assert february.tax == Decimal("100.00")


def test_day_trade_loss_only_offsets_day_trade_gains() -> None:
    """O prejuízo de day trade não abate ganho de operação comum."""
    months = _assess(
        _buy("100", "20", date(2024, 2, 5)),
        _sell("100", "10", date(2024, 2, 5)),
        _buy("100", "100", date(2024, 1, 10), "IJKL11"),
        _sell("100", "150", date(2024, 2, 6), "IJKL11"),
        today=date(2024, 2, 29),
    )

    february = months[(2024, 2)]
    assert february.tax == Decimal("750.00")
    assert _pool(february, LossPool.DAY_TRADE) == Decimal(1000)


def test_stock_gain_is_exempt_up_to_twenty_thousand_in_sales() -> None:
    """Com até R$ 20 mil vendidos em ações no mês, o ganho comum com ações é isento
    e aparece como lucro isento; acima disso, é tributado."""
    months = _assess(
        _buy("2000", "5", date(2024, 1, 10)),
        _sell("1000", "20", date(2024, 2, 5)),
        _sell("1000", "20.01", date(2024, 3, 5)),
        today=date(2024, 3, 31),
    )

    february = months[(2024, 2)]
    assert february.exempt_profit == Decimal(15000)
    assert february.tax == 0
    assert (
        darf_status(february, paid=False, today=date(2024, 3, 31)) is DarfStatus.EXEMPT
    )
    assert months[(2024, 3)].exempt_profit == 0
    assert months[(2024, 3)].tax == Decimal("2251.50")


def test_stock_loss_in_exempt_month_is_compensable() -> None:
    """O prejuízo com ações num mês de vendas abaixo de R$ 20 mil entra no
    prejuízo a compensar."""
    months = _assess(
        _buy("100", "50", date(2024, 1, 10)),
        _sell("100", "40", date(2024, 2, 5)),
        today=date(2024, 2, 29),
    )

    assert _pool(months[(2024, 2)], LossPool.COMMON) == Decimal(1000)


def test_etf_and_bdr_have_no_exemption() -> None:
    """ETF e BDR pagam 15% sobre o ganho mesmo com pouca venda no mês."""
    months = _assess(
        _buy("10", "100", date(2024, 1, 10), "IJKL11"),
        _sell("10", "200", date(2024, 2, 5), "IJKL11"),
        _buy("10", "100", date(2024, 1, 10), "MNOP34"),
        _sell("10", "200", date(2024, 2, 5), "MNOP34"),
        today=date(2024, 2, 29),
    )

    february = months[(2024, 2)]
    assert february.exempt_profit == 0
    assert february.tax == Decimal("300.00")


def test_tax_below_minimum_is_carried_until_it_reaches_it() -> None:
    """Imposto abaixo de R$ 10 não gera DARF: soma ao do mês seguinte, e o DARF sai
    quando o total chega a R$ 10."""
    months = _assess(
        _buy("100", "100", date(2024, 1, 10), "IJKL11"),
        _sell("10", "104", date(2024, 2, 5), "IJKL11"),
        _sell("10", "104", date(2024, 3, 5), "IJKL11"),
        today=date(2024, 3, 31),
    )

    february = months[(2024, 2)]
    assert february.tax == Decimal("6.00")
    assert february.darf_amount is None
    assert february.carried_after == Decimal("6.00")
    assert darf_status(february, paid=False, today=date(2024, 3, 31)) is (
        DarfStatus.CARRIED
    )
    march = months[(2024, 3)]
    assert march.darf_amount == Decimal("12.00")
    assert march.carried_after == 0


def test_darf_is_due_on_last_business_day_of_next_month() -> None:
    """O DARF vence no último dia útil do mês seguinte: sem CDI publicado no fim
    do mês, o vencimento recua para o dia útil anterior."""
    cdi = [
        DailyRate(rate_date=day, value=Decimal("0.04"))
        for day in (*(date(2024, 3, d) for d in range(1, 32)), date(2024, 4, 1))
        if day.weekday() < 5 and day != date(2024, 3, 29)
    ]
    months = assess(
        [
            _buy("100", "100", date(2024, 1, 10), "IJKL11"),
            _sell("100", "150", date(2024, 2, 5), "IJKL11"),
        ],
        CLASSES,
        date(2024, 2, 29),
        BusinessCalendar(cdi),
    )

    # 29/03/2024 foi Sexta-feira Santa, sem CDI publicado
    assert months[-1].due_date == date(2024, 3, 28)
    assert darf_status(months[-1], paid=False, today=date(2024, 4, 1)) is (
        DarfStatus.OVERDUE
    )
    assert darf_status(months[-1], paid=True, today=date(2024, 4, 1)) is (
        DarfStatus.PAID
    )


def test_december_loss_offsets_next_year_gain() -> None:
    """O prejuízo não expira na virada do ano."""
    months = _assess(
        _buy("100", "100", date(2023, 11, 10), "IJKL11"),
        _sell("100", "50", date(2023, 12, 5), "IJKL11"),
        _buy("100", "100", date(2023, 12, 6), "IJKL11"),
        _sell("100", "150", date(2024, 1, 5), "IJKL11"),
        today=date(2024, 1, 31),
    )

    january = months[(2024, 1)]
    assert january.compensated == Decimal(5000)
    assert january.tax == 0
    assert darf_status(january, paid=False, today=date(2024, 1, 31)) is (
        DarfStatus.COMPENSATED
    )


def test_rules_follow_the_month_they_took_effect() -> None:
    """A regra de cada mês é a da vigência dele: uma regra nova vale do início dela
    em diante, e os meses anteriores seguem com a antiga."""
    [(_, current)] = RULES
    newer = TaxRules(
        stock_exemption_limit=Decimal(60000),
        rates=current.rates,
        darf_minimum=current.darf_minimum,
    )
    rules = (*RULES, (date(2027, 1, 1), newer))

    assert rules_for(2026, 12, rules) is current
    assert rules_for(2027, 1, rules) is newer
