from __future__ import annotations

from datetime import date, datetime, time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from alert import alert_lines
from backend.app import create_app
from backend.core.enum import DataIssueKind, Severity
from backend.domain.task_schedule import TaskCommand, scheduled_time, task_xml
from backend.features.data_health.dto import DataIssueDTO
from backend.features.data_health.service import data_issues
from backend.features.providers import get_scheduler


class FakeScheduler:
    """O Agendador de Tarefas em memória: guarda o XML instalado."""

    def __init__(self) -> None:
        self.xml: str | None = None
        self.runs = 0

    def install(self, xml: str) -> None:
        self.xml = xml

    def remove(self) -> None:
        self.xml = None

    def query(self) -> str | None:
        return self.xml

    def run(self) -> None:
        self.runs += 1


@pytest.fixture
def scheduler() -> FakeScheduler:
    return FakeScheduler()


@pytest.fixture
def alert_client(scheduler: FakeScheduler) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_scheduler] = lambda: scheduler
    return TestClient(app)


def _issue(kind: DataIssueKind, subject: str) -> DataIssueDTO:
    return DataIssueDTO(
        kind=kind,
        severity=Severity.WARNING,
        subject=subject,
        missing="Algo.",
        affects="Algo.",
        path="/",
    )


def test_alert_keeps_darf_rebalance_and_idle_cash() -> None:
    """O alerta avisa do DARF a pagar, da subcarteira fora do limite e do saldo
    parado; os buracos de dado ficam só no painel."""
    lines = alert_lines(
        [
            _issue(DataIssueKind.DARF_DUE, "DARF de fevereiro de 2024"),
            _issue(DataIssueKind.REBALANCE_BREACH, "Renda"),
            _issue(DataIssueKind.MISSING_CNPJ, "ABCD11"),
            _issue(DataIssueKind.IDLE_CASH, "Saldo"),
        ]
    )

    assert lines == [
        "DARF de fevereiro de 2024: Algo.",
        "Renda: Algo.",
        "Saldo: Algo.",
    ]


def test_alert_reads_the_same_issues_as_the_panel(
    api: TestClient, session: Session
) -> None:
    """O que o alerta avisa sai da mesma função de Saúde dos dados: com o saldo acima
    do limite, os dois mostram."""
    api.post(
        "/api/cash/checks",
        json={"check_date": date.today().isoformat(), "balance": "500"},
    )

    lines = alert_lines(data_issues(session, datetime.now()))

    assert [line.split(":")[0] for line in lines] == ["Saldo"]


def test_task_runs_daily_even_after_missing_the_time() -> None:
    """A tarefa roda todo dia no horário, e assim que der quando o PC estava
    desligado; o programa, o script e a pasta vão no Exec."""
    command = TaskCommand(
        program=Path(r"C:\app\.venv\Scripts\pythonw.exe"),
        arguments="alert.py",
        working_dir=Path(r"C:\app"),
    )

    xml = task_xml(command, time(4, 0))

    assert "<StartWhenAvailable>true</StartWhenAvailable>" in xml
    assert "<DaysInterval>1</DaysInterval>" in xml
    assert r"<Command>C:\app\.venv\Scripts\pythonw.exe</Command>" in xml
    assert "<Arguments>alert.py</Arguments>" in xml
    assert r"<WorkingDirectory>C:\app</WorkingDirectory>" in xml
    assert scheduled_time(xml) == time(4, 0)


def test_schedule_is_created_run_and_removed(
    alert_client: TestClient, scheduler: FakeScheduler
) -> None:
    """Agendar cria a tarefa no horário, testar roda a tarefa, e remover apaga."""
    assert alert_client.get("/api/alert/schedule").json() == {
        "scheduled": False,
        "time": None,
    }

    created = alert_client.put("/api/alert/schedule", json={"time": "07:30"}).json()
    ran = alert_client.post("/api/alert/run")
    alert_client.delete("/api/alert/schedule")

    assert created == {"scheduled": True, "time": "07:30:00"}
    assert ran.status_code == 204
    assert scheduler.runs == 1
    assert alert_client.get("/api/alert/schedule").json()["scheduled"] is False


def test_running_without_schedule_is_refused(alert_client: TestClient) -> None:
    """Testar pede a tarefa agendada: é ela que roda."""
    response = alert_client.post("/api/alert/run")

    assert response.status_code == 422
