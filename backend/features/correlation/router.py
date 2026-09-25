from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter

from backend.core.database.session import SessionDep
from backend.core.dto import BaseDTO
from backend.core.enum import CorrelationWindow, IndexSeries
from backend.domain.correlation import ROLLING_WINDOW
from backend.features.correlation.service import correlation
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


@router.get("")
def get(
    session: SessionDep,
    provider: ProviderDep,
    first: str,
    window: CorrelationWindow,
    second: str | None = None,
    benchmark: IndexSeries | None = None,
) -> CorrelationDTO:
    """Compara `first` com outro ticker (`second`) ou com uma referência
    (`benchmark`, IBOV ou CDI). Grava no cache o que a fonte trouxer; com o cache em
    dia, responde sem sair da máquina."""
    result = correlation(
        session,
        provider,
        first=first,
        second=second,
        benchmark=benchmark,
        window=window,
        now=datetime.now(),
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
