"""À vista, parcelado ou adiantar a fatura: qual caminho termina com mais dinheiro.

No parcelado, o valor inteiro fica aplicado desde o início e cada parcela sai do
investimento no dia dela, pelo bruto que deixa a parcela líquida de IOF e IR. O que
sobra no último vencimento é o ganho de parcelar. À vista, o desconto é o ganho, e
ele fica no mesmo investimento até o mesmo último vencimento. Os dois caminhos se
comparam no mesmo dia.

O à vista é linear no desconto, porque o imposto é proporcional ao valor resgatado.
Por isso o desconto de empate sai direto: a sobra do parcelado sobre o que um real
aplicado vira até o fim.
"""

from __future__ import annotations

import calendar
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import ROUND_DOWN, Decimal

from backend.core.enum import (
    FixedIncomeType,
    Indexer,
    IndexSeries,
    InstallmentMode,
    PaymentChoice,
)
from backend.domain.break_even import solve
from backend.domain.business_days import BusinessCalendar
from backend.domain.fixed_income import Application, FixedIncomeTerms, Redemption
from backend.domain.index_series import DailyRate

ZERO = Decimal(0)
ONE = Decimal(1)
HUNDRED = Decimal(100)
CENT = Decimal("0.01")
DAY = timedelta(days=1)
# A curva de empate vai até esse número de parcelas, ou até o informado se for maior
CURVE_INSTALLMENTS = 24

Rates = Mapping[IndexSeries, Sequence[DailyRate]]


@dataclass(frozen=True, slots=True, kw_only=True)
class Purchase:
    """`amount` segue o `mode`: o preço na compra, a parcela no adiantamento.
    `discount` em %, nulo quando só interessa o desconto de empate."""

    mode: InstallmentMode
    amount: Decimal
    installments: int
    start: date
    first_due: date
    discount: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class Installment:
    due_date: date
    amount: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class Withdrawal:
    """A parcela paga pelo investimento no último dia útil até o vencimento."""

    installment: Installment
    withdrawn_on: date
    redemption: Redemption


@dataclass(frozen=True, slots=True, kw_only=True)
class BalancePoint:
    """O líquido de cada caminho se tudo fosse resgatado no fim do dia: no
    parcelado, o que ainda está aplicado; à vista, o desconto aplicado."""

    day: date
    installments: Decimal
    cash: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class CurvePoint:
    installments: int
    break_even_discount: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class BreakEvenRate:
    """A taxa do investimento hipotético que empata os dois caminhos, no formato do
    indexador. Nula quando nenhuma taxa empata."""

    product_type: FixedIncomeType
    indexer: Indexer
    rate: Decimal | None


@dataclass(frozen=True, slots=True, kw_only=True)
class Simulation:
    """`break_even_discount` em fração (0,05 é 5%). `winner` nulo sem desconto
    informado ou no empate exato."""

    total: Decimal
    cash_price: Decimal | None
    withdrawals: list[Withdrawal]
    installments_leftover: Decimal
    cash_leftover: Decimal | None
    winner: PaymentChoice | None
    break_even_discount: Decimal
    break_even_rates: list[BreakEvenRate] | None
    balance: list[BalancePoint]
    curve: list[CurvePoint]


# Os investimentos hipotéticos da conta "do desconto para o investimento", com a
# faixa de taxa em que a bisseção começa
BREAK_EVEN_PRODUCTS = (
    (FixedIncomeType.CDB, Indexer.CDI, Decimal(0), HUNDRED),
    (FixedIncomeType.LCA, Indexer.CDI, Decimal(0), HUNDRED),
    (FixedIncomeType.CDB, Indexer.PREFIXED, Decimal(0), Decimal(10)),
    (FixedIncomeType.CDB, Indexer.IPCA, Decimal(-20), Decimal(10)),
)


def _add_months(day: date, months: int) -> date:
    index = day.year * 12 + day.month - 1 + months
    year, month = index // 12, index % 12 + 1
    return date(year, month, min(day.day, calendar.monthrange(year, month)[1]))


def schedule(
    mode: InstallmentMode, amount: Decimal, count: int, first_due: date
) -> list[Installment]:
    """Parcelas mensais no mesmo dia do mês, limitado ao último. Na compra, o preço
    se divide em centavos, e o resto vai na primeira parcela."""
    if mode is InstallmentMode.PURCHASE:
        base = (amount / count).quantize(CENT, rounding=ROUND_DOWN)
        amounts = [amount - base * (count - 1), *([base] * (count - 1))]
    else:
        amounts = [amount] * count
    return [
        Installment(due_date=_add_months(first_due, index), amount=value)
        for index, value in enumerate(amounts)
    ]


class _InstallmentsPath:
    """O valor inteiro aplicado em `start`, com as parcelas saindo dele. A
    aplicação conta em unidades do fator acumulado, que valem `F(t)` cada."""

    def __init__(
        self,
        application: Application,
        installments: Sequence[Installment],
        start: date,
        business: BusinessCalendar,
    ) -> None:
        self.application = application
        self.withdrawals: list[Withdrawal] = []
        # As unidades que ficam aplicadas depois de cada saque
        self.remaining: list[tuple[date, Decimal]] = []
        units = sum((installment.amount for installment in installments), ZERO)
        for installment in installments:
            day = max(start, business.on_or_before(installment.due_date))
            gross = application.gross_for_net(installment.amount, day)
            self.withdrawals.append(
                Withdrawal(
                    installment=installment,
                    withdrawn_on=day,
                    redemption=application.redeem(gross, day),
                )
            )
            units -= gross / application.factor(day)
            self.remaining.append((day, units))
        self.end = self.withdrawals[-1].withdrawn_on
        self.leftover = self.net_at(units, self.end)

    def net_at(self, units: Decimal, day: date) -> Decimal:
        value = units * self.application.factor(day)
        return self.application.redeem(value, day).net if value > ZERO else value

    def units_on(self, day: date, initial: Decimal) -> Decimal:
        units = initial
        for withdrawn_on, remaining in self.remaining:
            if withdrawn_on > day:
                break
            units = remaining
        return units


def _terms(
    product_type: FixedIncomeType, indexer: Indexer, rate: Decimal
) -> FixedIncomeTerms:
    return FixedIncomeTerms(
        product_type=product_type, indexer=indexer, rate=rate, maturity_date=None
    )


def _break_even_discount(path: _InstallmentsPath, total: Decimal) -> Decimal:
    """O desconto, em fração do total, cujo valor aplicado até o último vencimento
    vira a mesma sobra do parcelado."""
    return path.leftover / (total * path.application.value_at(ONE, path.end).net)


def _break_even_rates(
    purchase: Purchase,
    installments: Sequence[Installment],
    discount: Decimal,
    rates: Rates,
    business: BusinessCalendar,
) -> list[BreakEvenRate]:
    total = sum((installment.amount for installment in installments), ZERO)
    saved = total * discount / HUNDRED
    end = business.on_or_before(installments[-1].due_date)

    def result(
        product_type: FixedIncomeType, indexer: Indexer, low: Decimal, high: Decimal
    ) -> BreakEvenRate:
        def gap(rate: Decimal) -> Decimal:
            application = Application(
                _terms(product_type, indexer, rate), purchase.start, rates, end
            )
            path = _InstallmentsPath(
                application, installments, purchase.start, business
            )
            return path.leftover - application.value_at(saved, path.end).net

        return BreakEvenRate(
            product_type=product_type, indexer=indexer, rate=solve(gap, low, high)
        )

    return [result(*product) for product in BREAK_EVEN_PRODUCTS]


def simulate(purchase: Purchase, terms: FixedIncomeTerms, rates: Rates) -> Simulation:
    """`rates` já cobre até o último vencimento da curva de empate, com a projeção
    depois do dado real."""
    business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    curve_count = max(CURVE_INSTALLMENTS, purchase.installments)
    horizon = business.on_or_before(_add_months(purchase.first_due, curve_count - 1))
    application = Application(terms, purchase.start, rates, horizon)

    installments = schedule(
        purchase.mode, purchase.amount, purchase.installments, purchase.first_due
    )
    total = sum((installment.amount for installment in installments), ZERO)
    path = _InstallmentsPath(application, installments, purchase.start, business)

    saved = (
        total * purchase.discount / HUNDRED if purchase.discount is not None else None
    )
    cash_leftover = (
        application.value_at(saved, path.end).net if saved is not None else None
    )
    winner = None
    if cash_leftover is not None and cash_leftover != path.leftover:
        winner = (
            PaymentChoice.CASH
            if cash_leftover > path.leftover
            else PaymentChoice.INSTALLMENTS
        )

    balance: list[BalancePoint] = []
    day = purchase.start
    while day <= path.end:
        balance.append(
            BalancePoint(
                day=day,
                installments=path.net_at(path.units_on(day, total), day),
                cash=application.value_at(saved, day).net
                if saved is not None
                else None,
            )
        )
        day += DAY

    curve: list[CurvePoint] = []
    for count in range(1, curve_count + 1):
        option = schedule(purchase.mode, purchase.amount, count, purchase.first_due)
        curve.append(
            CurvePoint(
                installments=count,
                break_even_discount=_break_even_discount(
                    _InstallmentsPath(application, option, purchase.start, business),
                    sum((installment.amount for installment in option), ZERO),
                ),
            )
        )

    return Simulation(
        total=total,
        cash_price=total - saved if saved is not None else None,
        withdrawals=path.withdrawals,
        installments_leftover=path.leftover,
        cash_leftover=cash_leftover,
        winner=winner,
        break_even_discount=_break_even_discount(path, total),
        break_even_rates=_break_even_rates(
            purchase, installments, purchase.discount, rates, business
        )
        if purchase.discount is not None
        else None,
        balance=balance,
        curve=curve,
    )
