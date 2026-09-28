from __future__ import annotations

from decimal import Decimal

from backend.domain.rebalance import Item, distribute, imbalance, to_order


def _items(
    values: list[str], targets: list[str], floors: list[str] | None = None
) -> list[Item]:
    return [
        Item(
            value=Decimal(value),
            target=Decimal(target),
            floor=Decimal(floor),
        )
        for value, target, floor in zip(values, targets, floors or values, strict=True)
    ]


def test_contribution_fills_the_items_furthest_below_target() -> None:
    """Meta 40/30/30 com o item A acima dela: os R$ 300 vão todos para B e C, na
    divisão que empata os dois, e A não recebe nada."""
    result = distribute(
        _items(["600", "200", "200"], ["0.4", "0.3", "0.3"]), Decimal(300)
    )

    assert result == [Decimal(600), Decimal(350), Decimal(350)]


def test_equal_split_beats_other_splits_with_the_same_sum_of_deviations() -> None:
    """As divisões 110/190 e 150/150 empatam na soma dos desvios, mas a raiz da soma
    dos quadrados prefere a de 150/150, que é a que o cálculo acha."""

    def spread(b: int, c: int) -> Decimal:
        total = Decimal(1300)
        return imbalance(
            [
                Decimal(600) / total - Decimal("0.4"),
                Decimal(200 + b) / total - Decimal("0.3"),
                Decimal(200 + c) / total - Decimal("0.3"),
            ]
        )

    assert spread(150, 150) < spread(110, 190)


def test_contribution_covering_every_deficit_reaches_the_target() -> None:
    """O aporte que cobre o que falta em cada item leva a subcarteira à meta."""
    result = distribute(
        _items(["400", "300", "300"], ["0.4", "0.3", "0.3"]), Decimal(1000)
    )

    assert result == [Decimal(800), Decimal(600), Decimal(600)]


def test_without_sales_no_item_goes_below_its_value() -> None:
    """Só com aporte, nenhum item vende: o que passou da meta fica como está."""
    items = _items(["900", "50", "50"], ["0.2", "0.4", "0.4"])

    result = distribute(items, Decimal(100))

    assert all(final >= item.value for final, item in zip(result, items, strict=True))
    assert sum(result) == Decimal(1100)


def test_sales_stop_at_the_part_that_only_matures() -> None:
    """Com venda, o item desce até o piso: a renda fixa que só vira dinheiro no
    vencimento fica, e o resto se aproxima da meta."""
    items = _items(["800", "200"], ["0.5", "0.5"], floors=["700", "0"])

    assert distribute(items, Decimal(0)) == [Decimal(700), Decimal(300)]


def test_orders_round_to_whole_shares_moving_less() -> None:
    """Compra e venda em cotas inteiras, arredondadas para mexer menos; sem preço,
    o valor fica inteiro."""
    assert to_order(Decimal(250), Decimal(30)).quantity == Decimal(8)
    assert to_order(Decimal(250), Decimal(30)).amount == Decimal(240)
    assert to_order(Decimal(-250), Decimal(30)).amount == Decimal(-240)
    assert to_order(Decimal(250), None).amount == Decimal(250)


def test_imbalance_is_the_root_of_summed_squares() -> None:
    """Meta 40/30/30: 45/28/27 dá 6,16 p.p. e 45/25/30 dá 7,07 p.p., sem empate."""
    x = imbalance([Decimal("0.05"), Decimal("-0.02"), Decimal("-0.03")])
    y = imbalance([Decimal("0.05"), Decimal("-0.05"), Decimal(0)])

    assert round(x * 100, 2) == Decimal("6.16")
    assert round(y * 100, 2) == Decimal("7.07")
