from __future__ import annotations

from datetime import date
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
)
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedAsDataclass, mapped_column

from backend.core.decimal_ctx import fmt
from backend.core.enum import AssetClass, OperationType

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


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    # Código de negociação na B3; em renda fixa, o rótulo da aplicação
    ticker: Mapped[str] = mapped_column(String, unique=True)
    asset_class: Mapped[AssetClass] = mapped_column(
        _enum_column(AssetClass, "asset_class")
    )
    cnpj: Mapped[str | None] = mapped_column(String(18), default=None)
    sector: Mapped[str | None] = mapped_column(String, default=None)


class Operation(Base):
    """Dado primário: posição, PM e fiscal são recalculados a partir daqui.

    O significado de `quantity` e `unit_price` depende do tipo:
    - buy/sell: ações negociadas e preço pago/recebido por ação;
    - bonus/split: ações RECEBIDAS no evento, com preço zero;
    - reverse_split: o FATOR do grupamento (10:1 grava 0.1), com preço zero;
    - transfer_out/transfer_in: um par no mesmo dia, um em cada ativo (troca de
      ticker), com o preço médio da origem em `unit_price`.
    """

    __tablename__ = "operations"
    # O CAST para REAL só decide sinal; o valor exato continua no TEXT
    __table_args__ = (
        CheckConstraint("CAST(quantity AS REAL) > 0", name="quantity_positive"),
        CheckConstraint(
            "(operation_type IN ('buy', 'sell') AND CAST(unit_price AS REAL) > 0)"
            " OR (operation_type IN ('bonus', 'split', 'reverse_split')"
            " AND CAST(unit_price AS REAL) = 0)"
            " OR (operation_type IN ('transfer_in', 'transfer_out')"
            " AND CAST(unit_price AS REAL) >= 0)",
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
