from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import override

from sqlalchemy import (
    CheckConstraint,
    Dialect,
    Enum,
    ForeignKey,
    MetaData,
    String,
    TypeDecorator,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedAsDataclass, mapped_column

from backend.core.decimal_ctx import fmt
from backend.core.enum import (
    AssetClass,
    FixedIncomeMovementType,
    FixedIncomeType,
    Indexer,
    IndexSeries,
    OperationType,
)

# Toda constraint nasce com nome. É o nome que o batch do Alembic usa para recriar a
# tabela no SQLite, e é por ele que o teste de migration confere cada CHECK no DDL.
NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(MappedAsDataclass, DeclarativeBase):
    """`MappedAsDataclass` faz o pyright acusar kwarg inexistente no construtor."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class DecimalText(TypeDecorator[Decimal]):
    """Decimal gravado como TEXT: guarda todos os dígitos significativos,
    inclusive os 28 de um preço médio calculado."""

    impl = String
    cache_ok = True

    @override
    def process_bind_param(self, value: Decimal | None, dialect: Dialect) -> str | None:
        return None if value is None else fmt(value)

    @override
    def process_result_value(
        self, value: str | None, dialect: Dialect
    ) -> Decimal | None:
        return None if value is None else Decimal(value)


def _enum_values(enum_class: type[StrEnum]) -> list[str]:
    return [member.value for member in enum_class]


def _enum_column[E: StrEnum](enum_class: type[E], name: str) -> Enum:
    """Enum gravado pelo valor (`"stock"`), com CHECK no banco."""
    return Enum(
        enum_class,
        name=name,
        native_enum=False,
        create_constraint=True,
        validate_strings=True,
        values_callable=_enum_values,
        length=max(len(value) for value in _enum_values(enum_class)),
    )


class Sector(Base):
    __tablename__ = "sectors"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    name: Mapped[str] = mapped_column(String, unique=True)


class Segment(Base):
    """O segmento é a classificação do ativo, e o setor vem por ele."""

    __tablename__ = "segments"
    __table_args__ = (UniqueConstraint("sector_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    sector_id: Mapped[int] = mapped_column(
        ForeignKey("sectors.id", ondelete="RESTRICT"), index=True
    )
    name: Mapped[str]


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    # Código de negociação na B3
    ticker: Mapped[str] = mapped_column(String, unique=True)
    asset_class: Mapped[AssetClass] = mapped_column(
        _enum_column(AssetClass, "asset_class")
    )
    cnpj: Mapped[str | None] = mapped_column(String(18), default=None)
    # Nulo é "sem classificação"
    segment_id: Mapped[int | None] = mapped_column(
        ForeignKey("segments.id", ondelete="RESTRICT"), index=True, default=None
    )


class AssetTickerHistory(Base):
    """Um ticker que o ativo já teve, vigente até `valid_until`, inclusive. A troca de
    ticker é o mesmo ativo com outro nome: o atual fica em `assets`, e nenhum ticker,
    antigo ou atual, é de dois ativos."""

    __tablename__ = "asset_ticker_history"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), index=True
    )
    ticker: Mapped[str] = mapped_column(String, unique=True)
    valid_until: Mapped[date]


class Operation(Base):
    """Dado primário: posição, PM e fiscal são recalculados a partir daqui.

    O significado de `quantity` e `unit_price` depende do tipo:
    - buy/sell: ações negociadas e preço pago/recebido por ação;
    - bonus/split: ações RECEBIDAS no evento, com preço zero;
    - reverse_split: o FATOR do grupamento (10:1 grava 0.1), com preço zero.
    """

    __tablename__ = "operations"
    # O CAST para REAL só decide sinal; o valor exato continua no TEXT
    __table_args__ = (
        CheckConstraint("CAST(quantity AS REAL) > 0", name="quantity_positive"),
        CheckConstraint(
            "(operation_type IN ('buy', 'sell') AND CAST(unit_price AS REAL) > 0)"
            " OR (operation_type IN ('bonus', 'split', 'reverse_split')"
            " AND CAST(unit_price AS REAL) = 0)",
            name="unit_price_by_type",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="RESTRICT"), index=True
    )
    operation_date: Mapped[date] = mapped_column(index=True)
    operation_type: Mapped[OperationType] = mapped_column(
        _enum_column(OperationType, "operation_type")
    )
    quantity: Mapped[Decimal] = mapped_column(DecimalText)
    unit_price: Mapped[Decimal] = mapped_column(DecimalText)


class PriceHistory(Base):
    """Cache de fechamentos diários, refeito a partir dos providers de mercado.

    O fechamento é o que o provider entrega: ajustado por desdobramento e grupamento,
    não por provento.
    """

    __tablename__ = "price_history"
    __table_args__ = (
        CheckConstraint("CAST(close AS REAL) > 0", name="close_positive"),
    )

    # CASCADE porque o cache é descartável: some junto com o ativo
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), primary_key=True
    )
    price_date: Mapped[date] = mapped_column(primary_key=True)
    close: Mapped[Decimal] = mapped_column(DecimalText)


class FixedIncomeInvestment(Base):
    """Um título de renda fixa. O valor dele é marcado a partir das movimentações e
    das séries do indexador.

    O significado de `rate` depende do indexador:
    - cdi: percentual do CDI (110 = 110% do CDI);
    - selic: o spread anual somado à Selic (0.1 = Selic + 0,1% a.a.), que pode ser
      zero ou negativo;
    - ipca: a taxa real anual somada ao IPCA (6 = IPCA + 6% a.a.);
    - prefixed: a taxa anual (12 = 12% a.a.).

    A isenção de IR vem do `product_type`, e o do Tesouro fixa o indexador.
    """

    __tablename__ = "fixed_income_investments"
    __table_args__ = (
        CheckConstraint(
            "indexer = 'selic' OR CAST(rate AS REAL) > 0", name="rate_by_indexer"
        ),
        CheckConstraint(
            "product_type NOT IN ('treasury_selic', 'treasury_prefixed', "
            "'treasury_ipca')"
            " OR (product_type = 'treasury_selic' AND indexer = 'selic')"
            " OR (product_type = 'treasury_prefixed' AND indexer = 'prefixed')"
            " OR (product_type = 'treasury_ipca' AND indexer = 'ipca')",
            name="treasury_indexer",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    label: Mapped[str] = mapped_column(String, unique=True)
    product_type: Mapped[FixedIncomeType] = mapped_column(
        _enum_column(FixedIncomeType, "product_type")
    )
    indexer: Mapped[Indexer] = mapped_column(_enum_column(Indexer, "indexer"))
    rate: Mapped[Decimal] = mapped_column(DecimalText)
    maturity_date: Mapped[date | None]
    daily_liquidity: Mapped[bool]


class FixedIncomeMovement(Base):
    """Dado primário da renda fixa: aplicação e resgate, os dois pelo valor bruto."""

    __tablename__ = "fixed_income_movements"
    __table_args__ = (
        CheckConstraint("CAST(amount AS REAL) > 0", name="amount_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    investment_id: Mapped[int] = mapped_column(
        ForeignKey("fixed_income_investments.id", ondelete="RESTRICT"), index=True
    )
    movement_date: Mapped[date]
    movement_type: Mapped[FixedIncomeMovementType] = mapped_column(
        _enum_column(FixedIncomeMovementType, "movement_type")
    )
    amount: Mapped[Decimal] = mapped_column(DecimalText)


class IndexHistory(Base):
    """Cache das séries de juros, inflação e bolsa: as do BCB vêm do provider de
    séries, e o IBOV, do provider de cotações.

    `value` é a taxa em % como o BCB publica: ao dia para CDI e Selic, ao mês para
    o IPCA, gravado no primeiro dia do mês de referência. No IBOV, é o fechamento
    em pontos.
    """

    __tablename__ = "index_history"

    series: Mapped[IndexSeries] = mapped_column(
        _enum_column(IndexSeries, "series"), primary_key=True
    )
    rate_date: Mapped[date] = mapped_column(primary_key=True)
    value: Mapped[Decimal] = mapped_column(DecimalText)


class FetchLog(Base):
    """A última consulta à fonte externa de um ativo ou de uma série. É o que limita a
    rede a uma consulta por intervalo e separa um problema de dado novo de um que já
    tinha sido avisado.

    `gap` diz se, depois da tentativa, ainda faltava dado além da folga de publicação.
    """

    __tablename__ = "fetch_log"
    __table_args__ = (
        CheckConstraint("(asset_id IS NULL) <> (series IS NULL)", name="one_target"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    attempted_at: Mapped[datetime]
    succeeded_at: Mapped[datetime | None]
    gap: Mapped[bool]
    asset_id: Mapped[int | None] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), unique=True, default=None
    )
    series: Mapped[IndexSeries | None] = mapped_column(
        _enum_column(IndexSeries, "series"), unique=True, default=None
    )


class DarfPayment(Base):
    """O DARF que o usuário pagou, pelo mês de apuração a que ele se refere. O valor
    devido é recalculado das operações; aqui fica o que foi pago de fato."""

    __tablename__ = "darf_payments"
    __table_args__ = (
        UniqueConstraint("year", "month"),
        CheckConstraint("month BETWEEN 1 AND 12", name="month_valid"),
        CheckConstraint("CAST(amount AS REAL) > 0", name="amount_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    year: Mapped[int]
    month: Mapped[int]
    paid_on: Mapped[date]
    amount: Mapped[Decimal] = mapped_column(DecimalText)
