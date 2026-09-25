"""O quanto duas séries de preço andam juntas. Correlação é medida estatística, e não
dinheiro: a conta é em float.

A correlação sai dos retornos diários nos pregões em comum: o retorno de um dia é a
variação desde o pregão em comum anterior, então um feriado de um dos lados junta
dois dias do outro num retorno só, e os dois continuam alinhados.
"""

from __future__ import annotations

import statistics
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date
from itertools import pairwise

from backend.core.errors import FinanceError

# Com menos retornos que isso, a correlação é ruído
MIN_RETURNS = 20
ROLLING_WINDOW = 60
BASE = 100.0


class CorrelationError(FinanceError):
    status = 422


@dataclass(frozen=True, slots=True, kw_only=True)
class NormalizedPoint:
    """As duas séries partindo de 100 no primeiro pregão em comum."""

    day: date
    first: float
    second: float


@dataclass(frozen=True, slots=True, kw_only=True)
class RollingPoint:
    """A correlação dos `ROLLING_WINDOW` retornos que terminam no dia."""

    day: date
    value: float


@dataclass(frozen=True, slots=True, kw_only=True)
class Correlation:
    """`returns` é o número de retornos diários que entraram na conta."""

    value: float
    returns: int
    start: date
    end: date
    points: list[NormalizedPoint]
    rolling: list[RollingPoint]


def _returns(closes: Sequence[float]) -> list[float]:
    return [today / yesterday - 1 for yesterday, today in pairwise(closes)]


def _correlation(first: Sequence[float], second: Sequence[float]) -> float | None:
    try:
        return statistics.correlation(first, second)
    except statistics.StatisticsError:
        return None


def correlate(first: Mapping[date, float], second: Mapping[date, float]) -> Correlation:
    days = sorted(first.keys() & second.keys())
    if len(days) < MIN_RETURNS + 1:
        raise CorrelationError(
            f"Só {max(len(days) - 1, 0)} retornos diários em comum no período; "
            f"a correlação pede pelo menos {MIN_RETURNS}."
        )
    first_closes = [first[day] for day in days]
    second_closes = [second[day] for day in days]
    first_returns = _returns(first_closes)
    second_returns = _returns(second_closes)

    value = _correlation(first_returns, second_returns)
    if value is None:
        raise CorrelationError(
            "Um dos dois não variou no período, e a correlação não existe."
        )

    # O retorno de índice `i` termina no dia `i + 1`
    rolling = [
        RollingPoint(day=days[end], value=window)
        for end in range(ROLLING_WINDOW, len(days))
        if (
            window := _correlation(
                first_returns[end - ROLLING_WINDOW : end],
                second_returns[end - ROLLING_WINDOW : end],
            )
        )
        is not None
    ]
    points = [
        NormalizedPoint(
            day=day,
            first=BASE * close / first_closes[0],
            second=BASE * other / second_closes[0],
        )
        for day, close, other in zip(days, first_closes, second_closes, strict=True)
    ]
    return Correlation(
        value=value,
        returns=len(first_returns),
        start=days[0],
        end=days[-1],
        points=points,
        rolling=rolling,
    )
