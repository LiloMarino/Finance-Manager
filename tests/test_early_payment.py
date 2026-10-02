from __future__ import annotations

from collections.abc import Collection
from datetime import date, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from backend.core.enum import FixedIncomeType, Indexer, IndexSeries, PaymentChoice
from backend.domain.business_days import BusinessCalendar
from backend.domain.early_payment import (
    AdvancePlan,
    BankAmountError,
    advance_or_keep,
    cash_or_advance,
    implied_rate,
)
from backend.domain.fixed_income import FixedIncomeTerms, tax_rate
from backend.domain.projection import Assumptions, project

START = date(2027, 1, 4)
NEXT_DUE = date(2027, 1, 20)
CENT = Decimal("0.01")
RATES = project(
    {},
    Assumptions(cdi=Decimal(14), selic=Decimal(14), ipca=Decimal(4)),
    START,
    date(2030, 1, 1),
)


def _terms(product_type: FixedIncomeType = FixedIncomeType.CDB) -> FixedIncomeTerms:
    return FixedIncomeTerms(
        product_type=product_type,
        indexer=Indexer.CDI,
        rate=Decimal(100),
        maturity_date=None,
    )


def _plan(
    *,
    amount: str = "200",
    count: int = 12,
    rate: Decimal = Decimal("1.6"),
    terms: FixedIncomeTerms | None = None,
    chosen: Collection[int] | None = None,
) -> AdvancePlan:
    return advance_or_keep(
        amount=Decimal(amount),
        count=count,
        next_due=NEXT_DUE,
        start=START,
        monthly_rate=rate,
        terms=terms or _terms(),
        rates=RATES,
        chosen=chosen,
    )


def test_cash_or_advance_small_example() -> None:
    """R$ 300 em 3x com o banco a 1% ao mês: a 1ª sai cheia, a 2ª por 100 / 1,01 =
    99,01 e a 3ª por 100 / 1,0201 = 98,03, total 297,04. À vista com 1% sai 297,00:
    o à vista vence por 4 centavos, e o desconto que empata é 1 - 297,04 / 300."""
    comparison = cash_or_advance(
        price=Decimal(300),
        count=3,
        first_due=date(2027, 2, 10),
        cash_discount=Decimal(1),
        monthly_rate=Decimal(1),
    )

    assert [item.paid for item in comparison.installments] == [
        Decimal("100.00"),
        Decimal("99.01"),
        Decimal("98.03"),
    ]
    assert comparison.advanced_total == Decimal("297.04")
    assert comparison.saved == Decimal("2.96")
    assert comparison.cash_price == Decimal(297)
    assert comparison.winner is PaymentChoice.CASH
    assert comparison.difference == Decimal("0.04")
    assert comparison.break_even_discount == 1 - Decimal("297.04") / 300


def test_break_even_discount_closes_with_the_advanced_total() -> None:
    """R$ 2.400 em 12x com o banco a 1,6% ao mês: adiantando, sai R$ 2.202,67. O
    desconto que empata é 1 - total / preço; um pouco acima dele o à vista vence, um
    pouco abaixo, parcelar e adiantar."""

    def compare(discount: Decimal) -> PaymentChoice | None:
        return cash_or_advance(
            price=Decimal(2400),
            count=12,
            first_due=date(2027, 2, 10),
            cash_discount=discount,
            monthly_rate=Decimal("1.6"),
        ).winner

    comparison = cash_or_advance(
        price=Decimal(2400),
        count=12,
        first_due=date(2027, 2, 10),
        cash_discount=Decimal(5),
        monthly_rate=Decimal("1.6"),
    )

    assert comparison.advanced_total == Decimal("2202.67")
    assert comparison.break_even_discount == 1 - comparison.advanced_total / 2400
    assert comparison.winner is PaymentChoice.INSTALLMENTS
    break_even = comparison.break_even_discount * 100
    assert compare(break_even + Decimal("0.001")) is PaymentChoice.CASH
    assert compare(break_even - Decimal("0.001")) is PaymentChoice.INSTALLMENTS


def test_without_bank_discount_advancing_costs_the_full_price() -> None:
    """Com o banco a 0% ao mês, adiantar não desconta nada: o total é o preço cheio
    e o desconto que empata é zero."""
    comparison = cash_or_advance(
        price=Decimal(2400),
        count=12,
        first_due=date(2027, 2, 10),
        cash_discount=Decimal(5),
        monthly_rate=Decimal(0),
    )

    assert comparison.advanced_total == Decimal(2400)
    assert comparison.break_even_discount == 0
    assert comparison.winner is PaymentChoice.CASH


def test_first_installment_is_never_discounted_and_cents_add_up() -> None:
    """R$ 1.000 em 3x: 333,34 + 333,33 + 333,33 somam o preço. A 1ª, da fatura
    atual, sai cheia com qualquer taxa; as outras, com 1 e 2 meses de antecedência."""
    comparison = cash_or_advance(
        price=Decimal(1000),
        count=3,
        first_due=date(2027, 2, 10),
        cash_discount=Decimal(5),
        monthly_rate=Decimal(30),
    )

    amounts = [item.installment.amount for item in comparison.installments]
    assert amounts == [Decimal("333.34"), Decimal("333.33"), Decimal("333.33")]
    assert sum(amounts) == Decimal(1000)
    assert [item.months_ahead for item in comparison.installments] == [0, 1, 2]
    first = comparison.installments[0]
    assert first.discount == 0
    assert first.paid == first.installment.amount


def test_bank_total_matches_the_discount_shown() -> None:
    """Duas parcelas de R$ 100 que dá para adiantar e o banco pede R$ 197,04 por
    elas: a taxa achada fecha o total pago em 197,04 e o desconto em 2,96, que é o
    que o app do banco mostra."""
    rate = implied_rate(Decimal(100), 3, Decimal("197.04"))

    plan = _plan(amount="100", count=3, rate=rate, chosen=[1, 2])

    assert Decimal("0.99") < rate < Decimal(1)
    assert plan.paid_today.quantize(CENT) == Decimal("197.04")
    assert plan.discount.quantize(CENT) == Decimal("2.96")


def test_implied_rate_round_trips_with_the_rate_mode() -> None:
    """O valor que o banco pediria a 1,6% ao mês devolve a taxa de 1,6%, e refazer a
    conta com a taxa achada devolve o mesmo valor."""
    every = range(1, 12)
    bank_total = _plan(chosen=every).paid_today

    rate = implied_rate(Decimal(200), 12, bank_total)

    assert abs(rate - Decimal("1.6")) < Decimal("1e-9")
    assert abs(_plan(rate=rate, chosen=every).paid_today - bank_total) < Decimal("1e-6")


def test_bank_total_without_discount_means_zero_rate() -> None:
    """O banco pedindo a soma cheia das parcelas é taxa zero."""
    assert implied_rate(Decimal(200), 12, Decimal(2200)) == 0


@pytest.mark.parametrize("bank_total", ["0", "2200.01"])
def test_impossible_bank_total_is_rejected(bank_total: str) -> None:
    """O valor do banco fica acima de zero e no máximo na soma das parcelas."""
    with pytest.raises(BankAmountError):
        implied_rate(Decimal(200), 12, Decimal(bank_total))


def test_earnings_follow_the_regressive_income_tax() -> None:
    """O rendimento de cada parcela é o de um CDB de 100% do CDI aplicado hoje até o
    último dia útil antes do vencimento, com o IR do prazo. Ele cresce com o prazo,
    e o rendimento ao mês sobe ao passar de 180, 360 e 720 dias, quando o IR cai de
    faixa."""
    plan = _plan(count=30)
    business = BusinessCalendar(RATES[IndexSeries.CDI])
    daily = Decimal("1.14") ** (Decimal(1) / 252)

    def invested(due: date) -> Decimal:
        day = business.on_or_before(due)
        factor = Decimal(1)
        cursor = START
        while cursor < day:
            if business.is_business_day(cursor):
                factor *= daily
            cursor += timedelta(days=1)
        net = 1 + (factor - 1) * (1 - tax_rate((day - START).days))
        return Decimal(200) / net

    for item in plan.installments:
        assert abs(item.invested - invested(item.installment.due_date)) < CENT / 100
    earnings = [item.earnings for item in plan.installments]
    assert earnings == sorted(earnings)
    for limit in (180, 360, 720):
        before = max(
            (item for item in plan.installments if item.days <= limit),
            key=lambda item: item.days,
        )
        after = min(
            (item for item in plan.installments if item.days > limit),
            key=lambda item: item.days,
        )
        assert tax_rate(after.days) < tax_rate(before.days)
        assert after.earnings_rate > before.earnings_rate


def test_chosen_installments_drive_the_totals() -> None:
    """Escolhendo a 2ª e a 5ª parcelas seguintes, os totais são exatamente a soma
    das duas; sem escolha, ficam as em que o desconto vence o rendimento."""
    plan = _plan(chosen=[2, 5])
    picked = [item for item in plan.installments if item.position in (2, 5)]

    assert [item.position for item in plan.chosen] == [2, 5]
    assert plan.face == Decimal(400)
    assert plan.paid_today == sum(item.paid_today for item in picked)
    assert plan.discount == sum(item.discount for item in picked)
    assert plan.earnings == sum(item.earnings for item in picked)
    assert plan.difference == plan.discount - plan.earnings
    default = _plan()
    assert [item.chosen for item in default.installments] == [
        item.advance_wins for item in default.installments
    ]


def test_tax_exempt_investment_earns_more() -> None:
    """Uma LCA de 100% do CDI, isenta de IR, rende mais líquido que um CDB igual em
    toda parcela."""
    cdb = _plan()
    lca = _plan(terms=_terms(FixedIncomeType.LCA))

    for taxed, exempt in zip(cdb.installments, lca.installments, strict=True):
        assert exempt.earnings > taxed.earnings


def test_current_invoice_installment_is_left_out() -> None:
    """A parcela da fatura atual não entra na lista: as 11 seguintes vencem mês a
    mês, a primeira a uma fatura de distância."""
    plan = _plan()

    assert plan.current.due_date == NEXT_DUE
    assert [item.position for item in plan.installments] == list(range(1, 12))
    assert plan.installments[0].installment.due_date == date(2027, 2, 20)


def _advance_payload(**changes: object) -> dict[str, object]:
    return {
        "amount": "200",
        "installments": 12,
        "start_date": "2027-01-04",
        "next_due_date": "2027-01-20",
        "bank_discount": {"kind": "rate", "monthly_rate": "1.6"},
        "investment": {"product_type": "cdb", "indexer": "cdi", "rate": "100"},
        "projection": {"cdi": "14", "selic": "14", "ipca": "4"},
        **changes,
    }


def _cash_payload(**changes: object) -> dict[str, object]:
    return {
        "price": "2400",
        "installments": 12,
        "first_due_date": "2027-02-10",
        "cash_discount": "5",
        "monthly_rate": "1.6",
        **changes,
    }


def test_cash_or_advance_endpoint(api: TestClient) -> None:
    """A API devolve o total adiantado, o vencedor e uma linha por parcela."""
    response = api.post("/api/simulation/cash-or-advance", json=_cash_payload())

    assert response.status_code == 200
    body = response.json()
    assert Decimal(body["advanced_total"]) == Decimal("2202.67")
    assert body["winner"] == "installments"
    assert len(body["installments"]) == 12


def test_advance_endpoint_with_bank_total(api: TestClient) -> None:
    """Pelo valor do banco, a API devolve a taxa achada e os totais das parcelas
    escolhidas."""
    response = api.post(
        "/api/simulation/advance",
        json=_advance_payload(
            bank_discount={"kind": "total", "bank_total": "2000"},
            chosen=list(range(1, 12)),
        ),
    )

    assert response.status_code == 200
    body = response.json()
    assert Decimal(body["paid_today"]).quantize(CENT) == Decimal(2000)
    assert Decimal(body["discount"]).quantize(CENT) == Decimal(200)
    assert body["chosen_count"] == 11
    assert len(body["installments"]) == 11


@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"installments": 0}, "parcelas"),
        ({"installments": 61}, "parcelas"),
        ({"bank_discount": {"kind": "rate", "monthly_rate": "-1"}}, "negativa"),
        ({"bank_discount": {"kind": "total", "bank_total": "0"}}, "maior que zero"),
        ({"bank_discount": {"kind": "total", "bank_total": "2200.01"}}, "banco"),
        (
            {"installments": 1, "bank_discount": {"kind": "total", "bank_total": "1"}},
            "fatura atual",
        ),
        ({"chosen": [0]}, "escolhidas"),
        ({"chosen": [12]}, "escolhidas"),
        ({"chosen": [3, 3]}, "uma vez"),
        ({"next_due_date": "2027-01-03"}, "próxima parcela"),
    ],
)
def test_advance_rejects_invalid_input(
    api: TestClient, changes: dict[str, object], message: str
) -> None:
    """Parcelas fora de 1 a 60, taxa negativa, valor do banco impossível e
    escolha fora das parcelas são recusados com o motivo."""
    response = api.post("/api/simulation/advance", json=_advance_payload(**changes))

    assert response.status_code == 422
    assert message in response.json()["detail"]


@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"installments": 0}, "parcelas"),
        ({"installments": 61}, "parcelas"),
        ({"monthly_rate": "-0.5"}, "negativa"),
        ({"cash_discount": "100"}, "desconto"),
        ({"price": "0"}, "maior que zero"),
    ],
)
def test_cash_or_advance_rejects_invalid_input(
    api: TestClient, changes: dict[str, object], message: str
) -> None:
    """Parcelas fora de 1 a 60, taxa negativa, desconto de 100% e preço zero são
    recusados com o motivo."""
    response = api.post(
        "/api/simulation/cash-or-advance", json=_cash_payload(**changes)
    )

    assert response.status_code == 422
    assert message in response.json()["detail"]
