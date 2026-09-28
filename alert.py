"""O alerta diário, rodado pelo Agendador de Tarefas sem subir o servidor.

Atualiza as cotações e as séries, lê Saúde dos dados e, se alguma subcarteira passou
do limite ou o saldo está parado, abre uma janela com o aviso. Sem nada a avisar,
termina sem mostrar nada.
"""

from __future__ import annotations

import logging
import tkinter
from collections.abc import Iterable
from datetime import datetime
from pathlib import Path
from tkinter import messagebox

from sqlalchemy.orm import Session

from backend.adapters.bcb_sgs_provider import BcbSgsProvider
from backend.adapters.yfinance_provider import YFinanceProvider
from backend.config import settings
from backend.core.database.migrate import current_revision, head_revision
from backend.core.database.session import get_engine
from backend.core.enum import DataIssueKind
from backend.core.logger import setup_logging
from backend.features.data_health.dto import DataIssueDTO
from backend.features.data_health.service import data_issues
from backend.features.market.indexes import refresh_indexes
from backend.features.market.service import refresh_prices

TITLE = "Finance Manager"
LOG_FILE = Path("logs/alert.log")

# O alerta é o recorte de Saúde dos dados que pede ação, e não correção de dado
ALERT_KINDS = frozenset({DataIssueKind.REBALANCE_BREACH, DataIssueKind.IDLE_CASH})

logger = logging.getLogger("alert")


def alert_lines(issues: Iterable[DataIssueDTO]) -> list[str]:
    return [
        f"{issue.subject}: {issue.missing}"
        for issue in issues
        if issue.kind in ALERT_KINDS
    ]


def _show(message: str) -> None:
    """Uma janela de aviso, só com o OK, intrusiva de propósito para não passar
    batida."""
    root = tkinter.Tk()
    root.withdraw()
    messagebox.showwarning(TITLE, message, parent=root)
    root.destroy()


def main() -> None:
    setup_logging(settings.logging.level, LOG_FILE)
    # A migration fica com o start do app, que tira o snapshot antes dela
    if current_revision(settings.database.path) != head_revision():
        logger.warning("Banco com migration pendente; alerta não rodou.")
        _show(
            "Abra o app uma vez para atualizar o banco; o alerta volta a rodar depois."
        )
        return

    now = datetime.now()
    with Session(get_engine()) as session:
        market = YFinanceProvider()
        refresh_prices(session, market, now)
        refresh_indexes(session, BcbSgsProvider(), market, now)
        lines = alert_lines(data_issues(session, now))

    logger.info("Alerta com %d aviso(s).", len(lines))
    if lines:
        _show("\n\n".join(lines))


if __name__ == "__main__":
    main()
