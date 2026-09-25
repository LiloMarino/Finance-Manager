"""As referências da rentabilidade como uma cota: um nível por dia, que o
`period_return` lê do mesmo jeito que lê a cota da carteira.

O nível vale 1 no primeiro dia. O CDI é a curva de um título a 100% do CDI, e o IPCA,
a de um título a IPCA + 0%, as duas com a acumulação da marcação da renda fixa. O
IBOV é o fechamento do dia sobre o do primeiro dia.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from datetime import date
from decimal import Decimal

from backend.core.enum import Indexer, IndexSeries
from backend.domain.business_days import BusinessCalendar
from backend.domain.index_growth import PublishedSeries, accumulation, daily_factor
from backend.domain.index_series import DailyRate

BENCHMARKS = (IndexSeries.CDI, IndexSeries.IPCA, IndexSeries.IBOV)

# O indexador e a taxa do título que reproduz cada série de juros e inflação
GROWTH = {
    IndexSeries.CDI: (Indexer.CDI, Decimal(100)),
    IndexSeries.IPCA: (Indexer.IPCA, Decimal(0)),
}


def benchmark_levels(
    series: IndexSeries,
    rates: Mapping[IndexSeries, Sequence[DailyRate]],
    days: Sequence[date],
) -> list[Decimal] | None:
    """O nível da série no fim de cada um dos `days`, ou nulo quando ela não tem
    valor publicado até o primeiro deles. Depois do último valor, ele se repete."""
    published = PublishedSeries(rates.get(series, ()))
    first = published.first_date
    if not days or first is None or first > days[0]:
        return None

    if series is IndexSeries.IBOV:
        closes: list[Decimal] = []
        for day in days:
            close = published.at(day)
            if close is None:
                return None
            closes.append(close)
        return [close / closes[0] for close in closes]

    indexer, rate = GROWTH[series]
    business = BusinessCalendar(rates.get(IndexSeries.CDI, ()))
    factor = accumulation(
        daily_factor(indexer, rate, rates, business), days[0], days[-1]
    )
    return [factor(day) for day in days]
