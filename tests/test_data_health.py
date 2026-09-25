from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.core.enum import (
    AssetClass,
    DataIssueKind,
    FixedIncomeMovementType,
    Indexer,
    IndexSeries,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    IndexHistory,
    Operation,
    PriceHistory,
)
from backend.features.data_health.dto import DataIssueDTO
from backend.features.data_health.service import data_issues

# Sexta-feira, depois do fechamento do pregão
NOW = datetime(2024, 2, 9, 20, 0)


def _weekdays(start: date, end: date) -> list[date]:
    days = (start + timedelta(days=offset) for offset in range((end - start).days + 1))
    return [day for day in days if day.weekday() < 5]


def _asset(session: Session, ticker: str = "ABCD11", cnpj: str | None = None) -> Asset:
    asset = Asset(ticker=ticker, asset_class=AssetClass.FII, cnpj=cnpj)
    session.add(asset)
    session.flush()
    return asset


def _trade(
    session: Session,
    asset: Asset,
    day: date,
    operation_type: OperationType = OperationType.BUY,
) -> None:
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=day,
            operation_type=operation_type,
            quantity=Decimal(10),
            unit_price=Decimal(100),
        )
    )
    session.commit()


def _prices(session: Session, asset: Asset, start: date, end: date) -> None:
    session.add_all(
        PriceHistory(asset_id=asset.id, price_date=day, close=Decimal(10))
        for day in _weekdays(start, end)
    )
    session.commit()


def _issues(session: Session, kind: DataIssueKind) -> list[DataIssueDTO]:
    return [issue for issue in data_issues(session, NOW) if issue.kind is kind]


def test_held_asset_without_prices_is_listed(session: Session) -> None:
    """Ativo com posição e sem cotação aparece com o trecho que falta e o que ele
    afeta; com o cache em dia, sai da lista."""
    asset = _asset(session)
    _trade(session, asset, date(2024, 2, 5))

    [issue] = _issues(session, DataIssueKind.MISSING_PRICES)
    _prices(session, asset, date(2024, 2, 5), date(2024, 2, 9))

    assert (issue.subject, issue.missing, issue.affects, issue.path) == (
        "ABCD11",
        "Cotação de 05/02/2024 a 08/02/2024.",
        "Valor a mercado na Carteira, que usa o custo do ativo.",
        f"/assets/{asset.id}",
    )
    assert _issues(session, DataIssueKind.MISSING_PRICES) == []


def test_old_gap_of_held_asset_affects_only_its_history(session: Session) -> None:
    """Quando só o começo da janela não tem cotação, a Carteira segue certa, e o
    problema é o histórico do ativo."""
    asset = _asset(session)
    _trade(session, asset, date(2024, 1, 2))
    _prices(session, asset, date(2024, 2, 1), date(2024, 2, 9))

    [issue] = _issues(session, DataIssueKind.MISSING_PRICES)

    assert issue.missing == "Cotação de 02/01/2024 a 31/01/2024."
    assert issue.affects == "Histórico de preço do ativo nesses dias."


def test_asset_delisted_after_the_sale_is_not_a_problem(session: Session) -> None:
    """Ativo vendido, com cotação cobrindo os dias em que houve posição, não aparece,
    mesmo que o ticker não tenha mais cotação depois."""
    asset = _asset(session)
    _trade(session, asset, date(2024, 1, 2))
    _trade(session, asset, date(2024, 1, 10), OperationType.SELL)
    _prices(session, asset, date(2024, 1, 2), date(2024, 1, 10))

    assert _issues(session, DataIssueKind.MISSING_PRICES) == []


def test_late_series_are_listed(session: Session) -> None:
    """Série sem cache, ou atrasada além da folga, aparece; em dia, não."""
    assert [issue.subject for issue in _issues(session, DataIssueKind.LATE_SERIES)] == [
        "CDI",
        "Selic",
        "IPCA",
    ]

    for series in (IndexSeries.CDI, IndexSeries.SELIC):
        session.add_all(
            IndexHistory(series=series, rate_date=day, value=Decimal("0.04"))
            for day in _weekdays(date(2024, 2, 1), date(2024, 2, 8))
        )
    session.add(
        IndexHistory(
            series=IndexSeries.IPCA, rate_date=date(2023, 12, 1), value=Decimal("0.5")
        )
    )
    session.commit()

    assert _issues(session, DataIssueKind.LATE_SERIES) == []


def test_fixed_income_without_application_is_listed(session: Session) -> None:
    """Título sem aplicação entra com valor zero no patrimônio, e aparece até ganhar
    a primeira aplicação."""
    investment = FixedIncomeInvestment(
        label="CDB XYZ 2030",
        indexer=Indexer.CDI,
        rate=Decimal(100),
        maturity_date=None,
        daily_liquidity=True,
        tax_exempt=False,
    )
    session.add(investment)
    session.commit()

    [issue] = _issues(session, DataIssueKind.FIXED_INCOME_WITHOUT_APPLICATION)
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=date(2024, 2, 5),
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=Decimal(1000),
        )
    )
    session.commit()

    assert (issue.subject, issue.path) == (
        "CDB XYZ 2030",
        f"/fixed-income/{investment.id}",
    )
    assert _issues(session, DataIssueKind.FIXED_INCOME_WITHOUT_APPLICATION) == []


def test_asset_without_cnpj_lists_its_irpf_years(session: Session) -> None:
    """Ativo sem CNPJ aparece com os anos em que entra em Bens e Direitos; ativo
    sem operação e ativo com CNPJ, não."""
    asset = _asset(session)
    _asset(session, "WXYZ3")
    _trade(session, asset, date(2023, 6, 1))
    with_cnpj = _asset(session, "EFGH11", cnpj="CNPJ-FICTICIO")
    _trade(session, with_cnpj, date(2023, 6, 1))

    [issue] = _issues(session, DataIssueKind.MISSING_CNPJ)

    assert (issue.subject, issue.affects) == (
        "ABCD11",
        "Ficha Bens e Direitos do IRPF de 2023 e 2024.",
    )
