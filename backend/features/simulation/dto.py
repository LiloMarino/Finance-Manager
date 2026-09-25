"""As ferramentas de simulação: taxas em % no formato do indexador (110 é 110% do
CDI), e retorno, alíquota e desconto de empate em fração (0,1 é 10%)."""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Self

from pydantic import field_validator, model_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import FixedIncomeType, Indexer, InstallmentMode, PaymentChoice
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


class InstallmentsInDTO(BaseDTO):
    """`amount` segue o `mode`: o preço na compra, a parcela no adiantamento.
    `cash_discount` em %, opcional: sem ele, sai só o desconto de empate."""

    mode: InstallmentMode
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
        if not 1 <= value <= MAX_INSTALLMENTS:
            raise ValueError(f"O número de parcelas vai de 1 a {MAX_INSTALLMENTS}.")
        return value

    @field_validator("cash_discount")
    @classmethod
    def _discount_range(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and not 0 <= value < 100:
            raise ValueError("O desconto vai de 0% a menos de 100%.")
        return value

    @model_validator(mode="after")
    def _due_after_start(self) -> Self:
        if self.first_due_date <= self.start_date:
            raise ValueError("A primeira parcela vence depois do dia da decisão.")
        return self


class WithdrawalDTO(BaseDTO):
    due_date: date
    withdrawn_on: date
    amount: DecimalStr
    gross: DecimalStr
    iof: DecimalStr
    income_tax: DecimalStr


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
