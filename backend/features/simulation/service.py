from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.domain.comparison import Option, compare
from backend.domain.early_payment import (
    advance_or_keep,
    cash_or_advance,
    implied_rate,
)
from backend.domain.fixed_income import FixedIncomeTerms
from backend.domain.installments import (
    CURVE_INSTALLMENTS,
    Purchase,
    simulate,
)
from backend.domain.projection import Assumptions, current_rates, project
from backend.features.simulation.dto import (
    AdvancedInstallmentDTO,
    AdvanceDTO,
    AdvanceInDTO,
    AdvanceOrKeepDTO,
    BalancePointDTO,
    BankRateInDTO,
    BreakEvenRateDTO,
    CashOrAdvanceDTO,
    CashOrAdvanceInDTO,
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
                remaining=withdrawal.remaining,
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


def compare_cash_and_advance(payload: CashOrAdvanceInDTO) -> CashOrAdvanceDTO:
    comparison = cash_or_advance(
        price=payload.price,
        count=payload.installments,
        first_due=payload.first_due_date,
        cash_discount=payload.cash_discount,
        monthly_rate=payload.monthly_rate,
    )
    return CashOrAdvanceDTO(
        price=comparison.price,
        cash_price=comparison.cash_price,
        advanced_total=comparison.advanced_total,
        saved=comparison.saved,
        break_even_discount=comparison.break_even_discount,
        winner=comparison.winner,
        difference=comparison.difference,
        installments=[
            AdvancedInstallmentDTO(
                due_date=item.installment.due_date,
                amount=item.installment.amount,
                months_ahead=item.months_ahead,
                paid=item.paid,
                discount=item.discount,
            )
            for item in comparison.installments
        ],
    )


def compare_advance_and_keep(session: Session, payload: AdvanceInDTO) -> AdvanceDTO:
    discount = payload.bank_discount
    monthly_rate = (
        discount.monthly_rate
        if isinstance(discount, BankRateInDTO)
        else implied_rate(payload.amount, payload.installments, discount.bank_total)
    )
    rates = project(
        index_rates(session),
        _assumptions(payload.projection),
        payload.start_date,
        _months_after(payload.next_due_date, payload.installments + 1),
    )
    plan = advance_or_keep(
        amount=payload.amount,
        count=payload.installments,
        next_due=payload.next_due_date,
        start=payload.start_date,
        monthly_rate=monthly_rate,
        terms=_terms(payload.investment),
        rates=rates,
        chosen=payload.chosen,
    )
    earnings_rates = plan.earnings_rates
    return AdvanceDTO(
        current_due_date=plan.current.due_date,
        current_amount=plan.current.amount,
        monthly_rate=plan.monthly_rate,
        installments=[
            AdvanceOrKeepDTO(
                position=item.position,
                due_date=item.installment.due_date,
                amount=item.installment.amount,
                paid_today=item.paid_today,
                discount=item.discount,
                earnings=item.earnings,
                advance_wins=item.advance_wins,
                chosen=item.chosen,
            )
            for item in plan.installments
        ],
        chosen_count=len(plan.chosen),
        face=plan.face,
        paid_today=plan.paid_today,
        discount=plan.discount,
        earnings=plan.earnings,
        difference=plan.difference,
        recommended=plan.recommended,
        earnings_rate_low=earnings_rates[0] if earnings_rates else None,
        earnings_rate_high=earnings_rates[1] if earnings_rates else None,
    )
