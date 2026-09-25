"""O que o cache de dados externos já devia ter, e quando ir à fonte buscar o que falta.

A fonte só é consultada quando falta um dado que já devia existir: o fechamento do
último pregão encerrado, para cotação; a última publicação do BCB, para as séries. E
no máximo uma vez por intervalo, contando também a tentativa que falhou.

Uma falta vira problema de dado (`*_overdue`) só depois da folga de publicação: o
pregão do dia pode demorar a aparecer na fonte, e o CDI de um dia sai na manhã do
seguinte.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from backend.core.enum import IndexSeries
from backend.domain.business_days import BusinessCalendar
from backend.domain.position import HoldingWindow

# Horário local, que é o da B3
SESSION_OPEN = time(10)
SESSION_CLOSE = time(18, 30)
PRICE_INTERVAL = timedelta(minutes=15)
# A fonte respondeu e o buraco ficou: ela não tem o dado, e a próxima tentativa espera
SOURCE_GAP_INTERVAL = timedelta(days=1)
INDEX_INTERVAL = timedelta(hours=6)
# O IBGE publica o IPCA de um mês por volta do dia 10 do seguinte
IPCA_RELEASE_DAY = 15


@dataclass(frozen=True, slots=True, kw_only=True)
class DateRange:
    start: date
    end: date


@dataclass(frozen=True, slots=True, kw_only=True)
class CachedRange:
    """O primeiro e o último dia em cache."""

    first: date
    last: date


@dataclass(frozen=True, slots=True, kw_only=True)
class LastFetch:
    """A última tentativa de consulta, o último sucesso, que podem ser diferentes, e
    se ainda faltava dado além da folga depois da tentativa."""

    attempted_at: datetime
    succeeded_at: datetime | None
    gap: bool

    @property
    def source_lacks_data(self) -> bool:
        return self.gap and self.succeeded_at == self.attempted_at


def _recent(last: LastFetch | None, now: datetime, interval: timedelta) -> bool:
    return last is not None and now - last.attempted_at < interval


def last_closed_session(now: datetime, calendar: BusinessCalendar) -> date:
    today = now.date()
    if calendar.is_business_day(today) and now.time() >= SESSION_CLOSE:
        return today
    return calendar.previous(today)


def session_open(now: datetime, calendar: BusinessCalendar) -> bool:
    return (
        calendar.is_business_day(now.date())
        and SESSION_OPEN <= now.time() < SESSION_CLOSE
    )


def expected_close(
    window: HoldingWindow, now: datetime, calendar: BusinessCalendar
) -> date | None:
    """O último pregão encerrado dentro da janela; nulo enquanto nenhum terminou."""
    expected = last_closed_session(now, calendar)
    if window.end is not None:
        expected = min(expected, calendar.on_or_before(window.end))
    return expected if expected >= calendar.on_or_after(window.start) else None


def _missing_prices(
    window: HoldingWindow,
    cached: CachedRange | None,
    expected: date,
    calendar: BusinessCalendar,
) -> DateRange | None:
    """Do começo da janela, se o cache começa depois dele, até o esperado, se o cache
    termina antes. O último dia em cache entra de novo: ele pode ser parcial."""
    if cached is None:
        return DateRange(start=window.start, end=expected)
    starts_late = cached.first > calendar.on_or_after(window.start)
    if not starts_late and cached.last >= expected:
        return None
    return DateRange(start=window.start if starts_late else cached.last, end=expected)


def price_request(
    window: HoldingWindow,
    cached: CachedRange | None,
    last: LastFetch | None,
    now: datetime,
    calendar: BusinessCalendar,
) -> DateRange | None:
    """Os dias a pedir à fonte, ou nulo quando o cache já tem o que devia."""
    interval = (
        SOURCE_GAP_INTERVAL if last and last.source_lacks_data else PRICE_INTERVAL
    )
    if _recent(last, now, interval):
        return None
    request: DateRange | None = None
    expected = expected_close(window, now, calendar)
    if expected is not None:
        request = _missing_prices(window, cached, expected, calendar)
        # O último pregão gravado antes do fechamento dele ficou com o preço parcial
        succeeded_at = last.succeeded_at if last else None
        if (
            request is None
            and expected == last_closed_session(now, calendar)
            and (
                succeeded_at is None
                or succeeded_at < datetime.combine(expected, SESSION_CLOSE)
            )
        ):
            request = DateRange(start=expected, end=expected)
    # Com o pregão aberto e posição no ativo, o preço parcial do dia entra junto
    if window.end is None and session_open(now, calendar):
        start = request.start if request else cached.last if cached else window.start
        request = DateRange(start=start, end=now.date())
    return request


def prices_overdue(
    window: HoldingWindow,
    cached: CachedRange | None,
    now: datetime,
    calendar: BusinessCalendar,
) -> DateRange | None:
    """Os dias que faltam na janela depois da folga de publicação, ou nulo."""
    expected = expected_close(window, now, calendar)
    if expected is None:
        return None
    if expected == last_closed_session(now, calendar):
        expected = calendar.previous(expected)
        if expected < calendar.on_or_after(window.start):
            return None
    return _missing_prices(window, cached, expected, calendar)


def _month_start(day: date, months_back: int) -> date:
    index = day.year * 12 + day.month - 1 - months_back
    return date(index // 12, index % 12 + 1, 1)


def expected_index_date(
    series: IndexSeries, today: date, calendar: BusinessCalendar
) -> date:
    """O IPCA é datado no dia 1 do mês de referência."""
    if series is IndexSeries.IPCA:
        return _month_start(today, 1 if today.day >= IPCA_RELEASE_DAY else 2)
    return calendar.previous(today)


def index_request(
    series: IndexSeries,
    last_cached: date | None,
    first_date: date,
    last: LastFetch | None,
    now: datetime,
    calendar: BusinessCalendar,
) -> DateRange | None:
    """A série inteira na primeira carga; depois, do dia 1 do mês do último valor em
    cache, o que regrava os valores recentes, que o BCB ainda pode corrigir."""
    if _recent(last, now, INDEX_INTERVAL):
        return None
    today = now.date()
    if last_cached is None:
        return DateRange(start=first_date, end=today)
    if last_cached < expected_index_date(series, today, calendar):
        return DateRange(start=last_cached.replace(day=1), end=today)
    return None


def index_overdue(
    series: IndexSeries,
    last_cached: date | None,
    today: date,
    calendar: BusinessCalendar,
) -> bool:
    """O IPCA já tem a folga no esperado; a série diária ganha um dia útil."""
    if last_cached is None:
        return True
    expected = expected_index_date(series, today, calendar)
    if series is not IndexSeries.IPCA:
        expected = calendar.previous(expected)
    return last_cached < expected
