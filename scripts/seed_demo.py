"""Cria `data/demo.db`, o banco de demonstração, com uma carteira fictícia.

O banco sai migrado até o head e com ativos em carteira, ativos vendidos por
inteiro, ativos cadastrados sem compra, títulos com saldo, resgatados e vencidos, e
duas subcarteiras. As datas são relativas a hoje. O app sobe sobre ele com
`pnpm dev:demo`.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy.orm import Session

from backend.core.database.engine import create_engine_for
from backend.core.database.migrate import migrate
from backend.core.enum import (
    AssetClass,
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    OperationType,
    SubportfolioColor,
    SubportfolioIcon,
)
from backend.core.models.models import (
    Asset,
    FixedIncomeInvestment,
    FixedIncomeMovement,
    Operation,
    PriceHistory,
    Subportfolio,
)

DEMO_DB = Path(__file__).resolve().parents[1] / "data" / "demo.db"

# Raízes de ticker em sequência de letras, que não lembram empresa nenhuma
ROOTS = [
    "ABCD", "BCDE", "CDEF", "DEFG", "EFGH", "FGHI", "GHIJ", "HIJK", "IJKL", "JKLM",
    "KLMN", "LMNO", "MNOP", "NOPQ", "OPQR", "PQRS", "QRST", "RSTU", "STUV", "TUVW",
    "UVWX", "VWXY", "WXYZ",
]  # fmt: skip

TODAY = date.today()
BOUGHT = TODAY - timedelta(days=400)
SOLD = TODAY - timedelta(days=100)


def _asset(
    session: Session, ticker: str, asset_class: AssetClass, index: int, *, sold: bool
) -> Asset:
    """100 cotas compradas em `BOUGHT`, vendidas por inteiro em `SOLD` se `sold`.
    O fechamento de hoje fica 10% acima do preço de compra."""
    asset = Asset(ticker=ticker, asset_class=asset_class)
    session.add(asset)
    session.flush()
    price = Decimal(10 + index * 3)
    session.add(
        Operation(
            asset_id=asset.id,
            operation_date=BOUGHT,
            operation_type=OperationType.BUY,
            quantity=Decimal(100),
            unit_price=price,
        )
    )
    if sold:
        session.add(
            Operation(
                asset_id=asset.id,
                operation_date=SOLD,
                operation_type=OperationType.SELL,
                quantity=Decimal(100),
                unit_price=price * Decimal("1.05"),
            )
        )
    session.add(PriceHistory(asset_id=asset.id, price_date=BOUGHT, close=price))
    session.add(
        PriceHistory(asset_id=asset.id, price_date=TODAY, close=price * Decimal("1.1"))
    )
    return asset


def _investment(
    session: Session,
    label: str,
    product_type: FixedIncomeType,
    amount: str,
    *,
    maturity: date | None,
    daily_liquidity: bool = False,
    redeemed: bool = False,
) -> FixedIncomeInvestment:
    """Prefixado a 12% a.a., aplicado em `BOUGHT`. Com `redeemed`, o resgate do
    mesmo valor no mesmo dia zera o saldo."""
    investment = FixedIncomeInvestment(
        label=label,
        product_type=product_type,
        indexer=Indexer.PREFIXED,
        rate=Decimal(12),
        maturity_date=maturity,
        daily_liquidity=daily_liquidity,
    )
    session.add(investment)
    session.flush()
    movements = [FixedIncomeMovementType.APPLICATION]
    if redeemed:
        movements.append(FixedIncomeMovementType.REDEMPTION)
    for movement_type in movements:
        session.add(
            FixedIncomeMovement(
                investment_id=investment.id,
                movement_date=BOUGHT,
                movement_type=movement_type,
                amount=Decimal(amount),
            )
        )
    return investment


def seed(session: Session) -> None:
    # Ativos: em carteira, vendidos por inteiro e cadastrados sem compra
    held_stocks = [
        _asset(session, f"{root}3", AssetClass.STOCK, i, sold=False)
        for i, root in enumerate(ROOTS[0:12])
    ]
    for i, root in enumerate(ROOTS[12:16]):
        _asset(session, f"{root}3", AssetClass.STOCK, i, sold=True)
    held_fiis = [
        _asset(session, f"{root}11", AssetClass.FII, i, sold=False)
        for i, root in enumerate(ROOTS[0:10])
    ]
    sold_fiis = [
        _asset(session, f"{root}11", AssetClass.FII, i, sold=True)
        for i, root in enumerate(ROOTS[10:14])
    ]
    etfs = [
        _asset(session, f"{root}11", AssetClass.ETF, i, sold=False)
        for i, root in enumerate(ROOTS[14:18])
    ]
    for i, root in enumerate(ROOTS[18:21]):
        _asset(session, f"{root}34", AssetClass.BDR, i, sold=False)
    for root in ROOTS[21:23]:
        session.add(Asset(ticker=f"{root}3", asset_class=AssetClass.STOCK))

    # Títulos: com saldo, resgatado por inteiro e vencido
    lci = _investment(
        session,
        "LCI Banco Beta",
        FixedIncomeType.LCI,
        "5000",
        maturity=TODAY + timedelta(days=500),
    )
    _investment(
        session,
        "CDB Banco Alfa",
        FixedIncomeType.CDB,
        "10000",
        maturity=TODAY + timedelta(days=800),
    )
    _investment(
        session,
        "CDB Banco Gama Liquidez",
        FixedIncomeType.CDB,
        "2000",
        maturity=None,
        daily_liquidity=True,
    )
    _investment(
        session,
        "LCA Banco Delta",
        FixedIncomeType.LCA,
        "4000",
        maturity=TODAY + timedelta(days=1100),
    )
    redeemed = _investment(
        session,
        "CDB Banco Épsilon",
        FixedIncomeType.CDB,
        "3000",
        maturity=TODAY + timedelta(days=600),
        redeemed=True,
    )
    _investment(
        session,
        "CDB Banco Zeta",
        FixedIncomeType.CDB,
        "1000",
        maturity=TODAY - timedelta(days=30),
    )

    # Subcarteiras: Dividendos guarda um FII e um título que zeraram
    income = Subportfolio(
        name="Dividendos", icon=SubportfolioIcon.BANKNOTE, color=SubportfolioColor.GREEN
    )
    growth = Subportfolio(name="Crescimento")
    session.add_all([income, growth])
    session.flush()
    for asset in [*held_fiis[0:6], sold_fiis[0]]:
        asset.subportfolio_id = income.id
    lci.subportfolio_id = income.id
    redeemed.subportfolio_id = income.id
    for asset in [*held_stocks[0:4], etfs[0]]:
        asset.subportfolio_id = growth.id
    session.commit()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reset", action="store_true", help="apaga o demo.db existente antes"
    )
    args = parser.parse_args()
    if DEMO_DB.exists():
        if not args.reset:
            print(f"{DEMO_DB} já existe: rode com --reset para recriá-lo.")
            return 1
        DEMO_DB.unlink()
    DEMO_DB.parent.mkdir(exist_ok=True)
    migrate(DEMO_DB)
    engine = create_engine_for(DEMO_DB)
    with Session(engine) as session:
        seed(session)
    engine.dispose()
    print(f"{DEMO_DB} criado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
