"""A tarefa que roda o alerta diário com o app fechado."""

from __future__ import annotations

import sys
from datetime import time
from pathlib import Path

from backend.domain.task_schedule import (
    SchedulerUnavailableError,
    TaskCommand,
    TaskScheduler,
    scheduled_time,
    task_xml,
)
from backend.features.alert.dto import ScheduleDTO

# A raiz do repositório: backend/features/alert/service.py fica três pastas abaixo
PROJECT_ROOT = Path(__file__).resolve().parents[3]
ALERT_SCRIPT = "alert.py"
# O "Testar agora" deixa este marcador antes de rodar a tarefa: o `schtasks /Run`
# roda o comando agendado como está, e o marcador é como a rodada de teste chega ao
# `alert.py`, que o apaga e mostra a janela mesmo sem aviso
TEST_FLAG = PROJECT_ROOT / "logs" / "alert-test.flag"


def task_command() -> TaskCommand:
    """O Python do ambiente do app, na versão sem console, rodando o `alert.py` a
    partir da raiz do repositório."""
    executable = Path(sys.executable)
    windowless = executable.with_name("pythonw.exe")
    return TaskCommand(
        program=windowless if windowless.exists() else executable,
        arguments=ALERT_SCRIPT,
        working_dir=PROJECT_ROOT,
    )


def schedule_status(scheduler: TaskScheduler) -> ScheduleDTO:
    xml = scheduler.query()
    at = scheduled_time(xml) if xml is not None else None
    return ScheduleDTO(scheduled=xml is not None, time=at)


def install_schedule(scheduler: TaskScheduler, at: time) -> ScheduleDTO:
    scheduler.install(task_xml(task_command(), at))
    return schedule_status(scheduler)


def remove_schedule(scheduler: TaskScheduler) -> None:
    scheduler.remove()


def run_now(scheduler: TaskScheduler) -> None:
    if scheduler.query() is None:
        raise SchedulerUnavailableError("Agende o alerta antes de testá-lo.")
    TEST_FLAG.parent.mkdir(parents=True, exist_ok=True)
    TEST_FLAG.touch()
    try:
        scheduler.run()
    except Exception:
        TEST_FLAG.unlink(missing_ok=True)
        raise
