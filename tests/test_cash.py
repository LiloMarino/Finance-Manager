from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    CashEntryKind,
    FixedIncomeMovementType,
    FixedIncomeType,
    IncomeType,
    Indexer,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    IncomeEvent,
    Operation,
    PriceHistory,
    Subportfolio,
)
from backend.domain.cash import CashCheck, CashEvent, ledger
from backend.domain.fixed_income import (
    Application,
    FixedIncomeTerms,
    Movement,
    mark,
    payouts,
)

OPENING = date(2024, 3, 1)
APPLICATION = FixedIncomeMovementType.APPLICATION
REDEMPTION = FixedIncomeMovementType.REDEMPTION


def _event(day: date, kind: CashEntryKind, amount: str) -> CashEvent:
    value = Decimal(amount)
    return CashEvent(
        event_date=day,
        kind=kind,
        label="ABCD11",
        amount=value,
        flow=Decimal(0) if kind is CashEntryKind.INCOME else value,
    )


def _opening(balance: str) -> CashCheck:
    return CashCheck(check_id=1, check_date=OPENING, balance=Decimal(balance))


def test_sale_and_income_raise_the_balance() -> None:
    """A venda e o provento depois da abertura entram no saldo."""
    found = ledger(
        [_opening("100")],
        [
            _event(date(2024, 3, 4), CashEntryKind.SALE, "50"),
            _event(date(2024, 3, 5), CashEntryKind.INCOME, "10"),
        ],
    )

    assert found is not None
    assert found.balance == Decimal(160)


def test_purchase_beyond_the_balance_is_money_from_outside() -> None:
    """A compra consome o saldo, e o que passa dele é aporte de fora: o saldo de
    nenhuma linha fica negativo."""
    found = ledger(
        [_opening("100")],
        [_event(date(2024, 3, 4), CashEntryKind.PURCHASE, "-150")],
    )

    assert found is not None
    assert [(entry.kind, entry.amount) for entry in found.entries[1:]] == [
        (CashEntryKind.DEPOSIT, Decimal(50)),
        (CashEntryKind.PURCHASE, Decimal(-150)),
    ]
    assert all(entry.balance >= 0 for entry in found.entries)
    assert found.balance == 0


def test_same_day_flows_offset_each_other() -> None:
    """Venda e compra no mesmo dia se compensam antes de virar aporte de fora."""
    day = date(2024, 3, 4)
    found = ledger(
        [_opening("0")],
        [
            _event(day, CashEntryKind.PURCHASE, "-80"),
            _event(day, CashEntryKind.SALE, "100"),
        ],
    )

    assert found is not None
    assert CashEntryKind.DEPOSIT not in {entry.kind for entry in found.entries}
    assert found.balance == Decimal(20)


def test_check_replaces_the_derived_balance() -> None:
    """A conferência com o extrato vira o saldo do dia, e a diferença fica
    registrada como ajuste."""
    found = ledger(
        [
            _opening("100"),
            CashCheck(check_id=2, check_date=date(2024, 3, 8), balance=Decimal(140)),
        ],
        [_event(date(2024, 3, 4), CashEntryKind.SALE, "50")],
    )

    assert found is not None
    check = found.entries[-1]
    assert (check.kind, check.amount, check.balance) == (
        CashEntryKind.CHECK,
        Decimal(-10),
        Decimal(140),
    )


def test_events_up_to_the_opening_are_inside_it() -> None:
    """A abertura é o saldo no fim do dia: o que aconteceu até ela já está dentro."""
    found = ledger(
        [_opening("100")],
        [
            _event(date(2024, 2, 1), CashEntryKind.SALE, "500"),
            _event(OPENING, CashEntryKind.SALE, "500"),
        ],
    )

    assert found is not None
    assert found.balance == Decimal(100)


def test_no_balance_before_the_first_check() -> None:
    """Sem conferência, o saldo não existe."""
    assert ledger([], [_event(date(2024, 3, 4), CashEntryKind.SALE, "50")]) is None


def _terms(
    maturity: date | None, product_type: FixedIncomeType = FixedIncomeType.CDB
) -> FixedIncomeTerms:
    return FixedIncomeTerms(
        product_type=product_type,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=maturity,
    )


def test_maturity_redeems_the_whole_title() -> None:
    """No vencimento o título passa a valer zero, e o resgate automático leva o bruto
    marcado, com o IR da idade da aplicação descontado no líquido."""
    start, maturity = date(2024, 1, 1), date(2024, 3, 1)
    movements = [
        Movement(movement_date=start, movement_type=APPLICATION, amount=Decimal(1000))
    ]

    open_ended = mark(_terms(None), movements, {}, maturity).gross_value
    [payout] = payouts(_terms(maturity), movements, {}, date(2024, 9, 2))

    assert mark(_terms(maturity), movements, {}, maturity).gross_value == 0
    assert payout.at_maturity
    assert payout.payout_date == maturity
    assert payout.gross == open_ended
    assert payout.net == open_ended - (open_ended - 1000) * Decimal("0.225")


def test_registered_redemption_arrives_net_of_withheld_tax() -> None:
    """O resgate registrado chega ao saldo sem o IR da aplicação consumida; no
    título isento, chega inteiro."""
    start, day = date(2024, 1, 1), date(2024, 7, 1)
    movements = [
        Movement(movement_date=start, movement_type=APPLICATION, amount=Decimal(1000)),
        Movement(movement_date=day, movement_type=REDEMPTION, amount=Decimal(500)),
    ]

    [taxed] = payouts(_terms(None), movements, {}, day)
    [exempt] = payouts(_terms(None, FixedIncomeType.LCI), movements, {}, day)

    expected = Application(_terms(None), start, {}, day).redeem(Decimal(500), day)
    assert taxed.net.quantize(Decimal("1e-12")) == expected.net.quantize(
        Decimal("1e-12")
    )
    assert taxed.net < taxed.gross
    assert exempt.net == exempt.gross == Decimal(500)


def _held(session: Session, ticker: str = "ABCD11") -> Asset:
    """Dez cotas a R$ 100 compradas antes da abertura, sem cotação: valem o custo."""
    asset = Asset(ticker=ticker, asset_class=AssetClass.FII)
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 2, 5),
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(100),
        )
    )
    session.commit()
    return asset


def _open(api: TestClient, balance: str = "0") -> None:
    response = api.post(
        "/api/cash/checks",
        json={"check_date": OPENING.isoformat(), "balance": balance},
    )
    assert response.status_code == 204


def test_sale_after_opening_enters_cash_and_the_portfolio_total(
    api: TestClient, session: Session
) -> None:
    """O dinheiro da venda fica no saldo, que entra no total da carteira geral."""
    asset = _held(session)
    _open(api)
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 3, 4),
            operation_type=OperationType.SELL,
            quantity=Decimal(5),
            unit_price=Decimal(120),
        )
    )
    session.commit()

    cash = api.get("/api/cash").json()
    portfolio = api.get("/api/portfolio").json()

    assert Decimal(cash["balance"]) == Decimal(600)
    assert cash["opened_on"] == OPENING.isoformat()
    assert Decimal(portfolio["cash"]) == Decimal(600)
    assert Decimal(portfolio["total"]) == Decimal(1100)
    assert ("cash", Decimal(600)) in [
        (category["category"], Decimal(category["value"]))
        for category in portfolio["categories"]
    ]


def test_evolution_counts_only_outside_money_after_opening(
    api: TestClient, session: Session
) -> None:
    """Depois da abertura, o aplicado conta só o dinheiro de fora: o provento fica
    no saldo como ganho, e a compra maior que o saldo é aporte."""
    asset = _held(session)
    _open(api)
    session.add(
        IncomeEvent(
            asset_id=asset.id,
            payment_date=date(2024, 3, 5),
            income_type=IncomeType.DISTRIBUTION,
            quantity=Decimal(10),
            unit_price=Decimal(5),
            amount=Decimal(50),
        )
    )
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 3, 6),
            operation_type=OperationType.BUY,
            quantity=Decimal(2),
            unit_price=Decimal(100),
        )
    )
    session.commit()

    evolution = api.get("/api/evolution").json()
    last = evolution["points"][-1]

    assert Decimal(last["value"]) == Decimal(1200)
    assert Decimal(last["invested"]) == Decimal(1150)
    assert Decimal(last["gain"]) == Decimal(50)
    assert Decimal(evolution["total"]) == Decimal(
        api.get("/api/portfolio").json()["total"]
    )


def test_cash_stays_out_of_the_portfolio_result(
    api: TestClient, session: Session
) -> None:
    """O saldo entra no total, mas não no resultado não realizado nem na base do
    percentual dele."""
    asset = _held(session)
    session.add(
        PriceHistory(asset_id=asset.id, price_date=date.today(), close=Decimal(120))
    )
    session.commit()
    _open(api, "500")

    portfolio = api.get("/api/portfolio").json()

    assert Decimal(portfolio["total"]) == Decimal(1700)
    assert Decimal(portfolio["unrealized_result"]) == Decimal(200)
    assert Decimal(portfolio["unrealized_return"]) == Decimal("0.2")


def test_performance_ignores_the_cash(api: TestClient, session: Session) -> None:
    """O saldo fica fora da cota: abrir o saldo não muda a rentabilidade."""
    asset = _held(session)
    session.add(
        IncomeEvent(
            asset_id=asset.id,
            payment_date=date(2024, 3, 5),
            income_type=IncomeType.DISTRIBUTION,
            quantity=Decimal(10),
            unit_price=Decimal(5),
            amount=Decimal(50),
        )
    )
    session.commit()
    before = api.get("/api/performance").json()["since_inception"]

    _open(api, "300")

    assert api.get("/api/performance").json()["since_inception"] == before


def test_subportfolio_has_no_cash(api: TestClient, session: Session) -> None:
    """O saldo é da carteira geral: a subcarteira não o mostra."""
    asset = _held(session)
    subportfolio = Subportfolio(name="Renda")
    session.add(subportfolio)
    session.flush()
    asset.subportfolio_id = subportfolio.id
    session.commit()
    _open(api, "300")

    body = api.get(f"/api/portfolio?subportfolio_id={subportfolio.id}").json()

    assert body["cash"] is None
    assert Decimal(body["total"]) == Decimal(1000)


def test_matured_title_leaves_fixed_income_and_enters_cash(
    api: TestClient, session: Session
) -> None:
    """O título vencido sai da renda fixa da carteira, e o líquido dele entra no
    saldo."""
    investment = FixedIncomeInvestment(
        label="CDB XYZ 2024",
        product_type=FixedIncomeType.LCI,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=date(2024, 6, 3),
        daily_liquidity=False,
    )
    session.add(investment)
    session.flush()
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=date(2024, 1, 2),
            movement_type=APPLICATION,
            amount=Decimal(1000),
        )
    )
    session.commit()
    _open(api)

    portfolio = api.get("/api/portfolio").json()
    [entry] = [
        found
        for found in api.get("/api/cash").json()["entries"]
        if found["kind"] == "maturity"
    ]

    assert portfolio["fixed_income"] == []
    assert Decimal(portfolio["cash"]) > Decimal(1000)
    assert entry["label"] == "CDB XYZ 2024"
    assert api.get(f"/api/fixed-income/{investment.id}").json()["matured"] is True


def test_movement_after_maturity_is_refused(api: TestClient, session: Session) -> None:
    """O vencimento resgata o título inteiro: nenhuma movimentação vem depois dele."""
    investment = FixedIncomeInvestment(
        label="CDB XYZ 2024",
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=date(2024, 6, 3),
        daily_liquidity=False,
    )
    session.add(investment)
    session.flush()
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=date(2024, 1, 2),
            movement_type=APPLICATION,
            amount=Decimal(1000),
        )
    )
    session.commit()

    response = api.post(
        f"/api/fixed-income/{investment.id}/movements",
        json={
            "movement_date": "2024-06-04",
            "movement_type": "redemption",
            "amount": "100",
        },
    )

    assert response.status_code == 422
    assert "vence em 03/06/2024" in response.json()["detail"]


def test_withdrawal_lowers_the_balance_and_comes_after_opening(
    api: TestClient, session: Session
) -> None:
    """O saque tira do saldo, e só vale depois do dia da abertura."""
    _held(session)
    _open(api, "500")

    refused = api.post(
        "/api/cash/withdrawals",
        json={"withdrawal_date": OPENING.isoformat(), "amount": "100"},
    )
    accepted = api.post(
        "/api/cash/withdrawals",
        json={"withdrawal_date": "2024-03-04", "amount": "100"},
    )

    assert refused.status_code == 422
    assert accepted.status_code == 204
    assert Decimal(api.get("/api/cash").json()["balance"]) == Decimal(400)


def test_data_health_flags_idle_cash_above_the_threshold(
    api: TestClient, session: Session
) -> None:
    """O saldo acima do limite aparece em Saúde dos dados, e abaixo dele não."""
    _held(session)
    _open(api, "500")

    def idle() -> list[str]:
        return [
            issue["subject"]
            for issue in api.get("/api/data-health").json()
            if issue["kind"] == "idle_cash"
        ]

    assert idle() == ["Saldo"]
    assert (
        api.put("/api/cash/settings", json={"alert_threshold": "1000"}).status_code
        == 204
    )
    assert idle() == []
