from __future__ import annotations

from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Query

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO
from backend.core.enum import CorrelationWindow, PortfolioCategory
from backend.domain.correlation import ROLLING_WINDOW
from backend.features.correlation.service import (
    SymbolMatrix,
    correlation,
    matrix,
    portfolio_matrix,
)
from backend.features.providers import ProviderDep

router = APIRouter(prefix="/api/correlation", tags=["correlation"])


class NormalizedPointDTO(BaseDTO):
    day: date
    first: float
    second: float


class RollingPointDTO(BaseDTO):
    day: date
    value: float


class CorrelationDTO(BaseDTO):
    """A correlação de Pearson dos retornos diários, de -1 a 1, sobre `returns`
    retornos nos pregões em comum de `start` a `end`. `points` são as duas séries
    partindo de 100, e `rolling`, a correlação das `rolling_window` sessões que
    terminam em cada dia."""

    first: str
    second: str
    correlation: float
    returns: int
    start: date
    end: date
    rolling_window: int
    points: list[NormalizedPointDTO]
    rolling: list[RollingPointDTO]


class MatrixCellDTO(BaseDTO):
    """Nula quando o par não tem retornos em comum suficientes ou quando um dos
    dois não variou."""

    value: float | None
    returns: int


class CorrelationMatrixDTO(BaseDTO):
    """`cells[i][j]` é a correlação entre `symbols[i]` e `symbols[j]`."""

    symbols: list[str]
    cells: list[list[MatrixCellDTO]]


class CorrelatedPairDTO(BaseDTO):
    first: str
    second: str
    value: float
    returns: int


class PortfolioCorrelationDTO(BaseDTO):
    """A matriz dos ativos em carteira hoje, em ordem alfabética, e os pares de
    maior correlação, do maior para o menor. `missing` são os ativos sem cotação
    na janela, com as células vazias."""

    matrix: CorrelationMatrixDTO
    pairs: list[CorrelatedPairDTO]
    missing: list[str]


def _matrix_dto(result: SymbolMatrix) -> CorrelationMatrixDTO:
    return CorrelationMatrixDTO(
        symbols=result.symbols,
        cells=[
            [MatrixCellDTO.model_validate(cell) for cell in row] for row in result.cells
        ],
    )


@router.get("/pair")
def pair(
    session: SessionDep,
    provider: ProviderDep,
    first: str,
    second: str,
    window: CorrelationWindow,
) -> CorrelationDTO:
    """Cada lado é um ticker da B3 ou uma referência (`IBOV`, `CDI`). Grava no cache
    o que a fonte trouxer; com o cache em dia, responde sem sair da máquina."""
    result = correlation(
        session, provider, first=first, second=second, window=window, now=datetime.now()
    )
    measured = result.correlation
    return CorrelationDTO(
        first=result.first,
        second=result.second,
        correlation=measured.value,
        returns=measured.returns,
        start=measured.start,
        end=measured.end,
        rolling_window=ROLLING_WINDOW,
        points=[NormalizedPointDTO.model_validate(point) for point in measured.points],
        rolling=[RollingPointDTO.model_validate(point) for point in measured.rolling],
    )


@router.get("/matrix")
def correlation_matrix(
    session: SessionDep,
    provider: ProviderDep,
    symbols: Annotated[list[str], Query()],
    window: CorrelationWindow,
) -> CorrelationMatrixDTO:
    """A correlação de cada par entre 2 e 20 tickers ou referências."""
    return _matrix_dto(
        matrix(session, provider, symbols=symbols, window=window, now=datetime.now())
    )


@router.get("/portfolio")
def portfolio_correlation(
    session: SessionDep,
    provider: ProviderDep,
    window: CorrelationWindow = CorrelationWindow.ONE_YEAR,
    category: PortfolioCategory | None = None,
    subportfolio_id: int | None = None,
) -> PortfolioCorrelationDTO:
    result = portfolio_matrix(
        session,
        provider,
        window=window,
        category=category,
        subportfolio_id=subportfolio_id,
        now=datetime.now(),
    )
    return PortfolioCorrelationDTO(
        matrix=_matrix_dto(result.matrix),
        pairs=[CorrelatedPairDTO.model_validate(pair) for pair in result.pairs],
        missing=result.missing,
    )
