from __future__ import annotations

from fastapi import APIRouter, status

from backend.core.database.session import SessionDep
from backend.features.assets.dto import AssetDTO, AssetInDTO, TickerChangeInDTO
from backend.features.assets.service import (
    change_ticker,
    create_asset,
    delete_asset,
    get_asset,
    list_assets,
    update_asset,
)

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("")
def list_all(session: SessionDep) -> list[AssetDTO]:
    return list_assets(session)


@router.post("", status_code=status.HTTP_201_CREATED)
def create(session: SessionDep, payload: AssetInDTO) -> AssetDTO:
    return create_asset(session, payload)


@router.get("/{asset_id}")
def get(session: SessionDep, asset_id: int) -> AssetDTO:
    return get_asset(session, asset_id)


@router.put("/{asset_id}")
def update(session: SessionDep, asset_id: int, payload: AssetInDTO) -> AssetDTO:
    return update_asset(session, asset_id, payload)


@router.post("/{asset_id}/ticker-change")
def ticker_change(
    session: SessionDep, asset_id: int, payload: TickerChangeInDTO
) -> AssetDTO:
    """Devolve o ativo que ficou: com junção, é o que já tinha o ticker novo."""
    return change_ticker(session, asset_id, payload)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session: SessionDep, asset_id: int) -> None:
    delete_asset(session, asset_id)
