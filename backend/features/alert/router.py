from __future__ import annotations

from fastapi import APIRouter, status

from backend.features.alert.dto import ScheduleDTO, ScheduleInDTO
from backend.features.alert.service import (
    install_schedule,
    remove_schedule,
    run_now,
    schedule_status,
)
from backend.features.providers import SchedulerDep

router = APIRouter(prefix="/api/alert", tags=["alert"])


@router.get("/schedule")
def get_schedule(scheduler: SchedulerDep) -> ScheduleDTO:
    return schedule_status(scheduler)


@router.put("/schedule")
def put_schedule(scheduler: SchedulerDep, payload: ScheduleInDTO) -> ScheduleDTO:
    """Cria a tarefa diária no horário, ou troca o horário da que existe."""
    return install_schedule(scheduler, payload.time)


@router.delete("/schedule", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(scheduler: SchedulerDep) -> None:
    remove_schedule(scheduler)


@router.post("/run", status_code=status.HTTP_204_NO_CONTENT)
def run(scheduler: SchedulerDep) -> None:
    """Roda a tarefa agendada agora, pelo próprio Agendador."""
    run_now(scheduler)
