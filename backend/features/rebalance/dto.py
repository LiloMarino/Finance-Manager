from __future__ import annotations

from decimal import Decimal
from typing import Annotated

from pydantic import AfterValidator, field_validator

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn
from backend.core.enum import PortfolioCategory


class RebalanceLineDTO(BaseDTO):
    """Um item da meta. `asset_id` nulo é a renda fixa da subcarteira ou o saldo.
    Frações de 0 a 1: `deviation` é o atual menos a meta (-0.03 é 3 p.p. abaixo),
    e `gap` é o que falta em reais para a meta, negativo quando sobra. Na carteira
    geral, a meta é a da subcarteira pesada pela fração dela, e o item fora de
    subcarteira vem sem meta."""

    asset_id: int | None
    label: str
    category: PortfolioCategory
    subportfolio_id: int | None
    subportfolio: str | None
    value: DecimalStr
    share: DecimalStr
    target: DecimalStr | None
    deviation: DecimalStr | None
    gap: DecimalStr | None
    breached: bool


class RebalanceDTO(BaseDTO):
    """A meta de uma subcarteira, ou a combinada da carteira geral. `imbalance` é a
    raiz da soma dos quadrados dos desvios, em fração; os limites e os furos só
    existem na subcarteira cujas metas somam 100% (`complete`)."""

    subportfolio_id: int | None
    total: DecimalStr
    targets_total: DecimalStr | None
    complete: bool
    imbalance: DecimalStr | None
    max_item_deviation: DecimalStr | None
    max_total_deviation: DecimalStr | None
    breached: bool
    lines: list[RebalanceLineDTO]


def _percent(value: Decimal) -> Decimal:
    if not 0 <= value <= 100:
        raise ValueError("O percentual vai de 0 a 100.")
    return value


PercentIn = Annotated[DecimalStrIn, AfterValidator(_percent)]


class AssetTargetDTO(BaseDTO):
    """A meta do ativo em percentual: 30 é 30% da subcarteira."""

    asset_id: int
    ticker: str
    target: DecimalStr


class TargetsDTO(BaseDTO):
    """As metas e os limites de uma subcarteira, em percentual e pontos percentuais,
    como o formulário os edita. Todo membro vem, com meta 0 quando não tem."""

    assets: list[AssetTargetDTO]
    fixed_income_target: DecimalStr
    max_item_deviation: DecimalStr
    max_total_deviation: DecimalStr


class AssetTargetInDTO(BaseDTO):
    asset_id: int
    target: PercentIn


class TargetsInDTO(BaseDTO):
    """As metas somam 100; os limites vão em pontos percentuais."""

    assets: list[AssetTargetInDTO]
    fixed_income_target: PercentIn
    max_item_deviation: PercentIn
    max_total_deviation: PercentIn


class PlanInDTO(BaseDTO):
    """O aporte a dividir. Com `allow_sales`, a divisão também vende o que passou da
    meta, menos a renda fixa que só vira dinheiro no vencimento."""

    subportfolio_id: int
    amount: DecimalStrIn
    allow_sales: bool = False

    @field_validator("amount")
    @classmethod
    def _non_negative(cls, value: Decimal) -> Decimal:
        if value < 0:
            raise ValueError("O aporte não pode ser negativo.")
        return value


class OrderDTO(BaseDTO):
    """Compra (positiva) ou venda (negativa) de um item. `quantity` é o número
    inteiro de cotas, nulo na renda fixa e no ativo sem cotação."""

    asset_id: int | None
    label: str
    category: PortfolioCategory
    amount: DecimalStr
    quantity: DecimalStr | None
    price: DecimalStr | None
    share_after: DecimalStr


class PlanDTO(BaseDTO):
    """A sugestão para o aporte. `leftover` é o que sobra do arredondamento em
    cotas, e fica no saldo; `sells_equity` avisa que alguma venda de renda variável
    pode gerar DARF."""

    orders: list[OrderDTO]
    leftover: DecimalStr
    imbalance_before: DecimalStr
    imbalance_after: DecimalStr
    sells_equity: bool
