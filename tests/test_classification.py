from __future__ import annotations

from collections.abc import Iterator
from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import Engine, func, select
from sqlalchemy.orm import Session

from backend.app import create_app
from backend.core.database.session import get_session
from backend.core.enum import AssetClass, OperationType
from backend.core.models.models import Asset, Operation, TickerProfile
from backend.domain.classification import (
    ClassifiedPeer,
    CompanyProfile,
    ProfileUnavailableError,
    suggest,
)
from backend.features.providers import get_profile_provider

BANKS = CompanyProfile(sector="Financial Services", industry="Banks - Regional")
INSURANCE = CompanyProfile(sector="Financial Services", industry="Insurance - Diversified")


class FakeProfiles:
    def __init__(
        self, profiles: dict[str, CompanyProfile], *, failing: set[str] | None = None
    ) -> None:
        self.profiles = profiles
        self.failing = failing or set()
        self.calls: list[str] = []

    def profile(self, ticker: str) -> CompanyProfile | None:
        self.calls.append(ticker)
        if ticker in self.failing:
            raise ProfileUnavailableError("fonte fora do ar")
        return self.profiles.get(ticker)


def _client(engine: Engine, profiles: FakeProfiles) -> TestClient:
    def session_override() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_profile_provider] = lambda: profiles
    return TestClient(app)


def _peer(profile: CompanyProfile, segment_id: int, sector_id: int = 1) -> ClassifiedPeer:
    return ClassifiedPeer(profile=profile, segment_id=segment_id, sector_id=sector_id)


def _segment(api: TestClient, sector: str = "Financeiro", segment: str = "Bancos") -> int:
    sector_id = api.post("/api/sectors", json={"name": sector}).json()["id"]
    return api.post(
        f"/api/sectors/{sector_id}/segments", json={"name": segment}
    ).json()["id"]


def _asset(
    engine: Engine, ticker: str, segment_id: int | None = None, *, held: bool = True
) -> int:
    with Session(engine) as session:
        asset = Asset(ticker=ticker, asset_class=AssetClass.STOCK, segment_id=segment_id)
        session.add(asset)
        session.flush()
        if held:
            session.add(
                Operation(
                    asset_id=asset.id,
                    operation_date=date(2024, 1, 2),
                    operation_type=OperationType.BUY,
                    quantity=Decimal(10),
                    unit_price=Decimal(10),
                )
            )
        session.commit()
        return asset.id


def _cached(engine: Engine) -> int:
    with Session(engine) as session:
        return session.scalar(select(func.count()).select_from(TickerProfile)) or 0


def test_suggests_the_segment_of_the_peers_with_the_same_industry() -> None:
    """O ticker recebe o segmento mais comum entre os ativos da mesma indústria, com o
    setor dele; no empate, o de menor id."""
    peers = [
        _peer(BANKS, segment_id=7, sector_id=2),
        _peer(BANKS, segment_id=5, sector_id=2),
        _peer(BANKS, segment_id=7, sector_id=2),
        _peer(INSURANCE, segment_id=9, sector_id=2),
    ]
    tie = [_peer(BANKS, segment_id=7), _peer(BANKS, segment_id=5)]

    found = suggest(BANKS, peers, {})
    tied = suggest(BANKS, tie, {})

    assert found is not None and (found.segment_id, found.sector_id) == (7, 2)
    assert (found.new_sector_name, found.new_segment_name) == (None, None)
    assert tied is not None and tied.segment_id == 5


def test_new_industry_suggests_creating_the_segment_in_the_peers_sector() -> None:
    """Sem ativo da mesma indústria, o setor vem dos ativos com o mesmo setor na fonte,
    e o segmento chega como nome para criar."""
    found = suggest(INSURANCE, [_peer(BANKS, segment_id=7, sector_id=3)], {})

    assert found is not None
    assert (found.segment_id, found.sector_id) == (None, 3)
    assert (found.new_sector_name, found.new_segment_name) == (
        None,
        "Insurance - Diversified",
    )


def test_first_of_its_sector_gets_the_translated_sector_name() -> None:
    """Sem nenhum ativo parecido, o setor chega traduzido para criar; o setor do usuário
    com o mesmo nome, sem diferença de maiúsculas, é usado no lugar."""
    new = suggest(BANKS, [], {"Energia": 1})
    existing = suggest(BANKS, [], {"FINANCEIRO": 4})

    assert new is not None
    assert (new.sector_id, new.new_sector_name) == (None, "Financeiro")
    assert new.new_segment_name == "Banks - Regional"
    assert existing is not None
    assert (existing.sector_id, existing.new_sector_name) == (4, None)


def test_etf_without_sector_or_industry_has_no_suggestion() -> None:
    """O ETF, sem setor nem indústria na fonte, fica sem sugestão."""
    assert suggest(CompanyProfile(sector=None, industry=None), [], {}) is None


def test_profile_is_fetched_once_per_ticker(engine: Engine) -> None:
    """A segunda sugestão do mesmo ticker vem do cache, sem consultar a fonte."""
    profiles = FakeProfiles({"ABCD3": BANKS})
    api = _client(engine, profiles)

    first = api.get("/api/classification/suggestion", params={"ticker": " abcd3 "})
    api.get("/api/classification/suggestion", params={"ticker": "ABCD3"})

    assert first.status_code == 200
    assert first.json()["source_industry"] == "Banks - Regional"
    assert first.json()["new_sector_name"] == "Financeiro"
    assert profiles.calls == ["ABCD3"]


def test_unknown_ticker_and_empty_profile(engine: Engine) -> None:
    """O ticker que a fonte não conhece volta nulo e não fica em cache; o ETF volta
    nulo e fica, para não consultar de novo."""
    profiles = FakeProfiles({"ABCD11": CompanyProfile(sector=None, industry=None)})
    api = _client(engine, profiles)

    unknown = api.get("/api/classification/suggestion", params={"ticker": "ZZZZ3"})
    etf = api.get("/api/classification/suggestion", params={"ticker": "ABCD11"})

    assert (unknown.status_code, unknown.json()) == (200, None)
    assert etf.json() is None
    assert _cached(engine) == 1


def test_source_down_without_cache_is_service_unavailable(engine: Engine) -> None:
    """Com a fonte fora do ar e sem perfil em cache, a sugestão dá 503 e nada é
    gravado."""
    api = _client(engine, FakeProfiles({}, failing={"ABCD3"}))

    response = api.get("/api/classification/suggestion", params={"ticker": "ABCD3"})

    assert response.status_code == 503
    assert _cached(engine) == 0


def test_renamed_segment_keeps_being_suggested(engine: Engine) -> None:
    """A sugestão aponta para o segmento pelo id: renomeado, ele continua sugerido para
    os ativos da mesma indústria."""
    api = _client(engine, FakeProfiles({"ABCD3": BANKS, "EFGH3": BANKS}))
    segment_id = _segment(api, segment="Banks - Regional")
    _asset(engine, "EFGH3", segment_id)

    before = api.get("/api/classification/suggestion", params={"ticker": "ABCD3"})
    api.put(f"/api/sectors/segments/{segment_id}", json={"name": "Bancos"})
    after = api.get("/api/classification/suggestion", params={"ticker": "ABCD3"})
    [sector] = api.get("/api/sectors").json()

    assert before.json()["segment_id"] == after.json()["segment_id"] == segment_id
    assert sector["segments"][0]["name"] == "Bancos"


def test_pending_suggests_for_held_unclassified_assets(engine: Engine) -> None:
    """O pendente lista os ativos em carteira sem segmento, com a sugestão que os
    ativos classificados dão, inclusive os fora da carteira."""
    profiles = FakeProfiles({"ABCD3": BANKS, "EFGH3": BANKS, "IJKL3": INSURANCE})
    api = _client(engine, profiles)
    segment_id = _segment(api)
    _asset(engine, "EFGH3", segment_id, held=False)
    abcd = _asset(engine, "ABCD3")
    ijkl = _asset(engine, "IJKL3")
    _asset(engine, "MNOP3", held=False)

    body = api.get("/api/classification/pending").json()

    assert body["source_unavailable"] is False
    assert [(item["asset_id"], item["ticker"]) for item in body["items"]] == [
        (abcd, "ABCD3"),
        (ijkl, "IJKL3"),
    ]
    assert body["items"][0]["suggestion"]["segment_id"] == segment_id
    assert body["items"][1]["suggestion"]["segment_id"] is None
    assert body["items"][1]["suggestion"]["new_segment_name"] == INSURANCE.industry


def test_pending_stops_at_the_first_failure(engine: Engine) -> None:
    """Quando a fonte falha, a rodada para ali: os ativos seguintes ficam sem sugestão
    e o pendente avisa que a fonte não respondeu."""
    profiles = FakeProfiles(
        {"ABCD3": BANKS, "EFGH3": BANKS, "IJKL3": BANKS}, failing={"EFGH3"}
    )
    api = _client(engine, profiles)
    for ticker in ("ABCD3", "EFGH3", "IJKL3"):
        _asset(engine, ticker)

    body = api.get("/api/classification/pending").json()

    assert profiles.calls == ["ABCD3", "EFGH3"]
    assert body["source_unavailable"] is True
    assert [item["suggestion"] is None for item in body["items"]] == [
        False,
        True,
        True,
    ]


def test_accept_classifies_every_asset(engine: Engine) -> None:
    """Aceitar grava o segmento de todos os ativos, e o pendente e o painel esvaziam."""
    api = _client(engine, FakeProfiles({"ABCD3": BANKS, "EFGH3": BANKS}))
    segment_id = _segment(api)
    items = [
        {"asset_id": _asset(engine, ticker), "segment_id": segment_id}
        for ticker in ("ABCD3", "EFGH3")
    ]

    response = api.post("/api/classification/accept", json={"items": items})
    issues = api.get("/api/data-health").json()

    assert response.status_code == 204
    assert api.get("/api/classification/pending").json()["items"] == []
    assert [issue for issue in issues if issue["kind"] == "unclassified_asset"] == []


def test_accept_with_missing_segment_changes_nothing(engine: Engine) -> None:
    """Um segmento inexistente no lote dá 404, e nenhum ativo é classificado."""
    api = _client(engine, FakeProfiles({}))
    segment_id = _segment(api)
    first = _asset(engine, "ABCD3")
    second = _asset(engine, "EFGH3")

    response = api.post(
        "/api/classification/accept",
        json={
            "items": [
                {"asset_id": first, "segment_id": segment_id},
                {"asset_id": second, "segment_id": segment_id + 99},
            ]
        },
    )

    assert response.status_code == 404
    with Session(engine) as session:
        assert session.get(Asset, first) is not None
        assert session.scalars(select(Asset.segment_id)).all() == [None, None]
