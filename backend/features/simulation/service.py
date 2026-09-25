from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.domain.comparison import Option, compare
from backend.domain.fixed_income import FixedIncomeTerms
from backend.domain.installments import (
    CURVE_INSTALLMENTS,
    Purchase,
    simulate,
)
from backend.domain.projection import Assumptions, current_rates, project
from backend.features.simulation.dto import (
    BalancePointDTO,
    BreakEvenRateDTO,
    ComparisonDTO,
    ComparisonInDTO,
    ComparisonPointDTO,
    ComparisonResultDTO,
    CurrentRatesDTO,
    CurvePointDTO,
    InstallmentsDTO,
    InstallmentsInDTO,
    InvestmentInDTO,
    ProjectionInDTO,
    WithdrawalDTO,
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


def _months_after(day: date, months: int) -> date:
    index = day.year * 12 + day.month - 1 + months
    return date(index // 12, index % 12 + 1, 1)


def simulate_installments(
    session: Session, payload: InstallmentsInDTO
) -> InstallmentsDTO:
    purchase = Purchase(
        mode=payload.mode,
        amount=payload.amount,
        installments=payload.installments,
        start=payload.start_date,
        first_due=payload.first_due_date,
        discount=payload.cash_discount,
    )
    # A curva de empate vai além do parcelamento informado: a série cobre o maior
    # último vencimento dela, com um mês de folga
    horizon = _months_after(
        payload.first_due_date, max(CURVE_INSTALLMENTS, payload.installments) + 1
    )
    rates = project(
        index_rates(session),
        _assumptions(payload.projection),
        payload.start_date,
        horizon,
    )
    simulation = simulate(purchase, _terms(payload.investment), rates)
    difference: Decimal | None = None
    if simulation.cash_leftover is not None:
        difference = abs(simulation.cash_leftover - simulation.installments_leftover)
    return InstallmentsDTO(
        total=simulation.total,
        cash_price=simulation.cash_price,
        withdrawals=[
            WithdrawalDTO(
                due_date=withdrawal.installment.due_date,
                withdrawn_on=withdrawal.withdrawn_on,
                amount=withdrawal.installment.amount,
                gross=withdrawal.redemption.gross,
                iof=withdrawal.redemption.iof,
                income_tax=withdrawal.redemption.income_tax,
            )
            for withdrawal in simulation.withdrawals
        ],
        installments_leftover=simulation.installments_leftover,
        cash_leftover=simulation.cash_leftover,
        winner=simulation.winner,
        difference=difference,
        break_even_discount=simulation.break_even_discount,
        break_even_rates=[
            BreakEvenRateDTO.model_validate(rate)
            for rate in simulation.break_even_rates
        ]
        if simulation.break_even_rates is not None
        else None,
        balance=[BalancePointDTO.model_validate(point) for point in simulation.balance],
        curve=[CurvePointDTO.model_validate(point) for point in simulation.curve],
    )
