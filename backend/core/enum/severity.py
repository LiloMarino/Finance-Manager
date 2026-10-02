from enum import StrEnum


class Severity(StrEnum):
    """A gravidade de uma pendência. Crítica pede ação com prazo; atenção deixa um
    número errado ou longe da meta; informativa melhora o app sem mudar número de
    hoje. O contador da sidebar soma só as duas primeiras."""

    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"
