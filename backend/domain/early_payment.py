"""Adiantar parcelas com o desconto do banco.

O banco desconta a parcela adiantada pela taxa mensal composta pelos meses de
antecedência, contados em faturas: a parcela que cai `i` faturas depois da atual sai
por `parcela / (1 + taxa)^i`. A parcela da fatura atual já fechou e é paga cheia.

Duas contas usam esse desconto. Parcelar e adiantar: parcela-se o preço cheio e logo
em seguida adianta-se tudo o que dá, contra o preço à vista. Adiantar ou deixar
aplicado: cada parcela que falta contra o que o dinheiro renderia, líquido de IR e
IOF, até o vencimento dela.
"""

from __future__ import annotations

from collections.abc import Collection, Mapping, Sequence
from dataclasses import dataclass, replace
from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from backend.core.enum import IndexSeries, PaymentChoice
from backend.core.errors import FinanceError
from backend.domain.break_even import solve
from backend.domain.business_days import BusinessCalendar
from backend.domain.fixed_income import Application, FixedIncomeTerms
from backend.domain.index_series import DailyRate
from backend.domain.installments import Installment, add_months, schedule

ZERO = Decimal(0)
ONE = Decimal(1)
HUNDRED = Decimal(100)
CENT = Decimal("0.01")
# A taxa achada pelo valor do banco refaz a soma dele bem abaixo do centavo
RATE_TOLERANCE = Decimal("1e-12")
# A faixa, em % ao mês, em que a bisseção da taxa do banco começa
RATE_LOW = Decimal(0)
RATE_HIGH = Decimal(10)
MONTH_DAYS = Decimal(365) / 12

Rates = Mapping[IndexSeries, Sequence[DailyRate]]


class BankAmountError(FinanceError):
    status = 422


def discounted(amount: Decimal, monthly_rate: Decimal, months: int) -> Decimal:
    """`amount` pago `months` meses antes do vencimento, com a taxa em % ao mês."""
    return amount / (ONE + monthly_rate / HUNDRED) ** months


@dataclass(frozen=True, slots=True, kw_only=True)
class AdvancedInstallment:
    """Uma parcela adiantada logo depois da compra. A primeira cai na fatura atual:
    zero meses de antecedência, paga cheia."""

    installment: Installment
    months_ahead: int
    paid: Decimal

    @property
    def discount(self) -> Decimal:
        return self.installment.amount - self.paid


@dataclass(frozen=True, slots=True, kw_only=True)
class CashOrAdvance:
    """`break_even_discount` em fração (0,05 é 5%): o desconto à vista que empata
    com parcelar e adiantar. `winner` é `INSTALLMENTS` quando parcelar e adiantar
    sai mais barato, e nulo no empate exato."""

    price: Decimal
    cash_price: Decimal
    installments: list[AdvancedInstallment]
    advanced_total: Decimal
    break_even_discount: Decimal
    winner: PaymentChoice | None

    @property
    def saved(self) -> Decimal:
        """O desconto do banco somado: o preço cheio menos o total adiantado."""
        return self.price - self.advanced_total

    @property
    def difference(self) -> Decimal:
        return abs(self.cash_price - self.advanced_total)


def cash_or_advance(
    *,
    price: Decimal,
    count: int,
    first_due: date,
    cash_discount: Decimal,
    monthly_rate: Decimal,
) -> CashOrAdvance:
    """O preço se divide em parcelas de centavos, como na compra, e cada parcela
    adiantada sai arredondada ao centavo, como o banco cobra. `cash_discount` em %,
    `monthly_rate` em % ao mês."""
    advanced = [
        AdvancedInstallment(
            installment=installment,
            months_ahead=months,
            paid=discounted(installment.amount, monthly_rate, months).quantize(
                CENT, rounding=ROUND_HALF_UP
            ),
        )
        for months, installment in enumerate(schedule(price, count, first_due))
    ]
    total = sum((item.paid for item in advanced), ZERO)
    cash_price = price * (ONE - cash_discount / HUNDRED)
    winner = None
    if cash_price != total:
        winner = (
            PaymentChoice.CASH if cash_price < total else PaymentChoice.INSTALLMENTS
        )
    return CashOrAdvance(
        price=price,
        cash_price=cash_price,
        installments=advanced,
        advanced_total=total,
        break_even_discount=ONE - total / price,
        winner=winner,
    )


def implied_rate(amount: Decimal, count: int, bank_total: Decimal) -> Decimal:
    """A taxa, em % ao mês, com que o banco chega a `bank_total`.

    `bank_total` é a soma que o banco pede hoje para adiantar de uma vez todas as
    parcelas que dá para adiantar, que são todas menos a da fatura atual. Cada
    parcela entra sem arredondar, então a soma cai continuamente com a taxa, e a
    taxa achada refaz o valor do banco bem abaixo do centavo. Fica entre zero (sem
    desconto, o valor é a soma das parcelas) e qualquer valor positivo."""
    face = amount * (count - 1)
    if count < 2:
        raise BankAmountError(
            "Só falta a parcela da fatura atual: não há o que adiantar."
        )
    if not ZERO < bank_total <= face:
        raise BankAmountError(
            "O valor do banco fica entre zero e a soma das parcelas que dá para adiantar."
        )

    def gap(rate: Decimal) -> Decimal:
        return bank_total - sum(
            (discounted(amount, rate, months) for months in range(1, count)), ZERO
        )

    rate = solve(gap, RATE_LOW, RATE_HIGH, tolerance=RATE_TOLERANCE)
    if rate is None:
        raise BankAmountError("Nenhuma taxa chega ao valor do banco.")
    return rate


@dataclass(frozen=True, slots=True, kw_only=True)
class AdvanceOrKeep:
    """Uma parcela que dá para adiantar, a `position` faturas da atual. `invested`
    é o que precisaria estar aplicado hoje para virar a parcela, líquida de IR e
    IOF, no último dia útil até o vencimento, `days` dias corridos depois."""

    position: int
    installment: Installment
    paid_today: Decimal
    invested: Decimal
    days: int
    chosen: bool

    @property
    def discount(self) -> Decimal:
        return self.installment.amount - self.paid_today

    @property
    def earnings(self) -> Decimal:
        """O rendimento líquido de deixar o dinheiro aplicado até o vencimento."""
        return self.installment.amount - self.invested

    @property
    def advance_wins(self) -> bool:
        return self.discount > self.earnings

    @property
    def earnings_rate(self) -> Decimal:
        """O rendimento líquido em % ao mês corrido, de hoje até o resgate."""
        if self.days == 0:
            return ZERO
        growth = self.installment.amount / self.invested
        return (growth ** (MONTH_DAYS / self.days) - ONE) * HUNDRED


@dataclass(frozen=True, slots=True, kw_only=True)
class AdvancePlan:
    """`monthly_rate` em % ao mês: a informada, ou a achada pelo valor do banco. Os
    totais somam só as parcelas escolhidas."""

    current: Installment
    monthly_rate: Decimal
    installments: list[AdvanceOrKeep]

    @property
    def chosen(self) -> list[AdvanceOrKeep]:
        return [item for item in self.installments if item.chosen]

    @property
    def face(self) -> Decimal:
        return sum((item.installment.amount for item in self.chosen), ZERO)

    @property
    def paid_today(self) -> Decimal:
        return sum((item.paid_today for item in self.chosen), ZERO)

    @property
    def discount(self) -> Decimal:
        return sum((item.discount for item in self.chosen), ZERO)

    @property
    def earnings(self) -> Decimal:
        return sum((item.earnings for item in self.chosen), ZERO)

    @property
    def difference(self) -> Decimal:
        """O desconto menos o rendimento: positivo a favor de adiantar."""
        return self.discount - self.earnings

    @property
    def recommended(self) -> int:
        return sum(1 for item in self.installments if item.advance_wins)

    @property
    def earnings_rates(self) -> tuple[Decimal, Decimal] | None:
        """O menor e o maior rendimento em % ao mês entre as parcelas, nulo sem
        parcela para adiantar."""
        rates = [item.earnings_rate for item in self.installments]
        return (min(rates), max(rates)) if rates else None


def advance_or_keep(
    *,
    amount: Decimal,
    count: int,
    next_due: date,
    start: date,
    monthly_rate: Decimal,
    terms: FixedIncomeTerms,
    rates: Rates,
    chosen: Collection[int] | None,
) -> AdvancePlan:
    """`count` parcelas de `amount`, a primeira na fatura atual, vencendo em
    `next_due`; o dinheiro é aplicado em `start`. `chosen` traz as posições
    adiantadas (1 é a parcela seguinte à da fatura atual); sem escolha, adianta-se
    toda parcela em que o desconto vence o rendimento. `rates` já cobre até o último
    vencimento, com a projeção depois do dado real."""
    business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    dues = [add_months(next_due, months) for months in range(count)]
    application = Application(
        terms, start, rates, max(start, business.on_or_before(dues[-1]))
    )

    installments: list[AdvanceOrKeep] = []
    for position, due in enumerate(dues[1:], start=1):
        day = max(start, business.on_or_before(due))
        invested = application.gross_for_net(amount, day) / application.factor(day)
        item = AdvanceOrKeep(
            position=position,
            installment=Installment(due_date=due, amount=amount),
            paid_today=discounted(amount, monthly_rate, position),
            invested=invested,
            days=(day - start).days,
            chosen=False,
        )
        picked = item.advance_wins if chosen is None else position in chosen
        installments.append(replace(item, chosen=picked))
    return AdvancePlan(
        current=Installment(due_date=dues[0], amount=amount),
        monthly_rate=monthly_rate,
        installments=installments,
    )
