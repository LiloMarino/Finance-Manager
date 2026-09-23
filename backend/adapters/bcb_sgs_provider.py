from __future__ import annotations

import urllib.error
import urllib.request
from datetime import date, datetime, timedelta
from decimal import Decimal

from pydantic import BaseModel, TypeAdapter

from backend.core.enum import IndexSeries
from backend.domain.index_series import DailyRate

SGS_CODES = {IndexSeries.CDI: 12, IndexSeries.SELIC: 11, IndexSeries.IPCA: 433}

# O SGS recusa (406) janela de série diária maior que 10 anos
MAX_WINDOW = timedelta(days=3650)
TIMEOUT_SECONDS = 30


class SgsRow(BaseModel):
    data: str
    valor: str


_rows = TypeAdapter(list[SgsRow])


class BcbSgsProvider:
    name = "bcb-sgs"

    def get_series(
        self, series: IndexSeries, start: date, end: date
    ) -> list[DailyRate]:
        rates: list[DailyRate] = []
        window_start = start
        while window_start <= end:
            window_end = min(window_start + MAX_WINDOW, end)
            rates.extend(_fetch(SGS_CODES[series], window_start, window_end))
            window_start = window_end + timedelta(days=1)
        return rates


def _fetch(code: int, start: date, end: date) -> list[DailyRate]:
    url = (
        f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados?formato=json"
        f"&dataInicial={start:%d/%m/%Y}&dataFinal={end:%d/%m/%Y}"
    )
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT_SECONDS) as response:
            body: bytes = response.read()
    except urllib.error.HTTPError as error:
        # Janela sem nenhum valor publicado é 404 no SGS
        if error.code == 404:
            return []
        raise
    return to_daily_rates(body)


def to_daily_rates(body: bytes) -> list[DailyRate]:
    """O `valor` chega como string no JSON do SGS e vira Decimal sem passar por
    float."""
    return [
        DailyRate(
            rate_date=datetime.strptime(row.data, "%d/%m/%Y").date(),
            value=Decimal(row.valor),
        )
        for row in _rows.validate_json(body)
    ]
