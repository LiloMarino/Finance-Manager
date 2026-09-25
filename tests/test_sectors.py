from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient


def _sector(api: TestClient, name: str = "Financeiro") -> dict[str, Any]:
    response = api.post("/api/sectors", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()


def _segment(api: TestClient, sector_id: int, name: str = "Bancos") -> dict[str, Any]:
    response = api.post(f"/api/sectors/{sector_id}/segments", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()


def _asset(api: TestClient, segment_id: int | None = None) -> dict[str, Any]:
    response = api.post(
        "/api/assets",
        json={"ticker": "ABCD3", "asset_class": "stock", "segment_id": segment_id},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_sector_name_is_unique(api: TestClient) -> None:
    """Dois setores com o mesmo nome voltam 409; o nome chega sem espaços nas
    pontas."""
    sector = _sector(api, "  Financeiro ")

    clash = api.post("/api/sectors", json={"name": "Financeiro"})

    assert sector["name"] == "Financeiro"
    assert clash.status_code == 409


def test_segment_name_is_unique_within_its_sector(api: TestClient) -> None:
    """O mesmo segmento cabe em dois setores, mas não duas vezes no mesmo."""
    finance = _sector(api)
    energy = _sector(api, "Energia")
    _segment(api, finance["id"], "Outros")

    other_sector = api.post(
        f"/api/sectors/{energy['id']}/segments", json={"name": "Outros"}
    )
    same_sector = api.post(
        f"/api/sectors/{finance['id']}/segments", json={"name": "Outros"}
    )

    assert other_sector.status_code == 201
    assert same_sector.status_code == 409


def test_asset_gets_its_sector_through_the_segment(api: TestClient) -> None:
    """O ativo aponta para o segmento e devolve os nomes do setor e do segmento; o
    segmento conta o ativo."""
    sector = _sector(api)
    segment = _segment(api, sector["id"])

    asset = _asset(api, segment["id"])
    [listed] = api.get("/api/sectors").json()

    assert (asset["sector"], asset["segment"]) == ("Financeiro", "Bancos")
    assert listed["segments"][0]["asset_count"] == 1


def test_asset_without_segment_is_unclassified(api: TestClient) -> None:
    """Sem segmento, o ativo fica sem setor; segmento inexistente é 404."""
    asset = _asset(api)
    missing = api.put(
        f"/api/assets/{asset['id']}",
        json={"ticker": "ABCD3", "asset_class": "stock", "segment_id": 999},
    )

    assert (asset["sector"], asset["segment"]) == (None, None)
    assert missing.status_code == 404


def test_segment_with_assets_cannot_be_deleted(api: TestClient) -> None:
    """Segmento com ativo e setor com segmento voltam 409 com o motivo; vazios,
    saem."""
    sector = _sector(api)
    segment = _segment(api, sector["id"])
    asset = _asset(api, segment["id"])

    blocked_segment = api.delete(f"/api/sectors/segments/{segment['id']}")
    blocked_sector = api.delete(f"/api/sectors/{sector['id']}")
    api.put(
        f"/api/assets/{asset['id']}",
        json={"ticker": "ABCD3", "asset_class": "stock", "segment_id": None},
    )
    deleted_segment = api.delete(f"/api/sectors/segments/{segment['id']}")
    deleted_sector = api.delete(f"/api/sectors/{sector['id']}")

    assert blocked_segment.status_code == 409
    assert "ativos" in blocked_segment.json()["detail"]
    assert blocked_sector.status_code == 409
    assert "segmentos" in blocked_sector.json()["detail"]
    assert (deleted_segment.status_code, deleted_sector.status_code) == (204, 204)


def test_rename_keeps_names_unique(api: TestClient) -> None:
    """Renomear troca o nome, e o nome repetido volta 409."""
    sector = _sector(api)
    _sector(api, "Energia")
    segment = _segment(api, sector["id"])
    _segment(api, sector["id"], "Seguros")

    renamed = api.put(f"/api/sectors/{sector['id']}", json={"name": "Finanças"})
    clash = api.put(f"/api/sectors/{sector['id']}", json={"name": "Energia"})
    segment_clash = api.put(
        f"/api/sectors/segments/{segment['id']}", json={"name": "Seguros"}
    )

    assert renamed.status_code == 204
    assert [item["name"] for item in api.get("/api/sectors").json()] == [
        "Energia",
        "Finanças",
    ]
    assert clash.status_code == 409
    assert segment_clash.status_code == 409
