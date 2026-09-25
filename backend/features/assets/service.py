from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session

from backend.core.errors import FinanceError
from backend.core.models.models import (
    Asset,
    AssetTickerHistory,
    Operation,
    Segment,
)
from backend.features.assets.dto import (
    AssetDTO,
    AssetInDTO,
    PreviousTickerDTO,
    TickerChangeInDTO,
)
from backend.repository.operations import check_positions
from backend.repository.sectors import Classification, classifications
from backend.repository.tickers import (
    TickerHistory,
    ensure_ticker_free,
    ticker_history,
)


class AssetNotFoundError(FinanceError):
    status = 404


class AssetConflictError(FinanceError):
    status = 409


class InvalidTickerChangeError(FinanceError):
    status = 422


def _to_dto(
    asset: Asset, history: TickerHistory, classes: dict[int, Classification]
) -> AssetDTO:
    classification = (
        classes.get(asset.segment_id) if asset.segment_id is not None else None
    )
    return AssetDTO(
        id=asset.id,
        ticker=asset.ticker,
        asset_class=asset.asset_class,
        cnpj=asset.cnpj,
        segment_id=asset.segment_id,
        sector=classification.sector if classification else None,
        segment=classification.segment if classification else None,
        previous_tickers=[
            PreviousTickerDTO(ticker=entry.ticker, valid_until=entry.valid_until)
            for entry in history.previous(asset.id)
        ],
    )


def _dto(session: Session, asset: Asset) -> AssetDTO:
    return _to_dto(asset, ticker_history(session), classifications(session))


def _check_segment(session: Session, segment_id: int | None) -> None:
    if segment_id is not None and session.get(Segment, segment_id) is None:
        raise AssetNotFoundError("Segmento não encontrado.")


def _asset(session: Session, asset_id: int) -> Asset:
    asset = session.get(Asset, asset_id)
    if asset is None:
        raise AssetNotFoundError("Ativo não encontrado.")
    return asset


def list_assets(session: Session) -> list[AssetDTO]:
    history = ticker_history(session)
    classes = classifications(session)
    return [
        _to_dto(asset, history, classes)
        for asset in session.scalars(select(Asset).order_by(Asset.ticker))
    ]


def get_asset(session: Session, asset_id: int) -> AssetDTO:
    return _dto(session, _asset(session, asset_id))


def create_asset(session: Session, payload: AssetInDTO) -> AssetDTO:
    ensure_ticker_free(session, payload.ticker, None)
    _check_segment(session, payload.segment_id)
    asset = Asset(
        ticker=payload.ticker,
        asset_class=payload.asset_class,
        cnpj=payload.cnpj,
        segment_id=payload.segment_id,
    )
    session.add(asset)
    session.commit()
    return _dto(session, asset)


def update_asset(session: Session, asset_id: int, payload: AssetInDTO) -> AssetDTO:
    """Corrige o cadastro. Mudar o ticker aqui corrige o nome em todo o histórico;
    a troca de ticker com data é `change_ticker`."""
    asset = _asset(session, asset_id)
    ensure_ticker_free(session, payload.ticker, asset_id)
    _check_segment(session, payload.segment_id)
    asset.ticker = payload.ticker
    asset.asset_class = payload.asset_class
    asset.cnpj = payload.cnpj
    asset.segment_id = payload.segment_id
    session.commit()
    return _dto(session, asset)


def delete_asset(session: Session, asset_id: int) -> None:
    """Ativo com operação fica: a FK é RESTRICT, e a mensagem diz o porquê."""
    asset = _asset(session, asset_id)
    if session.scalar(select(exists().where(Operation.asset_id == asset_id))):
        raise AssetConflictError(
            f"{asset.ticker} tem operações: apague as operações antes do ativo."
        )
    session.delete(asset)
    session.commit()


def change_ticker(
    session: Session, asset_id: int, payload: TickerChangeInDTO
) -> AssetDTO:
    """O ativo passa a se chamar `payload.ticker` a partir da data, sem operação e
    sem mexer em posição, PM ou apuração. Se o ticker novo já é um ativo, os dois
    se juntam nele."""
    asset = _asset(session, asset_id)
    if payload.ticker == asset.ticker:
        raise InvalidTickerChangeError(f"{asset.ticker} já é o ticker atual.")
    last_change = session.scalar(
        select(func.max(AssetTickerHistory.valid_until)).where(
            AssetTickerHistory.asset_id == asset.id
        )
    )
    valid_until = payload.effective_date - timedelta(days=1)
    if last_change is not None and valid_until <= last_change:
        raise InvalidTickerChangeError(
            f"A troca precisa ser depois da anterior, em "
            f"{last_change + timedelta(days=1):%d/%m/%Y}."
        )

    target = session.scalar(select(Asset).where(Asset.ticker == payload.ticker))
    if target is not None:
        return _merge(session, asset, target, payload.effective_date)

    ensure_ticker_free(session, payload.ticker, asset.id)
    session.add(
        AssetTickerHistory(
            asset_id=asset.id, ticker=asset.ticker, valid_until=valid_until
        )
    )
    asset.ticker = payload.ticker
    session.commit()
    return _dto(session, asset)


def _merge(session: Session, source: Asset, target: Asset, day: date) -> AssetDTO:
    """Junta em `target` o ativo que estava cadastrado como dois: as operações de
    `source`, todas anteriores à troca, passam para `target`, cujas operações são
    todas a partir dela."""
    source_operations = list(
        session.scalars(select(Operation).where(Operation.asset_id == source.id))
    )
    target_operations = list(
        session.scalars(select(Operation).where(Operation.asset_id == target.id))
    )
    if any(op.operation_date >= day for op in source_operations):
        raise InvalidTickerChangeError(
            f"{source.ticker} tem operação a partir de {day:%d/%m/%Y}: com a troca, "
            f"ela seria de {target.ticker}. Mova a operação antes de trocar o ticker."
        )
    if any(op.operation_date < day for op in target_operations):
        raise InvalidTickerChangeError(
            f"{target.ticker} tem operação antes de {day:%d/%m/%Y}, quando o ativo "
            f"ainda se chamava {source.ticker}."
        )

    for operation in source_operations:
        operation.asset_id = target.id
    for entry in session.scalars(
        select(AssetTickerHistory).where(AssetTickerHistory.asset_id == source.id)
    ):
        entry.asset_id = target.id
    target.cnpj = target.cnpj or source.cnpj
    target.segment_id = target.segment_id or source.segment_id
    old_ticker = source.ticker
    # As operações saem de `source` antes de apagá-lo: a FK delas é RESTRICT
    session.flush()
    session.delete(source)
    session.flush()
    session.add(
        AssetTickerHistory(
            asset_id=target.id, ticker=old_ticker, valid_until=day - timedelta(days=1)
        )
    )
    check_positions(session, [target.ticker])
    session.commit()
    return _dto(session, target)
