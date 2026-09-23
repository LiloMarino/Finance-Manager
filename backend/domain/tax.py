"""Apuração mensal do IR sobre o ganho líquido em bolsa, recalculada a cada consulta.

As regras são as da Receita, conferidas no Perguntas e Respostas IRPF 2026 (P&R) e
na IN RFB 1.585/2015:
- o ganho líquido é o resultado do conjunto das operações do mês (P&R 704);
- o day trade pareia a 1ª compra com a 1ª venda do dia e paga 20%; as operações
  comuns pagam 15% (P&R 705 e 706). O pareamento mora em `settle_day_trades`;
- o ganho com ações é isento quando o total vendido de ações no mês não passa de
  R$ 20.000,00. A isenção não cobre day trade nem fundo de índice (P&R 707);
- o prejuízo de operação comum compensa ganho de operação comum, e o de day trade
  compensa day trade, no mês ou em qualquer mês seguinte (P&R 709 a 711);
- o FII paga 20%, e o prejuízo dele compensa só ganho com FII (IN 1.585, art. 37);
- o DARF, código 6015, vence no último dia útil do mês seguinte (P&R 730); imposto
  abaixo de R$ 10,00 soma ao do período seguinte (Lei 9.430/1996, art. 68).

Os números que a lei pode mudar ficam em `TaxRules`, escolhida pela vigência do mês.
"""

from __future__ import annotations

import calendar
from collections import defaultdict
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal

from backend.core.enum import AssetClass, DarfStatus, LossPool, OperationType, TradeType
from backend.domain.business_days import BusinessCalendar
from backend.domain.position import ZERO, OperationRecord, settle_day_trades, steps

CENT = Decimal("0.01")
DARF_CODE = "6015"


@dataclass(frozen=True, slots=True, kw_only=True)
class TaxRules:
    stock_exemption_limit: Decimal
    rates: Mapping[LossPool, Decimal]
    darf_minimum: Decimal


# Cada entrada vale do mês de início até o início da seguinte. Uma mudança de lei
# entra como entrada nova, e os meses anteriores seguem apurados pela regra deles.
RULES: tuple[tuple[date, TaxRules], ...] = (
    (
        date.min,
        TaxRules(
            stock_exemption_limit=Decimal(20000),
            rates={
                LossPool.COMMON: Decimal("0.15"),
                LossPool.DAY_TRADE: Decimal("0.20"),
                LossPool.FII: Decimal("0.20"),
            },
            darf_minimum=Decimal(10),
        ),
    ),
)


def rules_for(
    year: int, month: int, rules: Iterable[tuple[date, TaxRules]] = RULES
) -> TaxRules:
    """A regra vigente no mês: a da última entrada que começou até ele."""
    first_day = date(year, month, 1)
    current = [entry for start, entry in rules if start <= first_day]
    return current[-1]


@dataclass(frozen=True, slots=True, kw_only=True)
class CategoryResult:
    """O resultado de uma classe num tipo de operação, no mês. `exempt` é o ganho
    comum com ações que a isenção tira da base."""

    asset_class: AssetClass
    trade_type: TradeType
    pool: LossPool
    result: Decimal
    sales: Decimal
    exempt: bool


@dataclass(frozen=True, slots=True, kw_only=True)
class PoolResult:
    pool: LossPool
    net: Decimal
    loss_before: Decimal
    compensated: Decimal
    taxable: Decimal
    rate: Decimal
    tax: Decimal
    loss_after: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class MonthlyTax:
    """A apuração de um mês. `tax` é o imposto do próprio mês, em centavos; o
    `darf_amount` soma a ele o que vinha carregado abaixo do mínimo, e só existe
    quando o total chega ao mínimo do DARF."""

    year: int
    month: int
    categories: list[CategoryResult]
    stock_sales: Decimal
    exempt_profit: Decimal
    pools: list[PoolResult]
    tax: Decimal
    carried_before: Decimal
    carried_after: Decimal
    darf_amount: Decimal | None
    due_date: date | None

    @property
    def gross_result(self) -> Decimal:
        return sum((category.result for category in self.categories), ZERO)

    @property
    def compensated(self) -> Decimal:
        return sum((pool.compensated for pool in self.pools), ZERO)

    @property
    def taxable(self) -> Decimal:
        return sum((pool.taxable for pool in self.pools), ZERO)


def _pool(asset_class: AssetClass, trade_type: TradeType) -> LossPool:
    if asset_class is AssetClass.FII:
        return LossPool.FII
    if trade_type is TradeType.DAY_TRADE:
        return LossPool.DAY_TRADE
    return LossPool.COMMON


def _months(first: date, last: date) -> Iterable[tuple[int, int]]:
    year, month = first.year, first.month
    while (year, month) <= (last.year, last.month):
        yield year, month
        year, month = (year + 1, 1) if month == 12 else (year, month + 1)


def darf_due_date(year: int, month: int, business: BusinessCalendar) -> date:
    """Último dia útil do mês seguinte ao da apuração."""
    next_year, next_month = (year + 1, 1) if month == 12 else (year, month + 1)
    day = date(next_year, next_month, calendar.monthrange(next_year, next_month)[1])
    while not business.is_business_day(day):
        day -= timedelta(days=1)
    return day


@dataclass(slots=True)
class _Category:
    result: Decimal = ZERO
    sales: Decimal = ZERO


def assess(
    operations: Iterable[OperationRecord],
    asset_classes: Mapping[str, AssetClass],
    today: date,
    business: BusinessCalendar,
    rules: Iterable[tuple[date, TaxRules]] = RULES,
) -> list[MonthlyTax]:
    """Todos os meses da primeira operação até o mês de `today` (ou até a última
    operação, se ela for posterior), com o prejuízo e o saldo abaixo do mínimo
    atravessando de um mês para o outro."""
    operations = list(operations)
    if not operations:
        return []
    rules = tuple(rules)

    # Resultado de cada (mês, classe, tipo de operação)
    by_month: defaultdict[
        tuple[int, int], dict[tuple[AssetClass, TradeType], _Category]
    ]
    by_month = defaultdict(dict)

    def category(day: date, asset_class: AssetClass, trade: TradeType) -> _Category:
        return by_month[(day.year, day.month)].setdefault(
            (asset_class, trade), _Category()
        )

    for step in steps(operations):
        operation = step.operation
        if operation.operation_type is not OperationType.SELL:
            continue
        item = category(
            operation.operation_date, asset_classes[operation.ticker], TradeType.SWING
        )
        item.result += (
            operation.unit_price - step.before.average_price
        ) * operation.quantity
        item.sales += operation.unit_price * operation.quantity

    _, day_trades = settle_day_trades(operations)
    for trade in day_trades:
        item = category(
            trade.trade_date, asset_classes[trade.ticker], TradeType.DAY_TRADE
        )
        item.result += trade.result
        item.sales += trade.proceeds

    first = min(op.operation_date for op in operations)
    last = max(today, max(op.operation_date for op in operations))
    losses: dict[LossPool, Decimal] = dict.fromkeys(LossPool, ZERO)
    carried = ZERO
    months: list[MonthlyTax] = []

    for year, month in _months(first, last):
        month_rules = rules_for(year, month, rules)
        raw = by_month.get((year, month), {})
        stock_sales = sum(
            (
                item.sales
                for (asset_class, _), item in raw.items()
                if asset_class is AssetClass.STOCK
            ),
            ZERO,
        )
        stock_exempt = stock_sales <= month_rules.stock_exemption_limit

        categories = [
            CategoryResult(
                asset_class=asset_class,
                trade_type=trade_type,
                pool=_pool(asset_class, trade_type),
                result=item.result,
                sales=item.sales,
                exempt=(
                    asset_class is AssetClass.STOCK
                    and trade_type is TradeType.SWING
                    and stock_exempt
                    and item.result > ZERO
                ),
            )
            for (asset_class, trade_type), item in sorted(
                raw.items(), key=lambda entry: entry[0]
            )
        ]

        # Líquido de cada conjunto de compensação, sem o ganho isento
        pools: list[PoolResult] = []
        for pool in LossPool:
            net = sum(
                (c.result for c in categories if c.pool is pool and not c.exempt),
                ZERO,
            )
            loss_before = losses[pool]
            rate = month_rules.rates[pool]
            if net > ZERO:
                compensated = min(loss_before, net)
                taxable = net - compensated
                loss_after = loss_before - compensated
            else:
                compensated = ZERO
                taxable = ZERO
                loss_after = loss_before - net
            losses[pool] = loss_after
            pools.append(
                PoolResult(
                    pool=pool,
                    net=net,
                    loss_before=loss_before,
                    compensated=compensated,
                    taxable=taxable,
                    rate=rate,
                    tax=taxable * rate,
                    loss_after=loss_after,
                )
            )

        tax = sum((pool.tax for pool in pools), ZERO).quantize(CENT, ROUND_HALF_UP)
        due = carried + tax
        emits = due >= month_rules.darf_minimum
        months.append(
            MonthlyTax(
                year=year,
                month=month,
                categories=categories,
                stock_sales=stock_sales,
                exempt_profit=sum((c.result for c in categories if c.exempt), ZERO),
                pools=pools,
                tax=tax,
                carried_before=carried,
                carried_after=ZERO if emits else due,
                darf_amount=due if emits else None,
                due_date=darf_due_date(year, month, business) if emits else None,
            )
        )
        carried = ZERO if emits else due

    return months


def darf_status(assessment: MonthlyTax, paid: bool, today: date) -> DarfStatus:
    """Pagamento registrado vale sobre tudo: o DARF pago continua pago mesmo que a
    apuração do mês mude depois."""
    if paid:
        return DarfStatus.PAID
    if assessment.due_date is not None:
        return DarfStatus.OVERDUE if today > assessment.due_date else DarfStatus.DUE
    if assessment.tax > ZERO:
        return DarfStatus.CARRIED
    if assessment.exempt_profit > ZERO:
        return DarfStatus.EXEMPT
    if assessment.compensated > ZERO:
        return DarfStatus.COMPENSATED
    return DarfStatus.NONE
