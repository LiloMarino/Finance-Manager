from __future__ import annotations

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import Asset, Operation
from backend.features.assets.dto import AssetInDTO


class AssetNotFoundError(FinanceError):
    status = 404


class AssetConflictError(FinanceError):
    status = 409


def list_assets(session: Session) -> list[Asset]:
    return list(session.scalars(select(Asset).order_by(Asset.ticker)))


def get_asset(session: Session, asset_id: int) -> Asset:
    asset = session.get(Asset, asset_id)
    if asset is None:
        raise AssetNotFoundError("Ativo não encontrado.")
    return asset


def _ensure_unique_ticker(
    session: Session, ticker: str, asset_id: int | None = None
) -> None:
    clash = session.scalar(select(Asset.id).where(Asset.ticker == ticker))
    if clash is not None and clash != asset_id:
        raise AssetConflictError(f"Já existe um ativo {ticker}.")


def create_asset(session: Session, payload: AssetInDTO) -> Asset:
    _ensure_unique_ticker(session, payload.ticker)
    asset = Asset(
        ticker=payload.ticker,
        asset_class=payload.asset_class,
        cnpj=payload.cnpj,
        sector=payload.sector,
    )
    session.add(asset)
    session.commit()
    return asset


def update_asset(session: Session, asset_id: int, payload: AssetInDTO) -> Asset:
    asset = get_asset(session, asset_id)
    _ensure_unique_ticker(session, payload.ticker, asset_id)
    asset.ticker = payload.ticker
    asset.asset_class = payload.asset_class
    asset.cnpj = payload.cnpj
    asset.sector = payload.sector
    session.commit()
    return asset


def delete_asset(session: Session, asset_id: int) -> None:
    """Ativo com operação fica: a FK é RESTRICT, e a mensagem diz o porquê."""
    asset = get_asset(session, asset_id)
    if session.scalar(select(exists().where(Operation.asset_id == asset_id))):
        raise AssetConflictError(
            f"{asset.ticker} tem operações: apague as operações antes do ativo."
        )
    session.delete(asset)
    session.commit()
