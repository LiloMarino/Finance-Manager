"""Rebalanceamento: o desvio de cada item contra a meta e a divisão de um aporte.

A divisão é uma só conta para os dois modos. Cada item termina em
`max(piso, meta * (P + A) - L)`, onde P é o patrimônio de hoje, A o aporte e L o
nível que faz os itens somarem P + A. Subir L tira dinheiro de todos os itens acima
do piso por igual, em reais: é o "enche primeiro o mais abaixo da meta até empatar
com o segundo". Só com aporte, o piso é o valor de hoje e nada é vendido; com venda,
o piso é a parte que só vira dinheiro no vencimento.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from decimal import ROUND_DOWN, Decimal

ZERO = Decimal(0)


@dataclass(frozen=True, slots=True, kw_only=True)
class Item:
    """`target` é a fração da meta; `floor` é o valor abaixo do qual o item não
    desce."""

    value: Decimal
    target: Decimal
    floor: Decimal


def imbalance(deviations: Iterable[Decimal]) -> Decimal:
    """A raiz da soma dos quadrados dos desvios, na mesma unidade deles."""
    return sum((deviation * deviation for deviation in deviations), ZERO).sqrt()


def distribute(items: Sequence[Item], amount: Decimal) -> list[Decimal]:
    """O valor de cada item depois de pôr `amount` na subcarteira, o mais perto
    possível da meta sem descer de nenhum piso. A soma dos pisos não passa do
    patrimônio de hoje, então sempre existe a divisão."""
    total = sum((item.value for item in items), ZERO) + amount
    goals = [item.target * total for item in items]
    # O nível em que cada item encosta no piso, do mais alto para o mais baixo
    order = sorted(
        range(len(items)),
        key=lambda index: goals[index] - items[index].floor,
        reverse=True,
    )
    floors = sum((item.floor for item in items), ZERO)
    active_goals = ZERO
    level = ZERO
    for count, index in enumerate(order, start=1):
        active_goals += goals[index]
        floors -= items[index].floor
        level = (active_goals + floors - total) / count
        following = order[count] if count < len(order) else None
        breakpoint_next = (
            goals[following] - items[following].floor if following is not None else None
        )
        if breakpoint_next is None or level >= breakpoint_next:
            break
    return [
        max(item.floor, goal - level) for item, goal in zip(items, goals, strict=True)
    ]


@dataclass(frozen=True, slots=True, kw_only=True)
class Order:
    """A compra (positiva) ou a venda (negativa) de um item. `quantity` é o número
    inteiro de cotas, nulo quando o item não é negociado em cotas ou não tem
    cotação."""

    amount: Decimal
    quantity: Decimal | None


def to_order(move: Decimal, price: Decimal | None) -> Order:
    """A movimentação em cotas inteiras, arredondada na direção de mexer menos;
    sem preço, o valor fica como está."""
    if price is None or price <= 0:
        return Order(amount=move, quantity=None)
    shares = (abs(move) / price).to_integral_value(rounding=ROUND_DOWN)
    signed = shares if move >= 0 else -shares
    return Order(amount=signed * price, quantity=signed)
