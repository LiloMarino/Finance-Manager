from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from backend.domain.comparison import Option, compare
from backend.domain.fixed_income import FixedIncomeTerms
from backend.domain.projection import Assumptions, current_rates, project
from backend.features.simulation.dto import (
    ComparisonDTO,
    ComparisonInDTO,
    ComparisonPointDTO,
    ComparisonResultDTO,
    CurrentRatesDTO,
    InvestmentInDTO,
    ProjectionInDTO,
)
from backend.repository.market import index_rates

RATE_PLACES = Decimal("0.01")


def _assumptions(projection: ProjectionInDTO) -> Assumptions:
    return Assumptions(cdi=projection.cdi, selic=projection.selic, ipca=projection.ipca)


def _terms(investment: InvestmentInDTO) -> FixedIncomeTerms:
    return FixedIncomeTerms(
        product_type=investment.product_type,
        indexer=investment.indexer,
        rate=investment.rate,
        maturity_date=None,
    )


def _rounded(rate: Decimal | None) -> Decimal | None:
    return rate.quantize(RATE_PLACES) if rate is not None else None


def rates_now(session: Session) -> CurrentRatesDTO:
    """Em duas casas: é o valor que a tela oferece para editar."""
    current = current_rates(index_rates(session))
    return CurrentRatesDTO(
        cdi=_rounded(current.cdi),
        cdi_date=current.cdi_date,
        selic=_rounded(current.selic),
        selic_date=current.selic_date,
        ipca=_rounded(current.ipca),
        ipca_date=current.ipca_date,
    )


def compare_options(session: Session, payload: ComparisonInDTO) -> ComparisonDTO:
    if not payload.options:
        return ComparisonDTO(results=[], best=None, points=[])
    options = [
        Option(
            terms=_terms(option),
            amount=option.amount,
            applied_on=option.application_date,
            redeemed_on=option.redemption_date,
        )
        for option in payload.options
    ]
    rates = project(
        index_rates(session),
        _assumptions(payload.projection),
        min(option.applied_on for option in options),
        max(option.redeemed_on for option in options),
    )
    comparison = compare(options, rates)
    results = [
        ComparisonResultDTO(
            label=option.label,
            calendar_days=result.calendar_days,
            business_days=result.business_days,
            gross_value=result.redemption.gross,
            iof=result.redemption.iof,
            income_tax=result.redemption.income_tax,
            net_value=result.redemption.net,
            net_gain=result.redemption.net - option.amount,
            income_tax_rate=result.income_tax_rate,
            iof_rate=result.iof_rate,
            net_annual_return=result.net_annual_return,
            cdi_equivalent=result.cdi_equivalent,
        )
        for option, result in zip(payload.options, comparison.results, strict=True)
    ]
    best = max(
        range(len(results)), key=lambda index: comparison.results[index].redemption.net
    )
    return ComparisonDTO(
        results=results,
        best=best,
        points=[
            ComparisonPointDTO(day=point.day, net_values=point.net_values)
            for point in comparison.points
        ],
    )
