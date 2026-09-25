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
ONE = Decimal(1)

# IR regressivo: até N dias corridos da aplicação, a alíquota ao lado
TAX_BRACKETS = (
    (180, Decimal("0.225")),
    (360, Decimal("0.20")),
    (720, Decimal("0.175")),
)
LONG_TERM_TAX = Decimal("0.15")

# IOF regressivo sobre o rendimento: no dia N corrido da aplicação, o N-ésimo valor;
# do dia 30 em diante, zero
IOF_TABLE = tuple(
    Decimal(percent) / 100
    for percent in (
        *(96, 93, 90, 86, 83, 80, 76, 73, 70, 66),
        *(63, 60, 56, 53, 50, 46, 43, 40, 36, 33),
        *(30, 26, 23, 20, 16, 13, 10, 6, 3),
    )
)

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


def terms_problem(
    product_type: FixedIncomeType, indexer: Indexer, rate: Decimal
) -> str | None:
    """O motivo de os termos não fecharem, ou nulo. Na Selic, `rate` é o spread,
    que pode ser zero ou negativo; nos outros indexadores, é maior que zero."""
    treasury = TREASURY_INDEXER.get(product_type)
    if treasury is not None and indexer is not treasury:
        return "O título do Tesouro tem o indexador do próprio nome."
    if indexer is not Indexer.SELIC and rate <= 0:
        return "A taxa deve ser maior que zero."
    return None


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


def iof_rate(days: int) -> Decimal:
    if days >= len(IOF_TABLE) + 1:
        return ZERO
    return IOF_TABLE[max(days, 1) - 1]


@dataclass(frozen=True, slots=True, kw_only=True)
class Redemption:
    """Um resgate: o IR incide sobre o rendimento menos o IOF."""

    gross: Decimal
    iof: Decimal
    income_tax: Decimal

    @property
    def net(self) -> Decimal:
        return self.gross - self.iof - self.income_tax


class Application:
    """Uma aplicação só, resgatada de uma vez ou aos poucos. O fator acumulado vale 1
    no dia da aplicação, então cada real bruto resgatado no dia `t` carrega o ganho
    `1 - 1/F(t)`, com o IOF e o IR da idade da aplicação. Depois do vencimento, ou de
    `until`, o título para de render."""

    def __init__(
        self,
        terms: FixedIncomeTerms,
        applied_on: date,
        rates: Mapping[IndexSeries, Sequence[DailyRate]],
        until: date,
    ) -> None:
        end = min(until, terms.maturity_date) if terms.maturity_date else until
        business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
        self._terms = terms
        self._applied_on = applied_on
        self.factor = accumulation(
            daily_factor(terms.indexer, terms.rate, rates, business), applied_on, end
        )

    def _rates(self, day: date) -> tuple[Decimal, Decimal]:
        days = (day - self._applied_on).days
        income = ZERO if self._terms.tax_exempt else tax_rate(days)
        return iof_rate(days), income

    def redeem(self, gross: Decimal, day: date) -> Redemption:
        gain = gross * (ONE - ONE / self.factor(day))
        if gain <= ZERO:
            return Redemption(gross=gross, iof=ZERO, income_tax=ZERO)
        iof, income = self._rates(day)
        iof_amount = gain * iof
        return Redemption(
            gross=gross, iof=iof_amount, income_tax=(gain - iof_amount) * income
        )

    def value_at(self, amount: Decimal, day: date) -> Redemption:
        """O resgate total, no dia, de `amount` aplicado."""
        return self.redeem(amount * self.factor(day), day)

    def gross_for_net(self, net: Decimal, day: date) -> Decimal:
        """O bruto que, resgatado no dia, deixa `net` depois do IOF e do IR."""
        gain_share = ONE - ONE / self.factor(day)
        if gain_share <= ZERO:
            return net
        iof, income = self._rates(day)
        return net / (ONE - gain_share * (iof + income * (ONE - iof)))


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
