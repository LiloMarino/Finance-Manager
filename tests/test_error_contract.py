"""Todo 4xx/5xx sai como {"detail": "<string>"}.

É essa promessa que permite o `getApiErrorMessage` existir do lado do front: uma
função só, que sabe ler qualquer erro do backend e virar toast.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app import create_app
from backend.core.dto import BaseDTO, DecimalStrIn
from backend.core.errors import FinanceError


class TeapotError(FinanceError):
    status = 418


class EchoPayload(BaseDTO):
    quantity: DecimalStrIn


def build_probe_app() -> FastAPI:
    app = create_app()

    @app.get("/api/probe/boom")
    def boom() -> None:
        raise TeapotError("estourou de propósito")

    @app.post("/api/probe/echo")
    def echo(payload: EchoPayload) -> EchoPayload:
        return payload

    return app


def test_domain_error_uses_class_status() -> None:
    """Erro de domínio sai com o `status` declarado na classe e a mensagem em `detail`."""
    response = TestClient(build_probe_app()).get("/api/probe/boom")

    assert response.status_code == 418
    assert response.json() == {"detail": "estourou de propósito"}


def test_validation_error_uses_same_envelope() -> None:
    """O 422 do Pydantic sai achatado, com `detail` string citando o campo."""
    response = TestClient(build_probe_app()).post("/api/probe/echo", json={})

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, str)
    assert "quantity" in detail


def test_unknown_route_also_has_string_detail(client: TestClient) -> None:
    """O 404 de rota inexistente também traz `detail` string."""
    response = client.get("/api/nao-existe")

    assert response.status_code == 404
    assert isinstance(response.json()["detail"], str)
