from __future__ import annotations

from datetime import date

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from backend.core.enum import FixedIncomeMovementType
from backend.core.errors import FinanceError
from backend.core.models.models import FixedIncomeInvestment, FixedIncomeMovement
from backend.features.fixed_income.dto import (
    FixedIncomeDetailDTO,
    FixedIncomeDTO,
    FixedIncomeInDTO,
    MovementDTO,
    MovementInDTO,
)
from backend.repository.fixed_income import marked_investments


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


def list_investments(session: Session, today: date) -> list[FixedIncomeDTO]:
    return [
        FixedIncomeDTO.model_validate(investment)
        for investment in marked_investments(session, today)
    ]


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
    session: Session, payload: FixedIncomeInDTO, today: date
) -> FixedIncomeDetailDTO:
    _ensure_unique_label(session, payload.label)
    investment = FixedIncomeInvestment(
        label=payload.label,
        indexer=payload.indexer,
        rate=payload.rate,
        maturity_date=payload.maturity_date,
        daily_liquidity=payload.daily_liquidity,
        tax_exempt=payload.tax_exempt,
    )
    session.add(investment)
    session.commit()
    return get_investment(session, investment.id, today)


def update_investment(
    session: Session, investment_id: int, payload: FixedIncomeInDTO, today: date
) -> FixedIncomeDetailDTO:
    investment = _investment(session, investment_id)
    _ensure_unique_label(session, payload.label, investment_id)
    investment.label = payload.label
    investment.indexer = payload.indexer
    investment.rate = payload.rate
    investment.maturity_date = payload.maturity_date
    investment.daily_liquidity = payload.daily_liquidity
    investment.tax_exempt = payload.tax_exempt
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
    session.commit()
    return MovementDTO.model_validate(movement)


def delete_movement(session: Session, movement_id: int) -> None:
    movement = session.get(FixedIncomeMovement, movement_id)
    if movement is None:
        raise InvestmentNotFoundError("Movimentação não encontrada.")
    session.delete(movement)
    _check_starts_with_application(session, movement.investment_id)
    session.commit()
