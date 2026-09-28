from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

from backend.domain.task_schedule import TASK_NAME, SchedulerUnavailableError

TIMEOUT_SECONDS = 30


class WindowsTaskScheduler:
    """O Agendador de Tarefas pelo `schtasks`, que vem com o Windows."""

    def _schtasks(self, *args: str) -> subprocess.CompletedProcess[bytes]:
        if sys.platform != "win32":
            raise SchedulerUnavailableError(
                "O agendamento usa o Agendador de Tarefas, que só existe no Windows."
            )
        return subprocess.run(
            ["schtasks", *args],
            capture_output=True,
            timeout=TIMEOUT_SECONDS,
            check=False,
        )

    def _checked(self, *args: str) -> None:
        result = self._schtasks(*args)
        if result.returncode != 0:
            detail = result.stderr.decode(errors="replace").strip()
            raise SchedulerUnavailableError(f"O Agendador de Tarefas recusou: {detail}")

    def install(self, xml: str) -> None:
        # O schtasks lê o XML em UTF-16, como o declarado no cabeçalho dele
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "alerta.xml"
            path.write_text(xml, encoding="utf-16")
            self._checked("/Create", "/TN", TASK_NAME, "/XML", str(path), "/F")

    def remove(self) -> None:
        if self.query() is not None:
            self._checked("/Delete", "/TN", TASK_NAME, "/F")

    def query(self) -> str | None:
        result = self._schtasks("/Query", "/TN", TASK_NAME, "/XML")
        if result.returncode != 0:
            return None
        return result.stdout.decode(errors="replace")

    def run(self) -> None:
        self._checked("/Run", "/TN", TASK_NAME)
