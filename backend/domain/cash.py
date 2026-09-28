"""Saldo de investimento: o dinheiro que entrou por venda, provento ou resgate e ainda
não voltou para um ativo, derivado a cada consulta.

O saldo nasce na primeira conferência com o extrato, que vale como o saldo no fim
daquele dia: os eventos até ele já estão dentro. Cada conferência seguinte substitui
o saldo derivado, e a diferença é um ajuste vindo de fora. O saldo nunca fica
negativo: o que a compra passa dele é aporte de fora.

`flow` é o que o evento conta na série diária. Venda, resgate, compra e aplicação
espelham, com o sinal trocado, o fluxo da linha do ativo ou do título, e por isso a
soma dos fluxos de todas as linhas é só o dinheiro de fora. O que muda o saldo sem
fluxo, como o provento e o imposto retido no resgate, é ganho ou custo.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from backend.core.enum import CashEntryKind, PortfolioCategory
from backend.domain.daily_series import ZERO, DailyLine, flow_index


@dataclass(frozen=True, slots=True, kw_only=True)
class CashEvent:
    """`amount` é o efeito no saldo e `flow` o fluxo na série, os dois com sinal.
    `record_id` é a linha gravada que o gerou, quando ela é do saldo (o saque)."""

    event_date: date
    kind: CashEntryKind
    label: str | None
    amount: Decimal
    flow: Decimal
    record_id: int | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class CashCheck:
    """O saldo do extrato no fim de `check_date`."""

    check_id: int
    check_date: date
    balance: Decimal


@dataclass(frozen=True, slots=True, kw_only=True)
class CashEntry:
    """Uma linha do extrato derivado, com o saldo depois dela."""

    entry_date: date
    kind: CashEntryKind
    label: str | None
    amount: Decimal
    flow: Decimal
    balance: Decimal
    record_id: int | None


@dataclass(frozen=True, slots=True, kw_only=True)
class CashLedger:
    opened_on: date
    entries: list[CashEntry]

    @property
    def balance(self) -> Decimal:
        return self.entries[-1].balance


def _entry(event: CashEvent, balance: Decimal) -> CashEntry:
    return CashEntry(
        entry_date=event.event_date,
        kind=event.kind,
        label=event.label,
        amount=event.amount,
        flow=event.flow,
        balance=balance,
        record_id=event.record_id,
    )


def ledger(
    checks: Sequence[CashCheck], events: Iterable[CashEvent]
) -> CashLedger | None:
    """O extrato da abertura em diante; sem conferência, não há saldo.

    Em cada dia, as entradas vêm antes das saídas, e o aporte de fora entra entre
    elas: o saldo de cada linha nunca fica negativo. A conferência fecha o dia."""
    if not checks:
        return None
    ordered = sorted(checks, key=lambda check: check.check_date)
    opening = ordered[0]
    by_day: defaultdict[date, list[CashEvent]] = defaultdict(list)
    for event in events:
        if event.event_date > opening.check_date:
            by_day[event.event_date].append(event)
    later_checks = {check.check_date: check for check in ordered[1:]}

    balance = opening.balance
    entries = [
        CashEntry(
            entry_date=opening.check_date,
            kind=CashEntryKind.OPENING,
            label=None,
            amount=balance,
            flow=balance,
            balance=balance,
            record_id=opening.check_id,
        )
    ]
    for day in sorted(set(by_day) | set(later_checks)):
        found = by_day[day]
        incoming = [event for event in found if event.amount >= 0]
        outgoing = [event for event in found if event.amount < 0]
        for event in incoming:
            balance += event.amount
            entries.append(_entry(event, balance))

        shortfall = -(balance + sum((event.amount for event in outgoing), ZERO))
        if shortfall > 0:
            balance += shortfall
            entries.append(
                CashEntry(
                    entry_date=day,
                    kind=CashEntryKind.DEPOSIT,
                    label=None,
                    amount=shortfall,
                    flow=shortfall,
                    balance=balance,
                    record_id=None,
                )
            )
        for event in outgoing:
            balance += event.amount
            entries.append(_entry(event, balance))

        check = later_checks.get(day)
        if check is not None:
            difference = check.balance - balance
            balance = check.balance
            entries.append(
                CashEntry(
                    entry_date=day,
                    kind=CashEntryKind.CHECK,
                    label=None,
                    amount=difference,
                    flow=difference,
                    balance=balance,
                    record_id=check.check_id,
                )
            )
    return CashLedger(opened_on=opening.check_date, entries=entries)


def cash_line(days: Sequence[date], found: CashLedger) -> DailyLine:
    """A linha do saldo na série diária: o saldo no fim de cada dia, zero antes da
    abertura, e os fluxos de cada linha do extrato no dia em que ela entra."""
    count = len(days)
    values = [ZERO] * count
    inflows = [ZERO] * count
    outflows = [ZERO] * count
    for entry in found.entries:
        index = flow_index(days, entry.entry_date)
        if entry.flow > 0:
            inflows[index] += entry.flow
        elif entry.flow < 0:
            outflows[index] -= entry.flow

    balance = ZERO
    cursor = 0
    for index, day in enumerate(days):
        while cursor < len(found.entries) and found.entries[cursor].entry_date <= day:
            balance = found.entries[cursor].balance
            cursor += 1
        values[index] = balance
    return DailyLine(
        category=PortfolioCategory.CASH,
        asset_id=None,
        investment_id=None,
        values=values,
        inflows=inflows,
        outflows=outflows,
        income=[ZERO] * count,
    )
