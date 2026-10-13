from __future__ import annotations

import urllib.request
import zipfile
from collections import defaultdict
from collections.abc import Collection
from datetime import date
from decimal import Decimal
from io import BytesIO

from backend.domain.market_data import CENT, DailyClose

URL = "https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_M{month:02d}{year}.ZIP"
TIMEOUT_SECONDS = 60
# A B3 responde 403 ao User-Agent padrão do urllib
HEADERS = {"User-Agent": "finance-manager"}
# Mercado à vista, sem o fracionário
SPOT_MARKET = b"010"


class B3HistoryArchive:
    name = "b3-cotahist"

    def get_month(
        self, year: int, month: int, tickers: Collection[str]
    ) -> dict[str, list[DailyClose]]:
        request = urllib.request.Request(
            URL.format(year=year, month=month), headers=HEADERS
        )
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            body: bytes = response.read()
        with zipfile.ZipFile(BytesIO(body)) as archive:
            text = archive.read(archive.namelist()[0])
        return to_ticker_closes(text, tickers)


def to_ticker_closes(
    text: bytes, tickers: Collection[str]
) -> dict[str, list[DailyClose]]:
    """Cada linha de cotação do COTAHIST é um registro de largura fixa, de tipo `01`:
    a data em AAAAMMDD, o ticker, o mercado, o preço do último negócio em centavos e o
    fator de cotação, que é a quantidade a que o preço se refere."""
    wanted = {ticker.encode() for ticker in tickers}
    closes: defaultdict[str, list[DailyClose]] = defaultdict(list)
    for line in text.splitlines():
        if line[:2] != b"01" or line[24:27] != SPOT_MARKET:
            continue
        ticker = line[12:24].rstrip()
        if ticker not in wanted:
            continue
        raw = line[2:10]
        closes[ticker.decode()].append(
            DailyClose(
                price_date=date(int(raw[:4]), int(raw[4:6]), int(raw[6:])),
                close=(Decimal(int(line[108:121])) / 100 / int(line[210:217])).quantize(
                    CENT
                ),
            )
        )
    return {
        ticker: sorted(found, key=lambda c: c.price_date)
        for ticker, found in closes.items()
    }
