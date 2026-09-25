from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient

from backend.core.enum import (
    FixedIncomeType,
    Indexer,
    IndexSeries,
    InstallmentMode,
    PaymentChoice,
)
from backend.domain.business_days import BusinessCalendar
from backend.domain.fixed_income import FixedIncomeTerms, tax_rate
from backend.domain.installments import Purchase, schedule, simulate
from backend.domain.projection import Assumptions, project

START = date(2027, 1, 4)
FIRST_DUE = date(2027, 2, 4)
CENT = Decimal("0.01")
RATES = project(
    {},
    Assumptions(cdi=Decimal(14), selic=Decimal(14), ipca=Decimal(4)),
    START,
    date(2032, 1, 1),
)
CDB = FixedIncomeTerms(
    product_type=FixedIncomeType.CDB,
    indexer=Indexer.CDI,
    rate=Decimal(100),
    maturity_date=None,
)


def _purchase(
    discount: str | None = "5",
    *,
    mode: InstallmentMode = InstallmentMode.PURCHASE,
    amount: str = "1000",
    installments: int = 10,
    first_due: date = FIRST_DUE,
) -> Purchase:
    return Purchase(
        mode=mode,
        amount=Decimal(amount),
        installments=installments,
        start=START,
        first_due=first_due,
        discount=Decimal(discount) if discount is not None else None,
    )


def test_purchase_splits_the_price_in_cents() -> None:
    """R$ 1.000 em 3x dá 333,34 na primeira e 333,33 nas outras, e o vencimento de dia
    31 cai no último dia dos meses mais curtos."""
    installments = schedule(
        InstallmentMode.PURCHASE, Decimal(1000), 3, date(2027, 1, 31)
    )

    assert [installment.amount for installment in installments] == [
        Decimal("333.34"),
        Decimal("333.33"),
        Decimal("333.33"),
    ]
    assert [installment.due_date for installment in installments] == [
        date(2027, 1, 31),
        date(2027, 2, 28),
        date(2027, 3, 31),
    ]


def test_example_leaves_about_fifty_two_reais() -> None:
    """O exemplo de referência: CDI de 14% a.a., R$ 1.000 em 10x e um CDB de 100% do
    CDI. Parcelando, sobram cerca de R$ 52, e o à vista compensa com desconto acima
    de uns 4,8%."""
    simulation = simulate(_purchase(), CDB, RATES)

    assert Decimal(52) < simulation.installments_leftover < Decimal(53)
    assert Decimal("0.047") < simulation.break_even_discount < Decimal("0.049")
    assert simulation.winner is PaymentChoice.CASH


def test_installments_match_one_title_per_installment() -> None:
    """Com a mesma taxa, resgatar as parcelas de uma aplicação só dá o mesmo que
    comprar um título por parcela no início, cada um com o IR do próprio prazo, e
    deixar o resto aplicado até o fim."""
    simulation = simulate(_purchase(), CDB, RATES)
    business = BusinessCalendar(RATES[IndexSeries.CDI])
    last = simulation.withdrawals[-1].withdrawn_on

    def net_growth(day: date) -> Decimal:
        factor = Decimal(1)
        cursor = START
        while cursor < day:
            if business.is_business_day(cursor):
                factor *= 1 + (Decimal("1.14") ** (Decimal(1) / 252) - 1)
            cursor = date.fromordinal(cursor.toordinal() + 1)
        return 1 + (factor - 1) * (1 - tax_rate((day - START).days))

    costs = [
        withdrawal.installment.amount / net_growth(withdrawal.withdrawn_on)
        for withdrawal in simulation.withdrawals
    ]
    expected = (Decimal(1000) - sum(costs, Decimal(0))) * net_growth(last)
    assert abs(simulation.installments_leftover - expected) < CENT


def test_break_even_discount_ties_both_paths() -> None:
    """No desconto de empate, o à vista termina com a mesma sobra do parcelado."""
    first = simulate(_purchase(), CDB, RATES)

    tied = simulate(_purchase(str(first.break_even_discount * 100)), CDB, RATES)

    assert tied.cash_leftover is not None
    assert abs(tied.cash_leftover - tied.installments_leftover) < CENT


def test_break_even_rates_tie_both_paths() -> None:
    """Cada taxa de empate, usada como investimento, deixa os dois caminhos iguais; a
    LCA isenta empata com uma taxa menor que a do CDB tributado."""
    simulation = simulate(_purchase(), CDB, RATES)

    assert simulation.break_even_rates is not None
    by_product = {
        (rate.product_type, rate.indexer): rate.rate
        for rate in simulation.break_even_rates
    }
    for (product_type, indexer), rate in by_product.items():
        assert rate is not None
        terms = FixedIncomeTerms(
            product_type=product_type, indexer=indexer, rate=rate, maturity_date=None
        )
        tied = simulate(_purchase(), terms, RATES)
        assert tied.cash_leftover is not None
        assert abs(tied.cash_leftover - tied.installments_leftover) < CENT
    cdb = by_product[(FixedIncomeType.CDB, Indexer.CDI)]
    lca = by_product[(FixedIncomeType.LCA, Indexer.CDI)]
    assert cdb is not None and lca is not None
    assert lca < cdb


def test_prepayment_matches_a_purchase_with_the_same_installments() -> None:
    """Adiantar 10 parcelas de R$ 100 é a mesma conta de uma compra de R$ 1.000 em
    10x."""
    purchase = simulate(_purchase(), CDB, RATES)

    prepayment = simulate(
        _purchase(mode=InstallmentMode.PREPAYMENT, amount="100"), CDB, RATES
    )

    assert prepayment.installments_leftover == purchase.installments_leftover
    assert prepayment.break_even_discount == purchase.break_even_discount


def test_iof_reaches_only_the_installment_due_within_thirty_days() -> None:
    """A parcela que vence 15 dias depois da aplicação paga IOF sobre o rendimento, e
    a do mês seguinte já não paga."""
    simulation = simulate(_purchase(first_due=date(2027, 1, 19)), CDB, RATES)

    first, second = simulation.withdrawals[:2]
    assert first.redemption.iof > 0
    assert second.redemption.iof == 0


def test_without_discount_only_the_break_even_is_computed() -> None:
    """Sem desconto informado, não há vencedor nem taxas de empate, e a curva de
    empate vai de 1 a 24 parcelas, crescendo com o número de parcelas."""
    simulation = simulate(_purchase(None), CDB, RATES)

    assert simulation.winner is None
    assert simulation.cash_leftover is None
    assert simulation.break_even_rates is None
    discounts = [point.break_even_discount for point in simulation.curve]
    assert [point.installments for point in simulation.curve] == list(range(1, 25))
    assert discounts == sorted(discounts)


def _payload(**changes: object) -> dict[str, object]:
    return {
        "mode": "purchase",
        "amount": "1000",
        "installments": 10,
        "start_date": "2027-01-04",
        "first_due_date": "2027-02-04",
        "cash_discount": "5",
        "investment": {"product_type": "cdb", "indexer": "cdi", "rate": "100"},
        "projection": {"cdi": "14", "selic": "14", "ipca": "4"},
        **changes,
    }


def test_simulation_endpoint_reports_the_winner(api: TestClient) -> None:
    """A API devolve o vencedor, a diferença entre as sobras e o cronograma."""
    response = api.post("/api/simulation/installments", json=_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["winner"] == "cash"
    assert Decimal(body["difference"]) > 0
    assert len(body["withdrawals"]) == 10
    assert len(body["break_even_rates"]) == 4


def test_simulation_rejects_invalid_installments(api: TestClient) -> None:
    """Zero parcelas e primeira parcela antes do dia da decisão são recusados com o
    motivo."""
    zero = api.post("/api/simulation/installments", json=_payload(installments=0))
    early = api.post(
        "/api/simulation/installments", json=_payload(first_due_date="2027-01-04")
    )

    assert zero.status_code == 422
    assert "parcelas" in zero.json()["detail"]
    assert early.status_code == 422
    assert "primeira parcela" in early.json()["detail"]
