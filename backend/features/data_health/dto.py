from __future__ import annotations

from backend.core.dto import BaseDTO
from backend.core.enum import DataIssueKind


class DataIssueDTO(BaseDTO):
    """Um problema de dado que afeta algum número: o que falta, o que fica errado
    por causa disso e a tela (`path`) onde ele se corrige."""

    kind: DataIssueKind
    subject: str
    missing: str
    affects: str
    path: str
