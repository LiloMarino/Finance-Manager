from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO, DecimalStr
from backend.core.enum import IndexSeries, PortfolioCategory
from backend.features.performance.service import monthly_performance, performance

router = APIRouter(prefix="/api/performance", tags=["performance"])


class ReturnPointDTO(BaseDTO):
    day: date
    cumulative_return: DecimalStr


class BenchmarkReturnDTO(BaseDTO):
    """A referência no mesmo período e nos mesmos dias da carteira, recomeçando do
    zero na base dele. Depois de `data_until`, o último valor da série se repete."""

    series: IndexSeries
    period: DecimalStr | None
    data_until: date | None
    points: list[ReturnPointDTO]


class PerformanceDTO(BaseDTO):
    """Retornos em fração (0,1 é 10%), pela variação da cota, sem contar aportes e
    resgates. `start` é o dia cujo fechamento é a base do período, nulo quando ele
    começa com a carteira, e os pontos acumulam desde essa base. Os retornos
    recentes contam até hoje e são nulos quando a carteira é mais nova que eles.
    `cdi_share` é o retorno do período sobre o do CDI: 1,2 é 120% do CDI."""

    first_date: date | None
    start: date | None
    end: date | None
    since_inception: DecimalStr | None
    period: DecimalStr | None
    last_6_months: DecimalStr | None
    last_12_months: DecimalStr | None
    last_24_months: DecimalStr | None
    points: list[ReturnPointDTO]
    cdi_share: DecimalStr | None
    benchmarks: list[BenchmarkReturnDTO]


class YearReturnsDTO(BaseDTO):
    """`months` tem 12 posições, de janeiro a dezembro, nulas fora da série."""

    year: int
    months: list[DecimalStr | None]
    year_return: DecimalStr
    accumulated: DecimalStr


class BenchmarkYearsDTO(BaseDTO):
    series: IndexSeries
    years: list[YearReturnsDTO]


class MonthReturnDTO(BaseDTO):
    year: int
    month: int
    value: DecimalStr


class MonthlyPerformanceDTO(BaseDTO):
    """Retornos em fração, de fechamento a fechamento de cada mês. As contagens são
    dos meses da carteira, de um total de `months`."""

    years: list[YearReturnsDTO]
    benchmarks: list[BenchmarkYearsDTO]
    best_month: MonthReturnDTO | None
    worst_month: MonthReturnDTO | None
    months: int
    positive_months: int
    negative_months: int


@router.get("")
def get_performance(
    session: SessionDep,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
) -> PerformanceDTO:
    return PerformanceDTO.model_validate(
        performance(
            session,
            date.today(),
            category=category,
            asset_id=asset_id,
            start=start,
            end=end,
        )
    )


@router.get("/monthly")
def get_monthly_performance(
    session: SessionDep,
    category: PortfolioCategory | None = None,
    asset_id: int | None = None,
) -> MonthlyPerformanceDTO:
    return MonthlyPerformanceDTO.model_validate(
        monthly_performance(session, date.today(), category=category, asset_id=asset_id)
    )
