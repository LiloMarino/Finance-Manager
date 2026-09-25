from __future__ import annotations

from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Query, status

from backend.core.database.session import SessionDep
from backend.core.enum import IncomeType, PortfolioCategory
from backend.features.income.dto import (
    IncomeDistributionDTO,
    IncomeEventDTO,
    IncomeEventInDTO,
    IncomeListDTO,
    IncomePerformanceDTO,
)
from backend.features.income.service import (
    create_income,
    delete_income,
    income_distribution,
    income_performance,
    list_income,
    update_income,
)

router = APIRouter(prefix="/api/income", tags=["income"])


@router.get("")
def list_all(
    session: SessionDep,
    asset_id: int | None = None,
    category: PortfolioCategory | None = None,
    income_type: IncomeType | None = None,
    start: date | None = None,
    end: date | None = None,
) -> IncomeListDTO:
    return list_income(
        session,
        asset_id=asset_id,
        category=category,
        income_type=income_type,
        start=start,
        end=end,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: IncomeEventInDTO) -> IncomeEventDTO:
    return create_income(session, payload)


@router.put("/{income_id}")
def update(
    session: SessionDep, income_id: int, payload: IncomeEventInDTO
) -> IncomeEventDTO:
    return update_income(session, income_id, payload)


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, income_id: int) -> None:
    delete_income(session, income_id)


@router.get("/performance")
def get_performance(
    session: SessionDep,
    group: Literal["month", "year"] = "month",
    start: date | None = None,
    end: date | None = None,
) -> IncomePerformanceDTO:
    return income_performance(
        session, date.today(), by_year=group == "year", start=start, end=end
    )


@router.get("/distribution")
def get_distribution(
    session: SessionDep, months: Annotated[int, Query(ge=1)] = 12
) -> IncomeDistributionDTO:
    return income_distribution(session, date.today(), months)
