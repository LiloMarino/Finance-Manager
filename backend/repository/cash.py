from __future__ import annotations

from collections.abc import Iterator
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import CashEntryKind, FixedIncomeMovementType, OperationType
from backend.core.models.models import (
    CashBalanceCheck,
    CashSettings,
    CashWithdrawal,
    FixedIncomeInvestment,
)
from backend.domain.cash import CashCheck, CashEvent, CashLedger, ledger
from backend.domain.fixed_income import payouts
from backend.repository.fixed_income import investment_terms, movements_by_investment
from backend.repository.income import income_records
from backend.repository.market import index_rates
from backend.repository.operations import operation_records

TRADE_KINDS = {
    OperationType.BUY: CashEntryKind.PURCHASE,
    OperationType.SELL: CashEntryKind.SALE,
}


def cash_settings(session: Session) -> CashSettings:
    """A linha única que a migration cria."""
    found = session.get(CashSettings, 1)
    if found is None:
        raise LookupError("cash_settings sem a linha da migration.")
    return found


def _trades(session: Session) -> Iterator[CashEvent]:
    """Compra e venda pelo valor da operação; os eventos corporativos não mexem no
    dinheiro."""
    for record in operation_records(session):
        kind = TRADE_KINDS.get(record.operation_type)
        if kind is None:
            continue
        value = record.quantity * record.unit_price
        signed = value if kind is CashEntryKind.SALE else -value
        yield CashEvent(
            event_date=record.operation_date,
            kind=kind,
            label=record.ticker,
            amount=signed,
            flow=signed,
        )


def _income(session: Session) -> Iterator[CashEvent]:
    for income in income_records(session):
        yield CashEvent(
            event_date=income.payment_date,
            kind=CashEntryKind.INCOME,
            label=income.ticker,
            amount=income.amount,
            flow=Decimal(0),
        )


def _fixed_income(session: Session, today: date) -> Iterator[CashEvent]:
    """A aplicação sai pelo bruto; o resgate entra pelo líquido, e o fluxo dele é o
    bruto, que é a saída da linha do título."""
    rates = index_rates(session)
    by_investment = movements_by_investment(session)
    for investment in session.scalars(
        select(FixedIncomeInvestment).where(FixedIncomeInvestment.id.in_(by_investment))
    ):
        movements = by_investment[investment.id]
        for movement in movements:
            if movement.movement_type is FixedIncomeMovementType.APPLICATION:
                yield CashEvent(
                    event_date=movement.movement_date,
                    kind=CashEntryKind.APPLICATION,
                    label=investment.label,
                    amount=-movement.amount,
                    flow=-movement.amount,
                )
        for payout in payouts(investment_terms(investment), movements, rates, today):
            yield CashEvent(
                event_date=payout.payout_date,
                kind=(
                    CashEntryKind.MATURITY
                    if payout.at_maturity
                    else CashEntryKind.REDEMPTION
                ),
                label=investment.label,
                amount=payout.net,
                flow=payout.gross,
            )


def _withdrawals(session: Session) -> Iterator[CashEvent]:
    for withdrawal in session.scalars(select(CashWithdrawal)):
        yield CashEvent(
            event_date=withdrawal.withdrawal_date,
            kind=CashEntryKind.WITHDRAWAL,
            label=None,
            amount=-withdrawal.amount,
            flow=-withdrawal.amount,
            record_id=withdrawal.id,
        )


def cash_ledger(session: Session, today: date) -> CashLedger | None:
    """O extrato do saldo até `today`; nulo antes da primeira conferência. O
    `ledger` descarta o que é da abertura para trás."""
    checks = [
        CashCheck(check_id=check.id, check_date=check.check_date, balance=check.balance)
        for check in session.scalars(
            select(CashBalanceCheck).where(CashBalanceCheck.check_date <= today)
        )
    ]
    if not checks:
        return None
    events = [
        event
        for event in (
            *_trades(session),
            *_income(session),
            *_fixed_income(session, today),
            *_withdrawals(session),
        )
        if event.event_date <= today
    ]
    return ledger(checks, events)
