from __future__ import annotations

from backend.core.dto import BaseDTO
from backend.core.enum import DataIssueKind, Severity


class DataIssueDTO(BaseDTO):
    """Uma pendência: o que falta, o que fica errado por causa disso e a tela
    (`path`) onde ela se resolve. A gravidade vem do tipo."""

    kind: DataIssueKind
    severity: Severity
    subject: str
    missing: str
    affects: str
    path: str
