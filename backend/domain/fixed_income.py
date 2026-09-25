"""Marcação de renda fixa pela curva do indexador, recalculada a cada consulta.

O valor de cada fluxo cresce por um fator acumulado `F`, que é o mesmo para todos os
fluxos do título. Por isso o saldo bruto é linear, `Σ aplicação * F(t)/F(a) -
Σ resgate * F(t)/F(r)`, e independe de qual aplicação o resgate consumiu. Os lotes
existem só para o IR regressivo, que depende da idade de cada aplicação.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, replace
from datetime import date
from decimal import Decimal

from backend.core.enum import (
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    IndexSeries,
)
from backend.domain.business_days import BusinessCalendar
from backend.domain.index_growth import (
    PublishedSeries,
    accumulation,
    daily_factor,
)
from backend.domain.index_series import DailyRate

ZERO = Decimal(0)

# IR regressivo: até N dias corridos da aplicação, a alíquota ao lado
TAX_BRACKETS = (
    (180, Decimal("0.225")),
    (360, Decimal("0.20")),
    (720, Decimal("0.175")),
)
LONG_TERM_TAX = Decimal("0.15")

INDEX_SERIES = {
    Indexer.CDI: IndexSeries.CDI,
    Indexer.SELIC: IndexSeries.SELIC,
    Indexer.IPCA: IndexSeries.IPCA,
}

# Isentos de IR para pessoa física
TAX_EXEMPT_TYPES = frozenset(
    {
        FixedIncomeType.LCI,
        FixedIncomeType.LCA,
        FixedIncomeType.CRI,
        FixedIncomeType.CRA,
        FixedIncomeType.INCENTIVIZED_DEBENTURE,
    }
)

# O título do Tesouro tem o indexador no nome
TREASURY_INDEXER = {
    FixedIncomeType.TREASURY_SELIC: Indexer.SELIC,
    FixedIncomeType.TREASURY_PREFIXED: Indexer.PREFIXED,
    FixedIncomeType.TREASURY_IPCA: Indexer.IPCA,
}


@dataclass(frozen=True, slots=True, kw_only=True)
class FixedIncomeTerms:
    """`rate` segue o indexador: % do CDI; spread anual somado à Selic; taxa real
    somada ao IPCA; taxa anual no pré. Tudo em %."""

    product_type: FixedIncomeType
    indexer: Indexer
    rate: Decimal
    maturity_date: date | None

    @property
    def tax_exempt(self) -> bool:
        return self.product_type in TAX_EXEMPT_TYPES


@dataclass(frozen=True, slots=True, kw_only=True)
class Movement:
    movement_date: date
    movement_type: FixedIncomeMovementType
    amount: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class Marking:
    """`invested` é o principal ainda aplicado; `series_date` é o último dado real
    do indexador usado, e depois dele o último valor se repete. `day_change` é o
    rendimento bruto desde o dia útil anterior, sobre o que está aplicado hoje."""

    invested: Decimal
    gross_value: Decimal
    estimated_tax: Decimal
    day_change: Decimal
    as_of: date
    series_date: date | None

    @property
    def net_value(self) -> Decimal:
        return self.gross_value - self.estimated_tax


@dataclass(frozen=True, slots=True, kw_only=True)
class _Lot:
    """Uma aplicação em unidades do fator acumulado: vale `units * F(t)`."""

    opened: date
    units: Decimal
    principal: Decimal


def tax_rate(days: int) -> Decimal:
    for limit, rate in TAX_BRACKETS:
        if days <= limit:
            return rate
    return LONG_TERM_TAX


def _redeem(lots: list[_Lot], units: Decimal) -> list[_Lot]:
    """Consome as unidades das aplicações mais antigas primeiro. Resgate maior que
    o saldo zera o título: a diferença é o erro da estimativa."""
    remaining = units
    result: list[_Lot] = []
    for lot in lots:
        taken = min(lot.units, remaining)
        remaining -= taken
        if taken == lot.units:
            continue
        kept = lot.units - taken
        result.append(
            replace(lot, units=kept, principal=lot.principal * kept / lot.units)
        )
    return result


def daily_gross(
    terms: FixedIncomeTerms,
    movements: Sequence[Movement],
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    days: Sequence[date],
) -> list[Decimal]:
    """O saldo bruto no fim de cada um dos `days`, em ordem: o de `mark` com as
    movimentações até o dia. Uma acumulação só serve a série toda, porque `F(d)` só
    depende dos dias até `d`."""
    ordered = sorted(movements, key=lambda movement: movement.movement_date)
    if not ordered or not days:
        return [ZERO] * len(days)

    last = min(days[-1], terms.maturity_date) if terms.maturity_date else days[-1]
    business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    factor = accumulation(
        daily_factor(terms.indexer, terms.rate, rates, business),
        ordered[0].movement_date,
        last,
    )
    values: list[Decimal] = []
    units = ZERO
    cursor = 0
    for day in days:
        while cursor < len(ordered) and ordered[cursor].movement_date <= day:
            movement = ordered[cursor]
            moved = movement.amount / factor(movement.movement_date)
            if movement.movement_type is FixedIncomeMovementType.APPLICATION:
                units += moved
            else:
                # Resgate maior que o saldo zera o título, como em `_redeem`
                units = max(ZERO, units - moved)
            cursor += 1
        values.append(units * factor(day) if units else ZERO)
    return values


def mark(
    terms: FixedIncomeTerms,
    movements: Sequence[Movement],
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    today: date,
) -> Marking:
    """Saldo bruto, principal e IR estimado do título em `today`, ou no vencimento
    se ele já passou. `movements` vem na ordem de gravação; o IOF não entra."""
    as_of = min(today, terms.maturity_date) if terms.maturity_date else today
    series = INDEX_SERIES.get(terms.indexer)
    series_date = PublishedSeries(rates.get(series, ())).last_date if series else None

    ordered = sorted(movements, key=lambda movement: movement.movement_date)
    if not ordered:
        return Marking(
            invested=ZERO,
            gross_value=ZERO,
            estimated_tax=ZERO,
            day_change=ZERO,
            as_of=as_of,
            series_date=series_date,
        )

    business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    factor = accumulation(
        daily_factor(terms.indexer, terms.rate, rates, business),
        ordered[0].movement_date,
        as_of,
    )
    lots: list[_Lot] = []
    for movement in ordered:
        units = movement.amount / factor(movement.movement_date)
        if movement.movement_type is FixedIncomeMovementType.APPLICATION:
            lots.append(
                _Lot(
                    opened=movement.movement_date,
                    units=units,
                    principal=movement.amount,
                )
            )
        else:
            lots = _redeem(lots, units)

    now = factor(as_of)
    gains = [(lot, lot.units * now - lot.principal) for lot in lots]
    estimated_tax = (
        ZERO
        if terms.tax_exempt
        else sum(
            (
                gain * tax_rate((as_of - lot.opened).days)
                for lot, gain in gains
                if gain > ZERO
            ),
            ZERO,
        )
    )
    # Cada lote rende desde o dia útil anterior ou desde que foi aberto, o que for
    # mais recente: a aplicação do dia entra no saldo sem contar como ganho
    previous = business.previous(as_of)
    day_change = (
        sum(
            (lot.units * (now - factor(max(previous, lot.opened))) for lot in lots),
            ZERO,
        )
        if as_of == today
        else ZERO
    )
    return Marking(
        invested=sum((lot.principal for lot in lots), ZERO),
        gross_value=sum((lot.units * now for lot in lots), ZERO),
        estimated_tax=estimated_tax,
        day_change=day_change,
        as_of=as_of,
        series_date=series_date,
    )
