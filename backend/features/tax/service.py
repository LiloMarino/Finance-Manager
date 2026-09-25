from __future__ import annotations

import calendar
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.enum import IndexSeries
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, DarfPayment
from backend.domain.business_days import BusinessCalendar
from backend.domain.position import current_positions
from backend.domain.tax import MonthlyTax, assess, darf_status
from backend.features.tax.dto import (
    CategoryResultDTO,
    DarfPaymentDTO,
    DarfPaymentInDTO,
    MonthlyTaxDTO,
    PeriodPositionDTO,
    PeriodReportDTO,
    PoolResultDTO,
)
from backend.repository.market import index_rates
from backend.repository.operations import operation_records
from backend.repository.tickers import ticker_history


class TaxPeriodNotFoundError(FinanceError):
    status = 404


def assessments(session: Session, today: date) -> list[MonthlyTax]:
    classes = {
        ticker: asset_class
        for ticker, asset_class in session.execute(
            select(Asset.ticker, Asset.asset_class)
        ).tuples()
    }
    business = BusinessCalendar(index_rates(session)[IndexSeries.CDI])
    return assess(operation_records(session), classes, today, business)


def payments(session: Session) -> dict[tuple[int, int], DarfPayment]:
    return {
        (payment.year, payment.month): payment
        for payment in session.scalars(select(DarfPayment))
    }


def _monthly_dto(
    assessment: MonthlyTax, payment: DarfPayment | None, today: date
) -> MonthlyTaxDTO:
    return MonthlyTaxDTO(
        year=assessment.year,
        month=assessment.month,
        categories=[
            CategoryResultDTO.model_validate(category)
            for category in assessment.categories
        ],
        stock_sales=assessment.stock_sales,
        exempt_profit=assessment.exempt_profit,
        pools=[PoolResultDTO.model_validate(pool) for pool in assessment.pools],
        gross_result=assessment.gross_result,
        compensated=assessment.compensated,
        taxable=assessment.taxable,
        tax=assessment.tax,
        carried_before=assessment.carried_before,
        carried_after=assessment.carried_after,
        darf_amount=assessment.darf_amount,
        due_date=assessment.due_date,
        payment=DarfPaymentDTO.model_validate(payment) if payment else None,
        status=darf_status(assessment, payment is not None, today),
    )


def list_months(session: Session, today: date) -> list[MonthlyTaxDTO]:
    paid = payments(session)
    return [
        _monthly_dto(assessment, paid.get((assessment.year, assessment.month)), today)
        for assessment in assessments(session, today)
    ]


def positions_at(session: Session, day: date) -> list[PeriodPositionDTO]:
    """Posições com quantidade no fim de `day`, por classe e pelo ticker vigente
    nesse dia."""
    positions = current_positions(
        op for op in operation_records(session) if op.operation_date <= day
    )
    history = ticker_history(session)
    items = [
        PeriodPositionDTO(
            asset_id=asset.id,
            ticker=history.on(asset.id, day, asset.ticker),
            asset_class=asset.asset_class,
            quantity=position.quantity,
            average_price=position.average_price,
            total_cost=position.total_cost,
        )
        for asset in session.scalars(select(Asset).where(Asset.ticker.in_(positions)))
        if (position := positions[asset.ticker]).quantity != 0
    ]
    return sorted(items, key=lambda item: (item.asset_class, item.ticker))


def period_report(
    session: Session, year: int, month: int | None, today: date
) -> PeriodReportDTO:
    """O mês, ou o ano inteiro quando `month` é nulo."""
    start = date(year, month or 1, 1)
    last_month = month or 12
    end = date(year, last_month, calendar.monthrange(year, last_month)[1])
    return PeriodReportDTO(
        start=start,
        end=end,
        opening=positions_at(session, start - timedelta(days=1)),
        closing=positions_at(session, end),
        months=[
            item
            for item in list_months(session, today)
            if item.year == year and (month is None or item.month == month)
        ],
    )


def _assessed_month(session: Session, year: int, month: int, today: date) -> MonthlyTax:
    for assessment in assessments(session, today):
        if (assessment.year, assessment.month) == (year, month):
            return assessment
    raise TaxPeriodNotFoundError(f"Não há apuração em {month:02d}/{year}.")


def _payment(session: Session, year: int, month: int) -> DarfPayment | None:
    return session.scalar(
        select(DarfPayment).where(DarfPayment.year == year, DarfPayment.month == month)
    )


def save_payment(
    session: Session, year: int, month: int, payload: DarfPaymentInDTO, today: date
) -> MonthlyTaxDTO:
    """Registra o DARF pago do mês, ou corrige o que já estava registrado. Vale para
    qualquer mês apurado, inclusive um DARF pago que a apuração não pede."""
    assessment = _assessed_month(session, year, month, today)
    payment = _payment(session, year, month)
    if payment is None:
        payment = DarfPayment(
            year=year, month=month, paid_on=payload.paid_on, amount=payload.amount
        )
        session.add(payment)
    else:
        payment.paid_on = payload.paid_on
        payment.amount = payload.amount
    session.commit()
    return _monthly_dto(assessment, payment, today)


def delete_payment(session: Session, year: int, month: int) -> None:
    payment = _payment(session, year, month)
    if payment is None:
        raise TaxPeriodNotFoundError(
            f"Não há DARF pago registrado em {month:02d}/{year}."
        )
    session.delete(payment)
    session.commit()
