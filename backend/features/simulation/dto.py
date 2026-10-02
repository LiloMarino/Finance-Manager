"""As ferramentas de simulação: taxas em % no formato do indexador (110 é 110% do
CDI), a taxa do banco para adiantar em % ao mês, e retorno, alíquota e desconto de
empate em fração (0,1 é 10%)."""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Annotated, Literal, Self

from pydantic import Field, field_validator, model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import FixedIncomeType, Indexer, PaymentChoice
from backend.domain.fixed_income import terms_problem

# O limite de prazo mantém a conta dia a dia em tempo de resposta
MAX_TERM_YEARS = 40
MAX_INSTALLMENTS = 60


class CurrentRatesDTO(BaseDTO):
    """O último valor real de cada série, em % ao ano: o CDI e a Selic do último
    dia, anualizados, e o IPCA dos últimos 12 meses. Nulo sem dado no cache."""

    cdi: DecimalStr | None
    cdi_date: date | None
    selic: DecimalStr | None
    selic_date: date | None
    ipca: DecimalStr | None
    ipca_date: date | None


class ProjectionInDTO(BaseDTO):
    """As taxas ao ano, em %, que valem depois do último dado real de cada série."""

    cdi: DecimalStrIn
    selic: DecimalStrIn
    ipca: DecimalStrIn


class InvestmentInDTO(BaseDTO):
    product_type: FixedIncomeType
    indexer: Indexer
    rate: DecimalStrIn

    @model_validator(mode="after")
    def _terms_match(self) -> Self:
        problem = terms_problem(self.product_type, self.indexer, self.rate)
        if problem is not None:
            raise ValueError(problem)
        return self


def _positive(value: Decimal) -> Decimal:
    if value <= 0:
        raise ValueError("O valor deve ser maior que zero.")
    return value


class ComparisonOptionInDTO(InvestmentInDTO):
    label: str
    amount: DecimalStrIn
    application_date: date
    redemption_date: date

    @field_validator("amount")
    @classmethod
    def _positive_amount(cls, value: Decimal) -> Decimal:
        return _positive(value)

    @model_validator(mode="after")
    def _redemption_after_application(self) -> Self:
        if self.redemption_date <= self.application_date:
            raise ValueError("O resgate vem depois da aplicação.")
        if self.redemption_date.year - self.application_date.year > MAX_TERM_YEARS:
            raise ValueError(f"O prazo vai até {MAX_TERM_YEARS} anos.")
        return self


class ComparisonInDTO(BaseDTO):
    options: list[ComparisonOptionInDTO]
    projection: ProjectionInDTO


class ComparisonResultDTO(BaseDTO):
    """`income_tax_rate` nulo no título isento. `cdi_equivalent` em % do CDI: o de
    um CDB tributado, nas mesmas datas, que entrega o mesmo líquido."""

    label: str
    calendar_days: int
    business_days: int
    gross_value: DecimalStr
    iof: DecimalStr
    income_tax: DecimalStr
    net_value: DecimalStr
    net_gain: DecimalStr
    income_tax_rate: DecimalStr | None
    iof_rate: DecimalStr
    net_annual_return: DecimalStr | None
    cdi_equivalent: DecimalStr | None


class ComparisonPointDTO(BaseDTO):
    """O líquido de cada opção, na ordem das opções: nulo antes da aplicação."""

    day: date
    net_values: list[DecimalStr | None]


class ComparisonDTO(BaseDTO):
    """`best` é a posição da opção de maior líquido."""

    results: list[ComparisonResultDTO]
    best: int | None
    points: list[ComparisonPointDTO]


def _installments_count(value: int) -> int:
    if not 1 <= value <= MAX_INSTALLMENTS:
        raise ValueError(f"O número de parcelas vai de 1 a {MAX_INSTALLMENTS}.")
    return value


def _cash_discount(value: Decimal) -> Decimal:
    if not 0 <= value < 100:
        raise ValueError("O desconto vai de 0% a menos de 100%.")
    return value


def _monthly_rate(value: Decimal) -> Decimal:
    if value < 0:
        raise ValueError("A taxa do banco não pode ser negativa.")
    return value


class InstallmentsInDTO(BaseDTO):
    """`amount` é o preço. `cash_discount` em %, opcional: sem ele, sai só o
    desconto de empate."""

    amount: DecimalStrIn
    installments: int
    start_date: date
    first_due_date: date
    cash_discount: DecimalStrIn | None = None
    investment: InvestmentInDTO
    projection: ProjectionInDTO

    @field_validator("amount")
    @classmethod
    def _positive_amount(cls, value: Decimal) -> Decimal:
        return _positive(value)

    @field_validator("installments")
    @classmethod
    def _installments_range(cls, value: int) -> int:
        return _installments_count(value)

    @field_validator("cash_discount")
    @classmethod
    def _discount_range(cls, value: Decimal | None) -> Decimal | None:
        return _cash_discount(value) if value is not None else None

    @model_validator(mode="after")
    def _due_after_start(self) -> Self:
        if self.first_due_date <= self.start_date:
            raise ValueError("A primeira parcela vence depois do dia da decisão.")
        return self


class WithdrawalDTO(BaseDTO):
    """`remaining` é o líquido do que fica aplicado logo depois da parcela."""

    due_date: date
    withdrawn_on: date
    amount: DecimalStr
    gross: DecimalStr
    iof: DecimalStr
    income_tax: DecimalStr
    remaining: DecimalStr


class BreakEvenRateDTO(BaseDTO):
    """A taxa no formato do indexador; nula quando nenhuma empata."""

    product_type: FixedIncomeType
    indexer: Indexer
    rate: DecimalStr | None


class BalancePointDTO(BaseDTO):
    day: date
    installments: DecimalStr
    cash: DecimalStr | None


class CurvePointDTO(BaseDTO):
    installments: int
    break_even_discount: DecimalStr


class InstallmentsDTO(BaseDTO):
    """As sobras são o que cada caminho deixa no último vencimento, líquido.
    `difference` é a sobra do vencedor menos a do outro."""

    total: DecimalStr
    cash_price: DecimalStr | None
    withdrawals: list[WithdrawalDTO]
    installments_leftover: DecimalStr
    cash_leftover: DecimalStr | None
    winner: PaymentChoice | None
    difference: DecimalStr | None
    break_even_discount: DecimalStr
    break_even_rates: list[BreakEvenRateDTO] | None
    balance: list[BalancePointDTO]
    curve: list[CurvePointDTO]


class CashOrAdvanceInDTO(BaseDTO):
    """Parcelar `price` em `installments` vezes e adiantar logo em seguida tudo o
    que dá, contra pagar à vista. `cash_discount` em %; `monthly_rate`, o desconto do
    banco para adiantar, em % ao mês por fatura de antecedência. A primeira parcela
    vence em `first_due_date`, na fatura atual, e é paga cheia."""

    price: DecimalStrIn
    installments: int
    first_due_date: date
    cash_discount: DecimalStrIn
    monthly_rate: DecimalStrIn

    @field_validator("price")
    @classmethod
    def _positive_price(cls, value: Decimal) -> Decimal:
        return _positive(value)

    @field_validator("installments")
    @classmethod
    def _installments_range(cls, value: int) -> int:
        return _installments_count(value)

    @field_validator("cash_discount")
    @classmethod
    def _discount_range(cls, value: Decimal) -> Decimal:
        return _cash_discount(value)

    @field_validator("monthly_rate")
    @classmethod
    def _rate_range(cls, value: Decimal) -> Decimal:
        return _monthly_rate(value)


class AdvancedInstallmentDTO(BaseDTO):
    """`months_ahead` zero é a parcela da fatura atual, paga cheia. `paid` é o que
    o banco cobra ao adiantar, em centavos."""

    due_date: date
    amount: DecimalStr
    months_ahead: int
    paid: DecimalStr
    discount: DecimalStr


class CashOrAdvanceDTO(BaseDTO):
    """`advanced_total` é o que sai parcelando e adiantando; `saved`, o preço cheio
    menos ele. `break_even_discount` em fração: com desconto à vista acima dele, o à
    vista vence. `winner` `installments` é parcelar e adiantar, nulo no empate; e
    `difference` é o quanto o vencedor sai mais barato."""

    price: DecimalStr
    cash_price: DecimalStr
    advanced_total: DecimalStr
    saved: DecimalStr
    break_even_discount: DecimalStr
    winner: PaymentChoice | None
    difference: DecimalStr
    installments: list[AdvancedInstallmentDTO]


class BankRateInDTO(BaseDTO):
    """O desconto do banco pela taxa, em % ao mês por fatura de antecedência."""

    kind: Literal["rate"]
    monthly_rate: DecimalStrIn

    @field_validator("monthly_rate")
    @classmethod
    def _rate_range(cls, value: Decimal) -> Decimal:
        return _monthly_rate(value)


class BankTotalInDTO(BaseDTO):
    """O desconto do banco pelo valor: a soma que o banco pede hoje para adiantar de
    uma vez todas as parcelas menos a da fatura atual. A taxa sai dele."""

    kind: Literal["total"]
    bank_total: DecimalStrIn

    @field_validator("bank_total")
    @classmethod
    def _positive_total(cls, value: Decimal) -> Decimal:
        return _positive(value)


class AdvanceInDTO(BaseDTO):
    """`installments` parcelas de `amount` que faltam, a primeira na fatura atual,
    vencendo em `next_due_date`, sem desconto. `chosen` traz as posições adiantadas
    (1 é a parcela seguinte à da fatura atual); sem ele, as posições em que o
    desconto vence o rendimento."""

    amount: DecimalStrIn
    installments: int
    start_date: date
    next_due_date: date
    bank_discount: Annotated[
        BankRateInDTO | BankTotalInDTO, Field(discriminator="kind")
    ]
    chosen: list[int] | None = None
    investment: InvestmentInDTO
    projection: ProjectionInDTO

    @field_validator("amount")
    @classmethod
    def _positive_amount(cls, value: Decimal) -> Decimal:
        return _positive(value)

    @field_validator("installments")
    @classmethod
    def _installments_range(cls, value: int) -> int:
        return _installments_count(value)

    @model_validator(mode="after")
    def _consistent(self) -> Self:
        if self.next_due_date < self.start_date:
            raise ValueError("A próxima parcela vence hoje ou depois.")
        if self.chosen is not None:
            if len(set(self.chosen)) != len(self.chosen):
                raise ValueError("Cada parcela escolhida aparece uma vez só.")
            if any(not 1 <= position < self.installments for position in self.chosen):
                raise ValueError(
                    "As parcelas escolhidas vão da seguinte à da fatura atual à última."
                )
        return self


class AdvanceOrKeepDTO(BaseDTO):
    """Uma parcela que dá para adiantar, `position` faturas depois da atual.
    `earnings` é o rendimento líquido de IR e IOF de deixar o dinheiro aplicado até o
    vencimento; `advance_wins` quando o desconto passa dele."""

    position: int
    due_date: date
    amount: DecimalStr
    paid_today: DecimalStr
    discount: DecimalStr
    earnings: DecimalStr
    advance_wins: bool
    chosen: bool


class AdvanceDTO(BaseDTO):
    """`monthly_rate` em % ao mês: a informada, ou a achada pelo valor do banco.
    Os totais somam só as parcelas escolhidas, e `difference` é o desconto menos o
    rendimento, positivo a favor de adiantar. `recommended` conta as parcelas em
    que o desconto vence. `earnings_rate_low` e `earnings_rate_high`, em % ao mês,
    são o menor e o maior rendimento líquido por fatura de antecedência, nulos sem
    parcela para adiantar."""

    current_due_date: date
    current_amount: DecimalStr
    monthly_rate: DecimalStr
    installments: list[AdvanceOrKeepDTO]
    chosen_count: int
    face: DecimalStr
    paid_today: DecimalStr
    discount: DecimalStr
    earnings: DecimalStr
    difference: DecimalStr
    recommended: int
    earnings_rate_low: DecimalStr | None
    earnings_rate_high: DecimalStr | None
