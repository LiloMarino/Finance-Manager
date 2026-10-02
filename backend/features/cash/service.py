from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import CashBalanceCheck, CashWithdrawal
from backend.features.cash.dto import (
    CashCheckInDTO,
    CashDTO,
    CashEntryDTO,
    CashSettingsInDTO,
    CashWithdrawalInDTO,
)
from backend.repository.cash import cash_ledger, cash_settings


class CashNotFoundError(FinanceError):
    status = 404


class CashConflictError(FinanceError):
    status = 409


class InvalidCashDateError(FinanceError):
    status = 422


def _check_not_future(day: date, today: date) -> None:
    if day > today:
        raise InvalidCashDateError("A data não pode ser futura.")


def get_cash(session: Session, today: date) -> CashDTO:
    found = cash_ledger(session, today)
    threshold = cash_settings(session).alert_threshold
    if found is None:
        return CashDTO(
            opened_on=None,
            balance=None,
            alert_threshold=threshold,
            above_threshold=False,
            above_since=None,
            entries=[],
        )
    return CashDTO(
        opened_on=found.opened_on,
        balance=found.balance,
        alert_threshold=threshold,
        above_threshold=found.balance > threshold,
        above_since=found.above_since(threshold),
        entries=[
            CashEntryDTO(
                entry_date=entry.entry_date,
                kind=entry.kind,
                label=entry.label,
                amount=entry.amount,
                balance=entry.balance,
                record_id=entry.record_id,
            )
            for entry in reversed(found.entries)
        ],
    )


def add_check(session: Session, payload: CashCheckInDTO, today: date) -> None:
    _check_not_future(payload.check_date, today)
    if session.scalar(
        select(CashBalanceCheck.id).where(
            CashBalanceCheck.check_date == payload.check_date
        )
    ):
        raise CashConflictError(
            f"Já existe uma conferência em {payload.check_date:%d/%m/%Y}."
        )
    session.add(
        CashBalanceCheck(check_date=payload.check_date, balance=payload.balance)
    )
    session.commit()


def delete_check(session: Session, check_id: int) -> None:
    """Apagar a primeira conferência passa a abertura para a seguinte."""
    found = session.get(CashBalanceCheck, check_id)
    if found is None:
        raise CashNotFoundError("Conferência não encontrada.")
    session.delete(found)
    session.commit()


def add_withdrawal(session: Session, payload: CashWithdrawalInDTO, today: date) -> None:
    """O saque é do saldo aberto: vem depois do dia da abertura, que já fecha com o
    saldo do extrato."""
    _check_not_future(payload.withdrawal_date, today)
    opened_on = session.scalar(
        select(CashBalanceCheck.check_date)
        .order_by(CashBalanceCheck.check_date)
        .limit(1)
    )
    if opened_on is None:
        raise InvalidCashDateError(
            "O saldo ainda não foi aberto: registre antes a conferência com o extrato."
        )
    if payload.withdrawal_date <= opened_on:
        raise InvalidCashDateError(
            f"O saldo abre em {opened_on:%d/%m/%Y}: o saque vem depois desse dia."
        )
    session.add(
        CashWithdrawal(withdrawal_date=payload.withdrawal_date, amount=payload.amount)
    )
    session.commit()


def delete_withdrawal(session: Session, withdrawal_id: int) -> None:
    found = session.get(CashWithdrawal, withdrawal_id)
    if found is None:
        raise CashNotFoundError("Saque não encontrado.")
    session.delete(found)
    session.commit()


def update_settings(session: Session, payload: CashSettingsInDTO) -> None:
    cash_settings(session).alert_threshold = payload.alert_threshold
    session.commit()
