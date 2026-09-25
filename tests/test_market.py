from __future__ import annotations

import time
from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from threading import Thread

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.adapters.bcb_sgs_provider import to_daily_rates
from backend.adapters.yfinance_provider import to_daily_closes
from backend.app import create_app
from backend.core.database.session import get_session
from backend.core.enum import (
    AssetClass,
    IndexSeries,
    OperationType,
)
from backend.core.models.models import (
    Asset,
    IndexHistory,
    Operation,
    PriceHistory,
)
from backend.domain.index_series import DailyRate
from backend.domain.market_data import DailyClose, MarketDataProvider
from backend.features.market.indexes import refresh_indexes
from backend.features.market.router import get_provider
from backend.features.market.service import refresh_prices

FIRST_OPERATION = date(2024, 2, 5)
# Sexta-feira, depois do fechamento do pregão
TODAY = date(2024, 2, 9)
NOW = datetime(2024, 2, 9, 20, 0)


@dataclass
class FakeProvider:
    name: str
    closes: dict[date, str] = field(default_factory=dict[date, str])
    offline: bool = False
    delay: float = 0
    calls: list[tuple[str, date, date]] = field(
        default_factory=list[tuple[str, date, date]]
    )

    def get_history(self, ticker: str, start: date, end: date) -> list[DailyClose]:
        self.calls.append((ticker, start, end))
        time.sleep(self.delay)
        if self.offline:
            raise ConnectionError("sem rede")
        return [
            DailyClose(price_date=day, close=Decimal(close))
            for day, close in sorted(self.closes.items())
            if start <= day <= end
        ]


def _operation(
    session: Session,
    asset: Asset,
    operation_date: date = FIRST_OPERATION,
    operation_type: OperationType = OperationType.BUY,
) -> None:
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=operation_date,
            operation_type=operation_type,
            quantity=Decimal(10),
            unit_price=Decimal(100),
        )
    )
    session.commit()


def _asset(
    session: Session,
    ticker: str = "ABCD11",
    asset_class: AssetClass = AssetClass.FII,
    *,
    with_operation: bool = True,
) -> Asset:
    asset = Asset(ticker=ticker, asset_class=asset_class)
    session.add(asset)
    session.commit()
    if with_operation:
        _operation(session, asset)
    return asset


def _closes(start: date, end: date, close: str = "10.00") -> dict[date, str]:
    """Um fechamento por dia de semana de `start` a `end`."""
    days = (start + timedelta(days=offset) for offset in range((end - start).days + 1))
    return {day: close for day in days if day.weekday() < 5}


def _cached(session: Session) -> dict[date, Decimal]:
    return {row.price_date: row.close for row in session.scalars(select(PriceHistory))}


def _refresh(
    session: Session, provider: MarketDataProvider, now: datetime = NOW
) -> tuple[str, ...]:
    return refresh_prices(session, provider, now).failed


def test_first_refresh_starts_at_first_operation(session: Session) -> None:
    """Sem cache, o refresh pede da primeira operação até hoje e grava o que vier."""
    _asset(session)
    provider = FakeProvider(
        "fake", {date(2024, 2, 5): "10.00", date(2024, 2, 6): "10.50"}
    )

    _refresh(session, provider)

    assert provider.calls == [("ABCD11", FIRST_OPERATION, TODAY)]
    assert _cached(session) == {
        date(2024, 2, 5): Decimal("10.00"),
        date(2024, 2, 6): Decimal("10.50"),
    }


def test_next_refresh_resumes_from_last_cached_day(session: Session) -> None:
    """Com cache e o último pregão faltando, o refresh pede a partir do último dia
    gravado, e regrava o fechamento desse dia."""
    _asset(session)
    provider = FakeProvider(
        "fake", {date(2024, 2, 5): "10.00", date(2024, 2, 6): "10.50"}
    )
    _refresh(session, provider)

    provider.closes[date(2024, 2, 6)] = "10.80"
    provider.closes.update(_closes(date(2024, 2, 7), TODAY, "11.00"))
    _refresh(session, provider, NOW + timedelta(days=1))

    assert provider.calls[-1] == ("ABCD11", date(2024, 2, 6), TODAY)
    assert _cached(session)[date(2024, 2, 6)] == Decimal("10.80")
    assert _cached(session)[TODAY] == Decimal("11.00")


def test_refresh_with_cache_up_to_date_fetches_nothing(session: Session) -> None:
    """Com o fechamento do último pregão gravado depois do fim dele, recarregar
    não consulta a fonte, por mais vezes que seja chamado."""
    _asset(session)
    provider = FakeProvider("fake", _closes(FIRST_OPERATION, TODAY))
    _refresh(session, provider)

    for hours in (1, 2, 30):
        _refresh(session, provider, NOW + timedelta(hours=hours))

    assert len(provider.calls) == 1


def test_failed_attempt_waits_for_the_interval(session: Session) -> None:
    """A tentativa que falhou também conta: dentro do intervalo, a fonte não é
    consultada de novo."""
    _asset(session)
    provider = FakeProvider("fake", offline=True)
    _refresh(session, provider)

    _refresh(session, provider, NOW + timedelta(minutes=5))
    _refresh(session, provider, NOW + timedelta(minutes=20))

    assert len(provider.calls) == 2


def test_gap_the_source_does_not_fill_is_retried_daily(session: Session) -> None:
    """Quando a fonte responde e o começo da janela continua sem cotação, ela não
    tem o dado: a próxima tentativa espera um dia, e não o intervalo curto."""
    _asset(session)
    provider = FakeProvider("fake", _closes(date(2024, 2, 7), TODAY))
    _refresh(session, provider)

    _refresh(session, provider, NOW + timedelta(hours=2))
    _refresh(session, provider, NOW + timedelta(days=1, minutes=1))

    assert len(provider.calls) == 2


def test_partial_close_is_fetched_again_after_the_session(session: Session) -> None:
    """O fechamento gravado com o pregão aberto é parcial: depois do fechamento, o
    dia é pedido de novo."""
    _asset(session)
    provider = FakeProvider("fake", _closes(FIRST_OPERATION, TODAY))
    _refresh(session, provider, datetime(2024, 2, 9, 15, 0))
    provider.closes[TODAY] = "10.40"

    _refresh(session, provider, datetime(2024, 2, 9, 19, 0))

    assert provider.calls[-1] == ("ABCD11", TODAY, TODAY)
    assert _cached(session)[TODAY] == Decimal("10.40")


def test_open_session_refreshes_partial_close_once_per_interval(
    session: Session,
) -> None:
    """Com o pregão aberto e posição no ativo, o preço do dia é regravado no máximo
    uma vez por intervalo."""
    _asset(session)
    provider = FakeProvider("fake", _closes(FIRST_OPERATION, date(2024, 2, 8)))
    _refresh(session, provider, datetime(2024, 2, 8, 20, 0))

    for minute in (0, 5, 20):
        _refresh(session, provider, datetime(2024, 2, 9, 11, minute))

    assert provider.calls[1:] == [
        ("ABCD11", date(2024, 2, 8), TODAY),
        ("ABCD11", date(2024, 2, 8), TODAY),
    ]


def test_sold_asset_with_covered_window_is_not_fetched(session: Session) -> None:
    """Ativo zerado, com o cache cobrindo os dias em que houve posição, não é mais
    consultado: um ticker que saiu da bolsa depois da venda não gera aviso."""
    asset = _asset(session)
    _operation(session, asset, date(2024, 2, 6), OperationType.SELL)
    for day, close in _closes(FIRST_OPERATION, date(2024, 2, 6)).items():
        session.add(
            PriceHistory(asset_id=asset.id, price_date=day, close=Decimal(close))
        )
    session.commit()
    provider = FakeProvider("fake")

    failed = _refresh(session, provider, NOW + timedelta(days=30))

    assert provider.calls == []
    assert failed == ()


def test_retroactive_operation_fetches_from_its_date(session: Session) -> None:
    """Uma operação anterior ao primeiro fechamento em cache faz o refresh pedir
    desde a data dela."""
    asset = _asset(session)
    provider = FakeProvider("fake", _closes(date(2024, 2, 1), TODAY))
    _refresh(session, provider)
    _operation(session, asset, date(2024, 2, 1))

    _refresh(session, provider, NOW + timedelta(hours=1))

    assert provider.calls[-1] == ("ABCD11", date(2024, 2, 1), TODAY)
    assert min(_cached(session)) == date(2024, 2, 1)


def test_failed_provider_keeps_cache_untouched(session: Session) -> None:
    """Provider fora do ar deixa o cache como estava."""
    _asset(session)
    provider = FakeProvider("fake", {date(2024, 2, 5): "10.00"})
    _refresh(session, provider)

    provider.offline = True
    _refresh(session, provider, NOW + timedelta(days=1))

    assert _cached(session) == {date(2024, 2, 5): Decimal("10.00")}


def test_only_a_new_problem_is_reported(session: Session) -> None:
    """A falta de cotação vai para `failed` na primeira tentativa que a encontra;
    nas seguintes, ela já foi avisada."""
    _asset(session)
    provider = FakeProvider("fake", offline=True)

    first = _refresh(session, provider)
    second = _refresh(session, provider, NOW + timedelta(hours=1))

    assert first == ("ABCD11",)
    assert second == ()


def test_last_session_missing_at_the_source_is_not_a_problem(
    session: Session,
) -> None:
    """O último pregão pode demorar a aparecer na fonte: faltar só ele não é aviso."""
    _asset(session)
    provider = FakeProvider("fake", _closes(FIRST_OPERATION, date(2024, 2, 8)))

    assert _refresh(session, provider) == ()


def test_concurrent_refreshes_hit_the_source_once(engine: Engine) -> None:
    """Dois refreshes ao mesmo tempo: o segundo espera o primeiro e lê o cache."""
    with Session(engine) as session:
        _asset(session)
    provider = FakeProvider("fake", _closes(FIRST_OPERATION, TODAY), delay=0.2)

    def run() -> None:
        with Session(engine) as session:
            _refresh(session, provider)

    threads = [Thread(target=run) for _ in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert len(provider.calls) == 1


def test_assets_without_operations_are_not_fetched(session: Session) -> None:
    """Ativo sem operação fica fora do refresh."""
    _asset(session, "ABCD3", AssetClass.STOCK, with_operation=False)
    provider = FakeProvider("fake")

    _refresh(session, provider)

    assert provider.calls == []


def test_close_must_be_positive(session: Session) -> None:
    """A CHECK do banco recusa fechamento zero."""
    asset = _asset(session)
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(0)))

    with pytest.raises(IntegrityError, match="CHECK"):
        session.flush()


def test_deleting_asset_drops_its_price_cache(session: Session) -> None:
    """O cache é descartável: apagar o ativo leva os fechamentos junto."""
    asset = _asset(session, with_operation=False)
    session.add(PriceHistory(asset_id=asset.id, price_date=TODAY, close=Decimal(10)))
    session.commit()

    session.execute(delete(Asset).where(Asset.id == asset.id))
    session.commit()

    assert _cached(session) == {}


@pytest.fixture
def provider() -> FakeProvider:
    return FakeProvider("fake")


@pytest.fixture
def market_client(engine: Engine, provider: FakeProvider) -> TestClient:
    def session_override() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_provider] = lambda: provider
    return TestClient(app)


def test_offline_refresh_keeps_last_known_price(
    market_client: TestClient,
    session: Session,
    provider: FakeProvider,
) -> None:
    """Sem rede, o refresh responde 200 com o ticker em `failed`, e a listagem
    segue com o último preço conhecido e a data dele."""
    _asset(session)
    provider.closes.update(_closes(FIRST_OPERATION, TODAY, "10.50"))
    _refresh(session, provider)
    provider.offline = True

    refresh = market_client.post("/api/market/prices/refresh")
    prices = market_client.get("/api/market/prices")

    assert refresh.status_code == 200
    assert refresh.json() == {"updated": [], "failed": ["ABCD11"]}
    assert [(p["ticker"], p["close"], p["price_date"]) for p in prices.json()] == [
        ("ABCD11", "10.50", "2024-02-09")
    ]


def test_asset_without_cached_price_is_listed_empty(
    market_client: TestClient, session: Session
) -> None:
    """Ativo com operação e ainda sem cotação aparece com preço e data nulos."""
    _asset(session)

    prices = market_client.get("/api/market/prices").json()

    assert [(p["ticker"], p["close"], p["price_date"]) for p in prices] == [
        ("ABCD11", None, None)
    ]


def test_yfinance_close_is_rounded_to_cents() -> None:
    """O float do yfinance vira Decimal em centavos, sem o ruído binário."""
    rows = [(datetime(2024, 2, 7, tzinfo=UTC), 10.529999732971191)]

    assert to_daily_closes(rows) == [
        DailyClose(price_date=date(2024, 2, 7), close=Decimal("10.53"))
    ]


SERIES_START = date(2000, 1, 1)
# Manhã da mesma sexta-feira, antes da abertura
MORNING = datetime(2024, 2, 9, 8, 0)


@dataclass
class FakeIndexProvider:
    name: str
    rates: dict[IndexSeries, dict[date, str]] = field(
        default_factory=dict[IndexSeries, dict[date, str]]
    )
    offline: bool = False
    calls: list[tuple[IndexSeries, date, date]] = field(
        default_factory=list[tuple[IndexSeries, date, date]]
    )

    def first_date(self, series: IndexSeries) -> date:
        return SERIES_START

    def get_series(
        self, series: IndexSeries, start: date, end: date
    ) -> list[DailyRate]:
        self.calls.append((series, start, end))
        if self.offline:
            raise ConnectionError("sem rede")
        return [
            DailyRate(rate_date=day, value=Decimal(value))
            for day, value in sorted(self.rates.get(series, {}).items())
            if start <= day <= end
        ]


def _cached_rates(session: Session) -> dict[tuple[IndexSeries, date], Decimal]:
    return {
        (row.series, row.rate_date): row.value
        for row in session.scalars(select(IndexHistory))
    }


def _published(until: date) -> FakeIndexProvider:
    """CDI e Selic diários até `until`, e o IPCA de dezembro de 2023."""
    daily = _closes(date(2024, 1, 2), until, "0.043739")
    return FakeIndexProvider(
        "fake",
        {
            IndexSeries.CDI: daily,
            IndexSeries.SELIC: daily,
            IndexSeries.IPCA: {date(2023, 12, 1): "0.56"},
        },
    )


def test_first_index_refresh_loads_whole_series(session: Session) -> None:
    """Sem cache, cada série é pedida desde o início dela na fonte, mesmo sem
    nenhum título de renda fixa cadastrado."""
    provider = _published(date(2024, 2, 8))

    report = refresh_indexes(session, provider, NOW)

    assert report.failed == ()
    assert provider.calls == [(series, SERIES_START, TODAY) for series in IndexSeries]
    assert _cached_rates(session)[(IndexSeries.IPCA, date(2023, 12, 1))] == Decimal(
        "0.56"
    )


def test_index_refresh_with_cache_up_to_date_fetches_nothing(
    session: Session,
) -> None:
    """Com o dia útil anterior no CDI e na Selic, e o IPCA esperado para antes do
    dia 15, recarregar não consulta a fonte."""
    provider = _published(date(2024, 2, 8))
    refresh_indexes(session, provider, MORNING)

    refresh_indexes(session, provider, NOW)

    assert len(provider.calls) == len(IndexSeries)


def test_index_refresh_resumes_from_month_of_last_cached_day(session: Session) -> None:
    """Faltando a última publicação, a série é pedida do dia 1 do mês do último
    valor em cache, e só ela."""
    provider = _published(date(2024, 2, 5))
    refresh_indexes(session, provider, MORNING)

    refresh_indexes(session, provider, NOW)

    assert provider.calls[len(IndexSeries) :] == [
        (IndexSeries.CDI, date(2024, 2, 1), TODAY),
        (IndexSeries.SELIC, date(2024, 2, 1), TODAY),
    ]


def test_ipca_is_expected_from_day_15_of_the_next_month(session: Session) -> None:
    """O IPCA de janeiro passa a faltar no dia 15 de fevereiro."""
    provider = _published(date(2024, 2, 14))
    refresh_indexes(session, provider, NOW)

    refresh_indexes(session, provider, datetime(2024, 2, 15, 9, 0))

    ipca_calls = [call for call in provider.calls if call[0] is IndexSeries.IPCA]
    assert ipca_calls[-1] == (IndexSeries.IPCA, date(2023, 12, 1), date(2024, 2, 15))


def test_offline_index_refresh_keeps_cache(session: Session) -> None:
    """Provider fora do ar deixa o cache como estava, e o aviso sai uma vez só."""
    provider = _published(date(2024, 2, 8))
    refresh_indexes(session, provider, NOW)
    cached = _cached_rates(session)
    provider.offline = True

    first = refresh_indexes(session, provider, datetime(2024, 2, 14, 9, 0))
    second = refresh_indexes(session, provider, datetime(2024, 2, 14, 20, 0))

    assert first.failed == ("CDI", "SELIC")
    assert second.failed == ()
    assert _cached_rates(session) == cached


def test_sgs_value_keeps_all_digits() -> None:
    """O `valor` do SGS chega como string e vira Decimal com todos os dígitos."""
    body = b'[{"data":"05/02/2024","valor":"0.043739"}]'

    assert to_daily_rates(body) == [
        DailyRate(rate_date=date(2024, 2, 5), value=Decimal("0.043739"))
    ]
