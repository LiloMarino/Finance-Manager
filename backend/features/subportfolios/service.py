from __future__ import annotations

from collections import defaultdict

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from backend.core.dto import NameInDTO
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, FixedIncomeInvestment, Subportfolio
from backend.features.subportfolios.dto import (
    MemberAssetDTO,
    MemberInvestmentDTO,
    MembersInDTO,
    SubportfolioDTO,
)
from backend.repository.subportfolios import subportfolio


class SubportfolioConflictError(FinanceError):
    status = 409


class InvalidMembersError(FinanceError):
    status = 422


def _ensure_unique_name(
    session: Session, name: str, subportfolio_id: int | None = None
) -> None:
    clash = session.scalar(select(Subportfolio.id).where(Subportfolio.name == name))
    if clash is not None and clash != subportfolio_id:
        raise SubportfolioConflictError(f"Já existe a subcarteira {name}.")


def list_subportfolios(session: Session) -> list[SubportfolioDTO]:
    """As subcarteiras em ordem de nome, cada uma com os ativos e os títulos."""
    assets: defaultdict[int, list[MemberAssetDTO]] = defaultdict(list)
    for asset in session.scalars(
        select(Asset).where(Asset.subportfolio_id.is_not(None)).order_by(Asset.ticker)
    ):
        if asset.subportfolio_id is not None:
            assets[asset.subportfolio_id].append(
                MemberAssetDTO(id=asset.id, ticker=asset.ticker)
            )
    investments: defaultdict[int, list[MemberInvestmentDTO]] = defaultdict(list)
    for investment in session.scalars(
        select(FixedIncomeInvestment)
        .where(FixedIncomeInvestment.subportfolio_id.is_not(None))
        .order_by(FixedIncomeInvestment.label)
    ):
        if investment.subportfolio_id is not None:
            investments[investment.subportfolio_id].append(
                MemberInvestmentDTO(id=investment.id, label=investment.label)
            )
    return [
        SubportfolioDTO(
            id=found.id,
            name=found.name,
            assets=assets[found.id],
            fixed_income=investments[found.id],
        )
        for found in session.scalars(select(Subportfolio).order_by(Subportfolio.name))
    ]


def create_subportfolio(session: Session, payload: NameInDTO) -> SubportfolioDTO:
    _ensure_unique_name(session, payload.name)
    created = Subportfolio(name=payload.name)
    session.add(created)
    session.commit()
    return SubportfolioDTO(id=created.id, name=created.name, assets=[], fixed_income=[])


def rename_subportfolio(
    session: Session, subportfolio_id: int, payload: NameInDTO
) -> None:
    found = subportfolio(session, subportfolio_id)
    _ensure_unique_name(session, payload.name, subportfolio_id)
    found.name = payload.name
    session.commit()


def delete_subportfolio(session: Session, subportfolio_id: int) -> None:
    """A FK dos membros é SET NULL: os ativos e os títulos voltam à carteira geral."""
    session.delete(subportfolio(session, subportfolio_id))
    session.commit()


def set_members(session: Session, subportfolio_id: int, payload: MembersInDTO) -> None:
    subportfolio(session, subportfolio_id)
    asset_ids = set(payload.asset_ids)
    investment_ids = set(payload.investment_ids)

    # Os listados e os que eram da subcarteira: cada um fica nela ou volta à geral
    assets = list(
        session.scalars(
            select(Asset).where(
                or_(Asset.id.in_(asset_ids), Asset.subportfolio_id == subportfolio_id)
            )
        )
    )
    if asset_ids - {asset.id for asset in assets}:
        raise InvalidMembersError("Ativo não encontrado.")
    investments = list(
        session.scalars(
            select(FixedIncomeInvestment).where(
                or_(
                    FixedIncomeInvestment.id.in_(investment_ids),
                    FixedIncomeInvestment.subportfolio_id == subportfolio_id,
                )
            )
        )
    )
    if investment_ids - {investment.id for investment in investments}:
        raise InvalidMembersError("Título não encontrado.")

    for asset in assets:
        asset.subportfolio_id = subportfolio_id if asset.id in asset_ids else None
    for investment in investments:
        investment.subportfolio_id = (
            subportfolio_id if investment.id in investment_ids else None
        )
    session.commit()
