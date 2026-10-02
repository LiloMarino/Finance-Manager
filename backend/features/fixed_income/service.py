from __future__ import annotations

from collections.abc import Sequence
from datetime import date
from decimal import Decimal

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from backend.core.enum import FixedIncomeMovementType, FixedIncomeType
from backend.core.errors import FinanceError
from backend.core.models.models import FixedIncomeInvestment, FixedIncomeMovement
from backend.features.fixed_income.dto import (
    FixedIncomeCreateDTO,
    FixedIncomeDetailDTO,
    FixedIncomeDTO,
    FixedIncomeInDTO,
    FixedIncomeSummaryDTO,
    FixedIncomeTotalsDTO,
    FixedIncomeTypeTotalsDTO,
    MovementDTO,
    MovementInDTO,
)
from backend.repository.fixed_income import MarkedInvestment, marked_investments
from backend.repository.subportfolios import check_subportfolio

ZERO = Decimal(0)


class InvestmentNotFoundError(FinanceError):
    status = 404


class InvestmentConflictError(FinanceError):
    status = 409


class MovementOrderError(FinanceError):
    status = 422


def _investment(session: Session, investment_id: int) -> FixedIncomeInvestment:
    investment = session.get(FixedIncomeInvestment, investment_id)
    if investment is None:
        raise InvestmentNotFoundError("Título não encontrado.")
    return investment


def _ensure_unique_label(
    session: Session, label: str, investment_id: int | None = None
) -> None:
    clash = session.scalar(
        select(FixedIncomeInvestment.id).where(FixedIncomeInvestment.label == label)
    )
    if clash is not None and clash != investment_id:
        raise InvestmentConflictError(f"Já existe um título {label}.")


def _check_starts_with_application(session: Session, investment_id: int) -> None:
    """Um título começa por uma aplicação: resgate antes dela não tem de onde sair.
    Roda antes do commit de toda escrita em movimentação."""
    session.flush()
    first = session.scalar(
        select(FixedIncomeMovement.movement_type)
        .where(FixedIncomeMovement.investment_id == investment_id)
        .order_by(FixedIncomeMovement.movement_date, FixedIncomeMovement.id)
        .limit(1)
    )
    if first is FixedIncomeMovementType.REDEMPTION:
        raise MovementOrderError("A primeira movimentação do título é uma aplicação.")


def _check_before_maturity(session: Session, investment_id: int) -> None:
    """O vencimento resgata o título inteiro, então toda movimentação vem até ele.
    Roda antes do commit de toda escrita em movimentação e no vencimento."""
    session.flush()
    maturity = session.scalar(
        select(FixedIncomeInvestment.maturity_date).where(
            FixedIncomeInvestment.id == investment_id
        )
    )
    if maturity is None:
        return
    late = session.scalar(
        select(
            exists().where(
                FixedIncomeMovement.investment_id == investment_id,
                FixedIncomeMovement.movement_date > maturity,
            )
        )
    )
    if late:
        raise MovementOrderError(
            f"O título vence em {maturity:%d/%m/%Y}: o resgate é automático no "
            "vencimento, e nenhuma movimentação vem depois dele."
        )


def list_investments(session: Session, today: date) -> list[FixedIncomeDTO]:
    return [
        FixedIncomeDTO.model_validate(investment)
        for investment in marked_investments(session, today)
    ]


def _totals(investments: Sequence[MarkedInvestment]) -> FixedIncomeTotalsDTO:
    invested = sum((item.invested for item in investments), ZERO)
    gross = sum((item.gross_value for item in investments), ZERO)
    return FixedIncomeTotalsDTO(
        count=len(investments),
        invested=invested,
        gross_value=gross,
        estimated_tax=sum((item.estimated_tax for item in investments), ZERO),
        net_value=sum((item.net_value for item in investments), ZERO),
        gross_result=gross - invested,
        gross_return=(gross - invested) / invested if invested else None,
    )


def summarize_investments(session: Session, today: date) -> FixedIncomeSummaryDTO:
    active = [item for item in marked_investments(session, today) if not item.matured]
    by_type: list[FixedIncomeTypeTotalsDTO] = []
    for product_type in FixedIncomeType:
        group = [item for item in active if item.product_type is product_type]
        if group:
            totals = _totals(group)
            by_type.append(
                FixedIncomeTypeTotalsDTO(
                    product_type=product_type,
                    count=totals.count,
                    invested=totals.invested,
                    gross_value=totals.gross_value,
                    estimated_tax=totals.estimated_tax,
                    net_value=totals.net_value,
                    gross_result=totals.gross_result,
                    gross_return=totals.gross_return,
                )
            )
    total = _totals(active)
    daily = _totals([item for item in active if item.daily_liquidity])
    locked = _totals([item for item in active if not item.daily_liquidity])
    return FixedIncomeSummaryDTO(
        total=total,
        by_type=by_type,
        daily_liquidity=daily,
        at_maturity=locked,
        daily_share=(
            daily.gross_value / total.gross_value if total.gross_value else None
        ),
        at_maturity_share=(
            locked.gross_value / total.gross_value if total.gross_value else None
        ),
    )


def get_investment(
    session: Session, investment_id: int, today: date
) -> FixedIncomeDetailDTO:
    """O título marcado, com as movimentações das mais recentes para as antigas."""
    _investment(session, investment_id)
    [marked] = marked_investments(session, today, investment_id)
    movements = session.scalars(
        select(FixedIncomeMovement)
        .where(FixedIncomeMovement.investment_id == investment_id)
        .order_by(
            FixedIncomeMovement.movement_date.desc(), FixedIncomeMovement.id.desc()
        )
    )
    return FixedIncomeDetailDTO(
        **FixedIncomeDTO.model_validate(marked).model_dump(),
        movements=[MovementDTO.model_validate(movement) for movement in movements],
    )


def create_investment(
    session: Session, payload: FixedIncomeCreateDTO, today: date
) -> FixedIncomeDetailDTO:
    """O título e a primeira aplicação entram no mesmo commit."""
    _ensure_unique_label(session, payload.label)
    check_subportfolio(session, payload.subportfolio_id)
    investment = FixedIncomeInvestment(
        label=payload.label,
        product_type=payload.product_type,
        indexer=payload.indexer,
        rate=payload.rate,
        maturity_date=payload.maturity_date,
        daily_liquidity=payload.daily_liquidity,
        subportfolio_id=payload.subportfolio_id,
    )
    session.add(investment)
    session.flush()
    session.add(
        FixedIncomeMovement(
            investment_id=investment.id,
            movement_date=payload.application.movement_date,
            movement_type=FixedIncomeMovementType.APPLICATION,
            amount=payload.application.amount,
        )
    )
    _check_before_maturity(session, investment.id)
    session.commit()
    return get_investment(session, investment.id, today)


def update_investment(
    session: Session, investment_id: int, payload: FixedIncomeInDTO, today: date
) -> FixedIncomeDetailDTO:
    investment = _investment(session, investment_id)
    _ensure_unique_label(session, payload.label, investment_id)
    check_subportfolio(session, payload.subportfolio_id)
    investment.label = payload.label
    investment.product_type = payload.product_type
    investment.indexer = payload.indexer
    investment.rate = payload.rate
    investment.maturity_date = payload.maturity_date
    investment.daily_liquidity = payload.daily_liquidity
    investment.subportfolio_id = payload.subportfolio_id
    _check_before_maturity(session, investment_id)
    session.commit()
    return get_investment(session, investment_id, today)


def delete_investment(session: Session, investment_id: int) -> None:
    """Título com movimentação fica: a FK é RESTRICT, e a mensagem diz o porquê."""
    investment = _investment(session, investment_id)
    if session.scalar(
        select(exists().where(FixedIncomeMovement.investment_id == investment_id))
    ):
        raise InvestmentConflictError(
            f"{investment.label} tem movimentações: apague-as antes do título."
        )
    session.delete(investment)
    session.commit()


def add_movement(
    session: Session, investment_id: int, payload: MovementInDTO
) -> MovementDTO:
    _investment(session, investment_id)
    movement = FixedIncomeMovement(
        investment_id=investment_id,
        movement_date=payload.movement_date,
        movement_type=payload.movement_type,
        amount=payload.amount,
    )
    session.add(movement)
    _check_starts_with_application(session, investment_id)
    _check_before_maturity(session, investment_id)
    session.commit()
    return MovementDTO.model_validate(movement)


def delete_movement(session: Session, movement_id: int) -> None:
    movement = session.get(FixedIncomeMovement, movement_id)
    if movement is None:
        raise InvestmentNotFoundError("Movimentação não encontrada.")
    session.delete(movement)
    _check_starts_with_application(session, movement.investment_id)
    session.commit()
