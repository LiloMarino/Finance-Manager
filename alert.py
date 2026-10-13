"""O alerta diário, rodado pelo Agendador de Tarefas sem subir o servidor.

Atualiza as cotações e as séries, lê as pendências e, se há DARF a pagar, alguma
subcarteira passou do limite ou o saldo está parado, abre uma janela com o aviso.
Sem nada a avisar, termina sem mostrar nada, a não ser na rodada do "Testar agora",
que sempre abre a janela.
"""

from __future__ import annotations

import logging
import tkinter
from collections.abc import Iterable
from datetime import datetime
from pathlib import Path
from tkinter import messagebox

from sqlalchemy.orm import Session

from backend.adapters.b3_history_archive import B3HistoryArchive
from backend.adapters.bcb_sgs_provider import BcbSgsProvider
from backend.adapters.yfinance_provider import YFinanceProvider
from backend.config import settings
from backend.core.database.migrate import current_revision, head_revision
from backend.core.database.session import get_engine
from backend.core.enum import DataIssueKind
from backend.core.logger import setup_logging
from backend.features.alert.service import TEST_FLAG
from backend.features.data_health.dto import DataIssueDTO
from backend.features.data_health.service import data_issues
from backend.features.market.indexes import refresh_indexes
from backend.features.market.service import refresh_prices

TITLE = "Finance Manager"
ALL_CLEAR = "Tudo em ordem: nada a avisar hoje."
LOG_FILE = Path("logs/alert.log")

# O alerta é o recorte das pendências que pede ação, e não correção de dado
ALERT_KINDS = frozenset(
    {DataIssueKind.DARF_DUE, DataIssueKind.REBALANCE_BREACH, DataIssueKind.IDLE_CASH}
)

logger = logging.getLogger("alert")


def alert_lines(issues: Iterable[DataIssueDTO]) -> list[str]:
    return [
        f"{issue.subject}: {issue.missing}"
        for issue in issues
        if issue.kind in ALERT_KINDS
    ]


def consume_test_flag(flag: Path) -> bool:
    """Se esta rodada veio do "Testar agora". O marcador vale para uma rodada só."""
    try:
        flag.unlink()
    except FileNotFoundError:
        return False
    return True


def alert_message(lines: list[str], *, testing: bool) -> str | None:
    """O texto da janela, ou nulo quando ela não abre."""
    if lines:
        return "\n\n".join(lines)
    return ALL_CLEAR if testing else None


def _show(message: str) -> None:
    """Uma janela de aviso, só com o OK, intrusiva de propósito para não passar
    batida."""
    root = tkinter.Tk()
    root.withdraw()
    messagebox.showwarning(TITLE, message, parent=root)
    root.destroy()


def main() -> None:
    setup_logging(settings.logging.level, LOG_FILE)
    testing = consume_test_flag(TEST_FLAG)
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
        refresh_prices(session, market, B3HistoryArchive(), now)
        refresh_indexes(session, BcbSgsProvider(), market, now)
        lines = alert_lines(data_issues(session, now))

    logger.info("Alerta com %d aviso(s)%s.", len(lines), " (teste)" if testing else "")
    message = alert_message(lines, testing=testing)
    if message is not None:
        _show(message)


if __name__ == "__main__":
    main()
