from __future__ import annotations

from datetime import time

from backend.core.dto import BaseDTO


class ScheduleDTO(BaseDTO):
    """A tarefa diária no Agendador de Tarefas: se existe e em que horário roda."""

    scheduled: bool
    time: time | None


class ScheduleInDTO(BaseDTO):
    time: time
