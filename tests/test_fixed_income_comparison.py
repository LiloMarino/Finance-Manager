from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient

from backend.core.enum import FixedIncomeType, Indexer
from backend.domain.comparison import Option, compare
from backend.domain.fixed_income import Application, FixedIncomeTerms, iof_rate
from backend.domain.projection import Assumptions, project

START = date(2027, 1, 4)
CENT = Decimal("0.01")
ASSUMPTIONS = Assumptions(cdi=Decimal(14), selic=Decimal(14), ipca=Decimal(4))
PROJECTION = {"cdi": "14", "selic": "14", "ipca": "4"}


def _terms(
    product_type: FixedIncomeType = FixedIncomeType.CDB,
    indexer: Indexer = Indexer.CDI,
    rate: str = "100",
) -> FixedIncomeTerms:
    return FixedIncomeTerms(
        product_type=product_type,
        indexer=indexer,
        rate=Decimal(rate),
        maturity_date=None,
    )


def _option(terms: FixedIncomeTerms, redeemed_on: date) -> Option:
    return Option(
        terms=terms, amount=Decimal(1000), applied_on=START, redeemed_on=redeemed_on
    )


def test_iof_follows_the_regressive_table() -> None:
    """O IOF leva 96% do rendimento no primeiro dia, 3% no 29º e nada a partir do
    30º."""
    assert iof_rate(0) == Decimal("0.96")
    assert iof_rate(1) == Decimal("0.96")
    assert iof_rate(10) == Decimal("0.66")
    assert iof_rate(29) == Decimal("0.03")
    assert iof_rate(30) == 0


def test_income_tax_applies_to_the_yield_after_iof() -> None:
    """No resgate do 10º dia, o IOF leva 66% do rendimento, e o IR de 22,5% incide
    sobre o que sobra do rendimento."""
    rates = project({}, ASSUMPTIONS, START, date(2027, 2, 1))
    application = Application(_terms(), START, rates, date(2027, 2, 1))
    day = date(2027, 1, 14)

    redemption = application.value_at(Decimal(1000), day)

    gain = Decimal(1000) * application.factor(day) - 1000
    precision = Decimal("1e-20")
    assert abs(redemption.iof - gain * Decimal("0.66")) < precision
    assert (
        abs(redemption.income_tax - (gain - redemption.iof) * Decimal("0.225"))
        < precision
    )


def test_gross_for_net_inverts_the_redemption() -> None:
    """O bruto calculado para um líquido de R$ 100, resgatado, deixa exatamente R$ 100,
    com IOF, na faixa curta do IR e na longa."""
    end = date(2030, 1, 1)
    rates = project({}, ASSUMPTIONS, START, end)
    application = Application(_terms(), START, rates, end)

    for day in (date(2027, 1, 14), date(2027, 6, 1), date(2029, 3, 1)):
        gross = application.gross_for_net(Decimal(100), day)
        assert application.redeem(gross, day).net.quantize(CENT) == Decimal(100)


def test_taxed_cdb_is_its_own_cdi_equivalent() -> None:
    """Um CDB tributado de 110% do CDI equivale a 110% do CDI."""
    redeemed_on = date(2028, 1, 3)
    rates = project({}, ASSUMPTIONS, START, redeemed_on)

    comparison = compare([_option(_terms(rate="110"), redeemed_on)], rates)

    equivalent = comparison.results[0].cdi_equivalent
    assert equivalent is not None
    assert abs(equivalent - Decimal(110)) < Decimal("0.001")


def test_exempt_option_is_worth_more_cdi_in_a_taxed_cdb() -> None:
    """Uma LCI de 90% do CDI, isenta, empata com um CDB tributado acima de 100% do
    CDI: o CDB nessa taxa entrega o mesmo líquido."""
    redeemed_on = date(2029, 3, 1)
    rates = project({}, ASSUMPTIONS, START, redeemed_on)
    lci = _option(_terms(FixedIncomeType.LCI, rate="90"), redeemed_on)

    result = compare([lci], rates).results[0]

    assert result.income_tax_rate is None
    assert result.cdi_equivalent is not None
    assert result.cdi_equivalent > 100
    cdb = compare(
        [_option(_terms(rate=str(result.cdi_equivalent)), redeemed_on)], rates
    )
    assert abs(cdb.results[0].redemption.net - result.redemption.net) < CENT


def test_net_annual_return_compounds_by_business_days() -> None:
    """A rentabilidade líquida ao ano é a taxa que, composta dia útil a dia útil,
    leva do valor aplicado ao líquido."""
    redeemed_on = date(2028, 1, 3)
    rates = project({}, ASSUMPTIONS, START, redeemed_on)

    result = compare([_option(_terms(), redeemed_on)], rates).results[0]

    assert result.net_annual_return is not None
    growth = (1 + result.net_annual_return) ** (
        Decimal(result.business_days) / Decimal(252)
    )
    assert abs(Decimal(1000) * growth - result.redemption.net) < CENT


def test_chart_keeps_each_option_inside_its_dates() -> None:
    """No gráfico, a opção não tem valor antes da aplicação e fica no resgatado depois
    do resgate."""
    early, late = date(2027, 6, 1), date(2028, 1, 3)
    rates = project({}, ASSUMPTIONS, START, late)
    later_start = Option(
        terms=_terms(),
        amount=Decimal(1000),
        applied_on=date(2027, 3, 1),
        redeemed_on=late,
    )

    comparison = compare([_option(_terms(), early), later_start], rates)

    first_point = comparison.points[0]
    assert first_point.day == START
    assert first_point.net_values[1] is None
    last_point = comparison.points[-1]
    assert last_point.day == late
    assert last_point.net_values[0] == comparison.results[0].redemption.net


def _payload(**option: str) -> dict[str, object]:
    return {
        "options": [
            {
                "label": "CDB",
                "product_type": "cdb",
                "indexer": "cdi",
                "rate": "110",
                "amount": "1000",
                "application_date": "2027-01-04",
                "redemption_date": "2028-01-03",
                **option,
            },
            {
                "label": "LCI",
                "product_type": "lci",
                "indexer": "cdi",
                "rate": "90",
                "amount": "1000",
                "application_date": "2027-01-04",
                "redemption_date": "2028-01-03",
            },
        ],
        "projection": PROJECTION,
    }


def test_comparison_endpoint_points_the_best_option(api: TestClient) -> None:
    """A API devolve cada opção com o líquido, e aponta a de maior líquido."""
    response = api.post("/api/simulation/fixed-income", json=_payload())

    assert response.status_code == 200
    body = response.json()
    nets = [Decimal(result["net_value"]) for result in body["results"]]
    assert body["best"] == nets.index(max(nets))
    assert body["results"][1]["income_tax_rate"] is None
    assert len(body["points"][0]["net_values"]) == 2


def test_comparison_rejects_redemption_before_application(api: TestClient) -> None:
    """Resgate no dia da aplicação ou antes dele é recusado com o motivo."""
    response = api.post(
        "/api/simulation/fixed-income", json=_payload(redemption_date="2027-01-04")
    )

    assert response.status_code == 422
    assert "resgate vem depois da aplicação" in response.json()["detail"]


def test_comparison_rejects_treasury_with_other_indexer(api: TestClient) -> None:
    """O Tesouro Selic com indexador CDI é recusado, como no cadastro."""
    response = api.post(
        "/api/simulation/fixed-income",
        json=_payload(product_type="treasury_selic", indexer="cdi"),
    )

    assert response.status_code == 422
    assert "Tesouro" in response.json()["detail"]


def test_current_rates_are_empty_without_cache(api: TestClient) -> None:
    """Sem série no cache, o ponto de partida da projeção vem vazio."""
    response = api.get("/api/simulation/rates")

    assert response.status_code == 200
    assert response.json()["cdi"] is None
    assert response.json()["ipca"] is None
