from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    Operation,
    Subportfolio,
)

TODAY = date.today()
LATER = TODAY.year + 2


def _stock(session: Session) -> Asset:
    """Dez ações a R$ 40 sem cotação: valem o custo, R$ 400."""
    asset = Asset(ticker="ABCD3", asset_class=AssetClass.STOCK)
    session.add(asset)
    session.flush()
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=date(2024, 2, 5),
            operation_type=OperationType.BUY,
            quantity=Decimal(10),
            unit_price=Decimal(40),
        )
    )
    session.commit()
    return asset


def _title(
    session: Session,
    label: str,
    amount: str,
    *,
    daily_liquidity: bool,
    maturity: date | None = None,
) -> FixedIncomeInvestment:
    """Título aplicado hoje: vale exatamente o que foi aplicado."""
    investment = FixedIncomeInvestment(
        label=label,
        product_type=FixedIncomeType.CDB,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=maturity,
        daily_liquidity=daily_liquidity,
    )
    session.add(investment)
    session.flush()
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=TODAY,
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=Decimal(amount),
        )
    )
    session.commit()
    return investment


def _tiers(body: dict[str, list[dict[str, str]]]) -> dict[str, Decimal]:
    return {item["tier"]: Decimal(item["value"]) for item in body["liquidity"]}


def test_each_holding_falls_in_its_liquidity_tier(
    api: TestClient, session: Session
) -> None:
    """O saldo e a renda fixa diária são mexíveis, a renda variável é intermediária e
    a renda fixa sem liquidez é travada; as frações somam 1."""
    _stock(session)
    _title(session, "CDB Diário", "300", daily_liquidity=True)
    _title(session, "CDB Travado", "200", daily_liquidity=False)
    api.post(
        "/api/cash/checks",
        json={"check_date": TODAY.isoformat(), "balance": "100"},
    )

    body = api.get("/api/portfolio").json()

    assert _tiers(body) == {
        "daily": Decimal(400),
        "intermediate": Decimal(400),
        "locked": Decimal(200),
    }
    assert sum(Decimal(item["share"]) for item in body["liquidity"]) == 1


def test_subportfolio_splits_only_its_members(
    api: TestClient, session: Session
) -> None:
    """Na subcarteira, as camadas são só dos membros, sem o saldo da geral."""
    stock = _stock(session)
    _title(session, "CDB Travado", "200", daily_liquidity=False)
    subportfolio = Subportfolio(name="Ações")
    session.add(subportfolio)
    session.flush()
    stock.subportfolio_id = subportfolio.id
    session.commit()
    api.post(
        "/api/cash/checks",
        json={"check_date": TODAY.isoformat(), "balance": "100"},
    )

    body = api.get(f"/api/portfolio?subportfolio_id={subportfolio.id}").json()

    assert _tiers(body) == {"intermediate": Decimal(400)}
    assert body["maturities_by_month"] == []


def test_maturity_ladder_groups_locked_titles_by_month_and_year(
    api: TestClient, session: Session
) -> None:
    """A escada soma os travados por mês e por ano do vencimento, com o travado sem
    vencimento no fim; o título diário fica fora dela."""
    _title(
        session, "CDB Março", "100", daily_liquidity=False, maturity=date(LATER, 3, 15)
    )
    _title(
        session, "CDB Março 2", "50", daily_liquidity=False, maturity=date(LATER, 3, 2)
    )
    _title(
        session, "CDB Julho", "200", daily_liquidity=False, maturity=date(LATER, 7, 1)
    )
    _title(session, "CDB Sem prazo", "70", daily_liquidity=False)
    _title(
        session, "CDB Diário", "300", daily_liquidity=True, maturity=date(LATER, 5, 1)
    )

    body = api.get("/api/portfolio").json()

    def ladder(key: str) -> list[tuple[str | None, Decimal]]:
        return [(item["start"], Decimal(item["value"])) for item in body[key]]

    assert ladder("maturities_by_month") == [
        (f"{LATER}-03-01", Decimal(150)),
        (f"{LATER}-07-01", Decimal(200)),
        (None, Decimal(70)),
    ]
    assert ladder("maturities_by_year") == [
        (f"{LATER}-01-01", Decimal(350)),
        (None, Decimal(70)),
    ]
