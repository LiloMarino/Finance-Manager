from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable, Sequence
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from backend.core.enum import IncomeType, PortfolioCategory
from backend.core.errors import FinanceError
from backend.core.models.models import Asset, IncomeEvent
from backend.domain.daily_series import InvalidPeriodError
from backend.domain.income import (
    YIELD_MONTHS,
    ZERO,
    IncomeRecord,
    last_payment,
    per_unit,
    period_key,
    periods,
    ratio,
    since,
    total,
)
from backend.domain.position import Position, current_positions
from backend.features.income.dto import (
    CategoryAmountDTO,
    IncomeAssetDTO,
    IncomeBarDTO,
    IncomeDistributionDTO,
    IncomeEventDTO,
    IncomeEventInDTO,
    IncomeListDTO,
    IncomePerformanceDTO,
)
from backend.repository.income import income_records
from backend.repository.market import latest_prices
from backend.repository.operations import operation_records
from backend.repository.tickers import ticker_history


class IncomeNotFoundError(FinanceError):
    status = 404


class InvalidIncomeError(FinanceError):
    status = 422


def _category(record: IncomeRecord) -> PortfolioCategory:
    return PortfolioCategory(record.asset_class)


def _categories(records: Sequence[IncomeRecord]) -> list[CategoryAmountDTO]:
    """O total de cada categoria que pagou, na ordem das categorias."""
    amounts: defaultdict[PortfolioCategory, Decimal] = defaultdict(lambda: ZERO)
    for record in records:
        amounts[_category(record)] += record.amount
    whole = total(records)
    return [
        CategoryAmountDTO(
            category=category, amount=amounts[category], share=amounts[category] / whole
        )
        for category in PortfolioCategory
        if amounts[category] > ZERO
    ]


def _in_period(
    records: Iterable[IncomeRecord], start: date | None, end: date | None
) -> list[IncomeRecord]:
    if start is not None and end is not None and start > end:
        raise InvalidPeriodError("O início do período é depois do fim.")
    return [
        record
        for record in records
        if (start is None or record.payment_date >= start)
        and (end is None or record.payment_date <= end)
    ]


def list_income(
    session: Session,
    *,
    asset_id: int | None = None,
    category: PortfolioCategory | None = None,
    income_type: IncomeType | None = None,
    start: date | None = None,
    end: date | None = None,
) -> IncomeListDTO:
    """Mais recentes primeiro, cada um com o ticker vigente no pagamento."""
    history = ticker_history(session)
    found = [
        record
        for record in _in_period(income_records(session), start, end)
        if (asset_id is None or record.asset_id == asset_id)
        and (category is None or _category(record) is category)
        and (income_type is None or record.income_type is income_type)
    ]
    found.sort(key=lambda record: (record.payment_date, record.id), reverse=True)
    return IncomeListDTO(
        events=[
            IncomeEventDTO(
                id=record.id,
                asset_id=record.asset_id,
                ticker=history.on(record.asset_id, record.payment_date, record.ticker),
                asset_class=record.asset_class,
                payment_date=record.payment_date,
                income_type=record.income_type,
                quantity=record.quantity,
                unit_price=record.unit_price,
                amount=record.amount,
            )
            for record in found
        ],
        total=total(found),
    )


def _asset(session: Session, asset_id: int) -> Asset:
    asset = session.get(Asset, asset_id)
    if asset is None:
        raise InvalidIncomeError("Ativo não encontrado.")
    return asset


def _event(session: Session, income_id: int) -> IncomeEvent:
    event = session.get(IncomeEvent, income_id)
    if event is None:
        raise IncomeNotFoundError("Provento não encontrado.")
    return event


def _to_dto(session: Session, event: IncomeEvent) -> IncomeEventDTO:
    asset = _asset(session, event.asset_id)
    return IncomeEventDTO(
        id=event.id,
        asset_id=asset.id,
        ticker=ticker_history(session).on(asset.id, event.payment_date, asset.ticker),
        asset_class=asset.asset_class,
        payment_date=event.payment_date,
        income_type=event.income_type,
        quantity=event.quantity,
        unit_price=event.unit_price,
        amount=event.amount,
    )


def create_income(session: Session, payload: IncomeEventInDTO) -> IncomeEventDTO:
    asset = _asset(session, payload.asset_id)
    event = IncomeEvent(
        asset_id=asset.id,
        payment_date=payload.payment_date,
        income_type=payload.income_type,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        amount=payload.amount,
    )
    session.add(event)
    session.commit()
    return _to_dto(session, event)


def update_income(
    session: Session, income_id: int, payload: IncomeEventInDTO
) -> IncomeEventDTO:
    event = _event(session, income_id)
    event.asset_id = _asset(session, payload.asset_id).id
    event.payment_date = payload.payment_date
    event.income_type = payload.income_type
    event.quantity = payload.quantity
    event.unit_price = payload.unit_price
    event.amount = payload.amount
    session.commit()
    return _to_dto(session, event)


def delete_income(session: Session, income_id: int) -> None:
    session.delete(_event(session, income_id))
    session.commit()


def income_performance(
    session: Session,
    today: date,
    *,
    by_year: bool = False,
    start: date | None = None,
    end: date | None = None,
) -> IncomePerformanceDTO:
    """As barras cobrem todo mês, ou ano, do período, inclusive os sem provento. Sem
    período, vão do primeiro provento até hoje."""
    records = income_records(session)
    selected = _in_period(records, start, end)

    bars: list[IncomeBarDTO] = []
    first = start or (records[0].payment_date if records else None)
    if first is not None:
        by_period: defaultdict[str, list[IncomeRecord]] = defaultdict(list)
        for record in selected:
            by_period[period_key(record.payment_date, by_year)].append(record)
        bars = [
            IncomeBarDTO(
                period=key,
                total=total(by_period[key]),
                categories=_categories(by_period[key]),
            )
            for key in periods(first, end or today, by_year)
        ]

    return IncomePerformanceDTO(
        total=total(records),
        last_6_months=total(since(records, today, 6)),
        last_12_months=total(since(records, today, 12)),
        last_24_months=total(since(records, today, 24)),
        period_total=total(selected),
        bars=bars,
        categories=_categories(selected),
    )


def income_distribution(
    session: Session, today: date, months: int
) -> IncomeDistributionDTO:
    """O que cada categoria e cada ativo pagou nos últimos `months` meses, do que
    mais pagou para o que menos pagou, com a posição de hoje ao lado."""
    records = income_records(session)
    window = since(records, today, months)
    window_total = total(window)
    positions = current_positions(operation_records(session))
    prices = {price.asset_id: price.close for price in latest_prices(session)}

    by_asset: defaultdict[int, list[IncomeRecord]] = defaultdict(list)
    for record in records:
        by_asset[record.asset_id].append(record)

    assets: list[IncomeAssetDTO] = []
    for asset_id, found in by_asset.items():
        in_window = since(found, today, months)
        if not in_window:
            continue
        last = last_payment(found)
        if last is None:
            continue
        position = positions.get(last.ticker, Position())
        paid = per_unit(since(found, today, YIELD_MONTHS))
        price = prices.get(asset_id)
        held = position.quantity > ZERO
        amount = total(in_window)
        assets.append(
            IncomeAssetDTO(
                asset_id=asset_id,
                ticker=last.ticker,
                category=_category(last),
                amount=amount,
                share=amount / window_total,
                quantity=position.quantity,
                dividend_yield=ratio(paid, price) if held and price else None,
                yield_on_cost=ratio(paid, position.average_price) if held else None,
                last_amount=last.amount,
                last_payment_date=last.payment_date,
                accumulated=total(found),
            )
        )
    assets.sort(key=lambda item: (-item.amount, item.ticker))

    return IncomeDistributionDTO(
        months=months,
        total=window_total,
        categories=_categories(window),
        assets=assets,
    )
