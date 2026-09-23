from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from backend.core.database.session import SessionDep
from backend.features.tax.dto import (
    DarfPaymentInDTO,
    IrpfReportDTO,
    MonthlyTaxDTO,
    PeriodReportDTO,
)
from backend.features.tax.irpf import irpf_report
from backend.features.tax.service import (
    delete_payment,
    list_months,
    period_report,
    save_payment,
)

router = APIRouter(prefix="/api/tax", tags=["tax"])

Month = Annotated[int, Path(ge=1, le=12)]


@router.get("/months")
def list_all_months(session: SessionDep) -> list[MonthlyTaxDTO]:
    return list_months(session, date.today())


@router.get("/period")
def get_period(
    session: SessionDep,
    year: int,
    month: Annotated[int | None, Query(ge=1, le=12)] = None,
) -> PeriodReportDTO:
    return period_report(session, year, month, date.today())


@router.put("/darf/{year}/{month}/payment")
def put_payment(
    session: SessionDep, year: int, month: Month, payload: DarfPaymentInDTO
) -> MonthlyTaxDTO:
    return save_payment(session, year, month, payload, date.today())


@router.delete("/darf/{year}/{month}/payment", status_code=status.HTTP_204_NO_CONTENT)
def remove_payment(session: SessionDep, year: int, month: Month) -> None:
    delete_payment(session, year, month)


@router.get("/irpf/{year}")
def get_irpf(session: SessionDep, year: int) -> IrpfReportDTO:
    return irpf_report(session, year, date.today())
