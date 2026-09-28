from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import Asset, FixedIncomeInvestment, Subportfolio


class SubportfolioNotFoundError(FinanceError):
    status = 404


@dataclass(frozen=True, slots=True, kw_only=True)
class Members:
    """Os ativos e os títulos de hoje de uma subcarteira."""

    asset_ids: frozenset[int]
    investment_ids: frozenset[int]


def subportfolio(session: Session, subportfolio_id: int) -> Subportfolio:
    found = session.get(Subportfolio, subportfolio_id)
    if found is None:
        raise SubportfolioNotFoundError("Subcarteira não encontrada.")
    return found


def check_subportfolio(session: Session, subportfolio_id: int | None) -> None:
    """Nulo é a carteira geral; um id precisa existir."""
    if subportfolio_id is not None:
        subportfolio(session, subportfolio_id)


def members(session: Session, subportfolio_id: int | None) -> Members | None:
    """Os membros da subcarteira; nulo é a carteira geral, com tudo."""
    check_subportfolio(session, subportfolio_id)
    if subportfolio_id is None:
        return None
    return Members(
        asset_ids=frozenset(
            session.scalars(
                select(Asset.id).where(Asset.subportfolio_id == subportfolio_id)
            )
        ),
        investment_ids=frozenset(
            session.scalars(
                select(FixedIncomeInvestment.id).where(
                    FixedIncomeInvestment.subportfolio_id == subportfolio_id
                )
            )
        ),
    )
