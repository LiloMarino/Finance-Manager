"""A tarefa diária do alerta no Agendador de Tarefas do Windows, descrita em XML.

O XML é o formato que o `schtasks` aceita e devolve igual em qualquer idioma do
Windows; a saída em lista vem traduzida. `StartWhenAvailable` roda a tarefa assim que
o PC liga, quando ele estava desligado no horário.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, time
from pathlib import Path
from typing import Protocol
from xml.sax.saxutils import escape

from backend.core.errors import FinanceError

TASK_NAME = r"Finance Manager\Alerta"

# Uma data qualquer no passado: o gatilho diário só usa o horário dela
_START_DAY = date(2026, 1, 1)
_START_BOUNDARY = re.compile(r"<StartBoundary>\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})")


class SchedulerUnavailableError(FinanceError):
    status = 422


@dataclass(frozen=True, slots=True, kw_only=True)
class TaskCommand:
    """O que a tarefa roda: o programa, os argumentos e a pasta de trabalho, que é
    de onde saem os caminhos relativos do `config.toml`."""

    program: Path
    arguments: str
    working_dir: Path


class TaskScheduler(Protocol):
    def install(self, xml: str) -> None: ...

    def remove(self) -> None: ...

    def query(self) -> str | None:
        """O XML da tarefa instalada, ou nulo se ela não existe."""
        ...

    def run(self) -> None: ...


def task_xml(command: TaskCommand, at: time) -> str:
    start = f"{_START_DAY.isoformat()}T{at:%H:%M}:00"
    return f"""<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Alerta diário de rebalanceamento e saldo parado do Finance Manager.</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>{start}</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Enabled>true</Enabled>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>{escape(str(command.program))}</Command>
      <Arguments>{escape(command.arguments)}</Arguments>
      <WorkingDirectory>{escape(str(command.working_dir))}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"""


def scheduled_time(xml: str) -> time | None:
    """O horário do gatilho diário lido do XML que o `schtasks` devolve."""
    found = _START_BOUNDARY.search(xml)
    if found is None:
        return None
    return time(int(found.group(1)), int(found.group(2)))
