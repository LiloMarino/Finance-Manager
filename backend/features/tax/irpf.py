"""Relatório do ano-base com o que vai em cada ficha da declaração.

Os códigos da ficha Bens e Direitos seguem a tabela em vigor desde a declaração
de 2023: ações no grupo 03, BDR no grupo 04 (ativos negociados em bolsa) e FII e
ETF no grupo 07 (fundos).
"""

from __future__ import annotations

from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.decimal_ctx import fmt
from backend.core.enum import AssetClass, LossPool
from backend.core.models.models import Asset
from backend.domain.irpf import is_declared
from backend.domain.position import Position, current_positions
from backend.domain.tax import CENT, DARF_CODE, ZERO
from backend.features.tax.dto import (
    IrpfAssetDTO,
    IrpfExemptMonthDTO,
    IrpfLossDTO,
    IrpfReportDTO,
    IrpfVariableIncomeMonthDTO,
)
from backend.features.tax.service import assessments, payments
from backend.repository.operations import operation_records
from backend.repository.tickers import ticker_history

# (grupo, código, substantivo da discriminação)
ASSET_CODES: dict[AssetClass, tuple[str, str, str]] = {
    AssetClass.STOCK: ("03", "01", "ações"),
    AssetClass.BDR: ("04", "04", "BDRs"),
    AssetClass.FII: ("07", "03", "cotas do FII"),
    AssetClass.ETF: ("07", "09", "cotas do ETF"),
}


def _brazilian(value: Decimal, places: int) -> str:
    """Número no formato pt-BR, com separador de milhar."""
    text = f"{value:,.{places}f}"
    return text.replace(",", "_").replace(".", ",").replace("_", ".")


def _quantity(value: Decimal) -> str:
    integral, _, fraction = fmt(value.normalize()).partition(".")
    grouped = _brazilian(Decimal(integral), 0)
    return f"{grouped},{fraction}" if fraction else grouped


def _cost(position: Position) -> Decimal:
    return position.total_cost.quantize(CENT, ROUND_HALF_UP)


def _description(asset: Asset, ticker: str, position: Position) -> str:
    _, _, noun = ASSET_CODES[asset.asset_class]
    if position.quantity == 0:
        return f"{ticker}: posição encerrada no ano."
    return (
        f"{_quantity(position.quantity)} {noun} {ticker}, custo médio de "
        f"R$ {_brazilian(position.average_price, 2)}."
    )


def _bens_e_direitos(session: Session, year: int) -> list[IrpfAssetDTO]:
    """Cada item com o ticker vigente em 31/12 do ano-base, como foi declarado."""
    operations = operation_records(session)
    history = ticker_history(session)
    previous = current_positions(
        op for op in operations if op.operation_date <= date(year - 1, 12, 31)
    )
    current = current_positions(
        op for op in operations if op.operation_date <= date(year, 12, 31)
    )
    items: list[IrpfAssetDTO] = []
    for asset in session.scalars(select(Asset).order_by(Asset.ticker)):
        before = previous.get(asset.ticker, Position())
        after = current.get(asset.ticker, Position())
        if not is_declared(before, after):
            continue
        group, code, _ = ASSET_CODES[asset.asset_class]
        ticker = history.on(asset.id, date(year, 12, 31), asset.ticker)
        items.append(
            IrpfAssetDTO(
                asset_id=asset.id,
                ticker=ticker,
                asset_class=asset.asset_class,
                group=group,
                code=code,
                cnpj=asset.cnpj,
                description=_description(asset, ticker, after),
                previous_value=_cost(before),
                current_value=_cost(after),
            )
        )
    return sorted(items, key=lambda item: (item.group, item.code, item.ticker))


def irpf_report(session: Session, year: int, today: date) -> IrpfReportDTO:
    months = [item for item in assessments(session, today) if item.year == year]
    paid = payments(session)

    variable_income: list[IrpfVariableIncomeMonthDTO] = []
    for item in months:
        pools = {pool.pool: pool.net for pool in item.pools}
        payment = paid.get((item.year, item.month))
        variable_income.append(
            IrpfVariableIncomeMonthDTO(
                month=item.month,
                common=pools[LossPool.COMMON],
                day_trade=pools[LossPool.DAY_TRADE],
                fii=pools[LossPool.FII],
                tax=item.tax,
                darf_amount=item.darf_amount,
                due_date=item.due_date,
                paid_on=payment.paid_on if payment else None,
                paid_amount=payment.amount if payment else None,
            )
        )

    exempt = [
        IrpfExemptMonthDTO(month=item.month, profit=item.exempt_profit)
        for item in months
        if item.exempt_profit > 0
    ]
    last = months[-1] if months else None
    return IrpfReportDTO(
        year=year,
        darf_code=DARF_CODE,
        assets=_bens_e_direitos(session, year),
        exempt_months=exempt,
        exempt_total=sum((item.profit for item in exempt), ZERO),
        variable_income=variable_income,
        losses=[
            IrpfLossDTO(pool=pool.pool, amount=pool.loss_after)
            for pool in (last.pools if last else [])
        ],
    )
