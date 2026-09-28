from __future__ import annotations

from datetime import date

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.cash.dto import (
    CashCheckInDTO,
    CashDTO,
    CashSettingsInDTO,
    CashWithdrawalInDTO,
)
from backend.features.cash.service import (
    add_check,
    add_withdrawal,
    delete_check,
    delete_withdrawal,
    get_cash,
    update_settings,
)

router = APIRouter(prefix="/api/cash", tags=["cash"])


@router.get("")
def get(session: SessionDep) -> CashDTO:
    return get_cash(session, date.today())


@router.post("/checks", status_code=status.HTTP_204_NO_CONTENT)
def create_check(session: SessionDep, payload: CashCheckInDTO) -> None:
    add_check(session, payload, date.today())


@router.delete("/checks/{check_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_check(session: SessionDep, check_id: int) -> None:
    delete_check(session, check_id)


@router.post("/withdrawals", status_code=status.HTTP_204_NO_CONTENT)
def create_withdrawal(session: SessionDep, payload: CashWithdrawalInDTO) -> None:
    add_withdrawal(session, payload, date.today())


@router.delete("/withdrawals/{withdrawal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_withdrawal(session: SessionDep, withdrawal_id: int) -> None:
    delete_withdrawal(session, withdrawal_id)


@router.put("/settings", status_code=status.HTTP_204_NO_CONTENT)
def put_settings(session: SessionDep, payload: CashSettingsInDTO) -> None:
    update_settings(session, payload)
