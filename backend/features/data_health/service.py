"""Os problemas de dado que afetam algum número, derivados a cada consulta."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from backend.core.enum import DataIssueKind, IndexSeries
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
)
from backend.domain.coverage import DateRange, expected_close, index_overdue, price_gaps
from backend.domain.irpf import declared_years
from backend.features.brazilian import brazilian, brl
from backend.features.data_health.dto import DataIssueDTO
from backend.repository.cash import cash_ledger, cash_settings
from backend.repository.market import (
    business_calendar,
    cached_price_ranges,
    held_assets,
    last_cached_indexes,
)
from backend.repository.operations import operation_records
from backend.repository.rebalance import breaches
from backend.repository.sectors import unclassified_held_assets

SERIES_LABELS = {
    IndexSeries.CDI: "CDI",
    IndexSeries.SELIC: "Selic",
    IndexSeries.IPCA: "IPCA",
    IndexSeries.IBOV: "IBOV",
}
SERIES_AFFECTS = {
    IndexSeries.CDI: (
        "Marcação dos títulos atrelados ao CDI, que repete o último valor, e o dia "
        "útil do vencimento do DARF."
    ),
    IndexSeries.SELIC: "Marcação dos títulos atrelados à Selic, que repete o último valor.",
    IndexSeries.IPCA: "Marcação dos títulos atrelados ao IPCA, que repete o último valor.",
    IndexSeries.IBOV: "A referência IBOV na rentabilidade, que repete o último fechamento.",
}


def _day(day: date) -> str:
    return f"{day:%d/%m/%Y}"


def _range(gap: DateRange) -> str:
    if gap.start == gap.end:
        return f"em {_day(gap.start)}"
    return f"de {_day(gap.start)} a {_day(gap.end)}"


def _enumerate(items: Sequence[str]) -> str:
    if len(items) == 1:
        return items[0]
    return f"{', '.join(items[:-1])} e {items[-1]}"


def _price_issues(session: Session, now: datetime) -> list[DataIssueDTO]:
    """Ativo sem cotação num trecho em que houve posição. Com posição aberta e o fim
    faltando, a Carteira usa o último preço conhecido, ou o custo."""
    calendar = business_calendar(session)
    ranges = cached_price_ranges(session)
    issues: list[DataIssueDTO] = []
    for held in held_assets(session):
        cached = ranges.get(held.asset_id)
        gaps = price_gaps(held.window, cached, now, calendar)
        if not gaps:
            continue
        expected = expected_close(held.window, now, calendar)
        stale_now = held.window.end is None and (
            cached is None or (expected is not None and cached.last < expected)
        )
        if stale_now and cached is None:
            affects = "Valor a mercado na Carteira, que usa o custo do ativo."
        elif stale_now and cached is not None:
            affects = (
                "Valor a mercado na Carteira, que usa o último preço conhecido, de "
                f"{_day(cached.last)}."
            )
        else:
            affects = "Histórico de preço do ativo nesses dias."
        issues.append(
            DataIssueDTO(
                kind=DataIssueKind.MISSING_PRICES,
                subject=held.ticker,
                missing=f"Cotação {_enumerate([_range(gap) for gap in gaps])}.",
                affects=affects,
                path=f"/assets/{held.asset_id}",
            )
        )
    return issues


def _series_issues(session: Session, today: date) -> list[DataIssueDTO]:
    calendar = business_calendar(session)
    last_cached = last_cached_indexes(session)
    issues: list[DataIssueDTO] = []
    for series in IndexSeries:
        last = last_cached.get(series)
        if not index_overdue(series, last, today, calendar):
            continue
        if last is None:
            missing = "Nenhum valor em cache."
        elif series is IndexSeries.IPCA:
            missing = f"IPCA publicado depois de {last:%m/%Y}."
        else:
            missing = f"Valores publicados depois de {_day(last)}."
        issues.append(
            DataIssueDTO(
                kind=DataIssueKind.LATE_SERIES,
                subject=SERIES_LABELS[series],
                missing=missing,
                affects=SERIES_AFFECTS[series],
                path="/market",
            )
        )
    return issues


def _fixed_income_issues(session: Session) -> list[DataIssueDTO]:
    return [
        DataIssueDTO(
            kind=DataIssueKind.FIXED_INCOME_WITHOUT_APPLICATION,
            subject=investment.label,
            missing="Aplicação inicial.",
            affects="Patrimônio: o título entra na Carteira com valor zero.",
            path=f"/fixed-income/{investment.id}",
        )
        for investment in session.scalars(
            select(FixedIncomeInvestment)
            .where(
                ~exists().where(
                    FixedIncomeMovement.investment_id == FixedIncomeInvestment.id
                )
            )
            .order_by(FixedIncomeInvestment.label)
        )
    ]


def _cnpj_issues(session: Session, today: date) -> list[DataIssueDTO]:
    """Ativo sem CNPJ num ano em que ele entra na ficha Bens e Direitos."""
    years = declared_years(operation_records(session), today.year)
    return [
        DataIssueDTO(
            kind=DataIssueKind.MISSING_CNPJ,
            subject=asset.ticker,
            missing="CNPJ do ativo.",
            affects=(
                "Ficha Bens e Direitos do IRPF de "
                f"{_enumerate([str(year) for year in years[asset.ticker]])}."
            ),
            path=f"/assets/{asset.id}",
        )
        for asset in session.scalars(
            select(Asset).where(Asset.cnpj.is_(None)).order_by(Asset.ticker)
        )
        if asset.ticker in years
    ]


def _segment_issues(session: Session) -> list[DataIssueDTO]:
    """Ativo em carteira sem segmento: é o que entra na distribuição por setor."""
    return [
        DataIssueDTO(
            kind=DataIssueKind.UNCLASSIFIED_ASSET,
            subject=asset.ticker,
            missing="Setor e segmento.",
            affects=(
                "Distribuição por setor e segmento na Carteira: o ativo entra em "
                "Sem classificação."
            ),
            path=f"/assets/{asset.id}",
        )
        for asset in unclassified_held_assets(session)
    ]


def _cash_issues(session: Session, today: date) -> list[DataIssueDTO]:
    """Saldo acima do limite: dinheiro de investimento esperando reinvestimento."""
    found = cash_ledger(session, today)
    threshold = cash_settings(session).alert_threshold
    if found is None or found.balance <= threshold:
        return []
    return [
        DataIssueDTO(
            kind=DataIssueKind.IDLE_CASH,
            subject="Saldo",
            missing=(
                f"Reinvestir {brl(found.balance)} parados no saldo, acima do limite "
                f"de {brl(threshold)}."
            ),
            affects="Rendimento: o saldo não rende enquanto espera.",
            path="/cash",
        )
    ]


def _points(fraction: Decimal) -> str:
    """A fração em pontos percentuais, com sinal: 0.062 vira "+6,20 p.p."."""
    points = fraction * 100
    sign = "+" if points > 0 else ""
    return f"{sign}{brazilian(points, 2)} p.p."


def _rebalance_issues(session: Session, today: date) -> list[DataIssueDTO]:
    """Subcarteira com meta que passou de um dos limites dela."""
    issues: list[DataIssueDTO] = []
    for breach in breaches(session, today):
        parts = [f"{label} {_points(deviation)}" for label, deviation in breach.items]
        parts.append(
            f"desbalanceamento {_points(breach.imbalance).lstrip('+')} "
            f"(limites: {_points(breach.max_item_deviation).lstrip('+')} por item e "
            f"{_points(breach.max_total_deviation).lstrip('+')} no total)"
        )
        issues.append(
            DataIssueDTO(
                kind=DataIssueKind.REBALANCE_BREACH,
                subject=breach.name,
                missing=f"Rebalancear: {'; '.join(parts)}.",
                affects="Distância da subcarteira até a meta dela.",
                path=f"/rebalance?subportfolio={breach.subportfolio_id}",
            )
        )
    return issues


def data_issues(session: Session, now: datetime) -> list[DataIssueDTO]:
    return [
        *_price_issues(session, now),
        *_series_issues(session, now.date()),
        *_fixed_income_issues(session),
        *_cnpj_issues(session, now.date()),
        *_segment_issues(session),
        *_cash_issues(session, now.date()),
        *_rebalance_issues(session, now.date()),
    ]
