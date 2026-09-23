"""Pydantic só nas bordas, e Decimal atravessa como string.

`DecimalStr` cobre a saída; `DecimalStrIn` cobre a entrada: o schema de request
declara `string` e o validador recusa número JSON, então o valor chega com todos
os dígitos.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, PlainSerializer, WithJsonSchema
from pydantic.functional_validators import BeforeValidator

from backend.core.decimal_ctx import fmt

_serialize = PlainSerializer(fmt, return_type=str, when_used="json")

# `format: "decimal"` é o gancho que o gerador de tipos do front lê pra emitir
# DecimalString em vez de string — ver frontend/scripts/generate-types.mjs.
_schema = WithJsonSchema({"type": "string", "format": "decimal"})


def _reject_float(value: object) -> object:
    if isinstance(value, float):
        # ValueError é o que o Pydantic converte em erro de validação (422)
        raise ValueError(  # noqa: TRY004
            "Decimal deve vir como string no JSON; float perde precisão."
        )
    return value


DecimalStr = Annotated[Decimal, _serialize, _schema]

DecimalStrIn = Annotated[
    Decimal,
    BeforeValidator(_reject_float),
    _serialize,
    _schema,
]


class BaseDTO(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", from_attributes=True)


class ErrorResponse(BaseDTO):
    """O envelope único de erro: todo 4xx/5xx sai assim, com `detail` sempre string."""

    detail: str


ERROR_RESPONSES: dict[int | str, dict[str, type[ErrorResponse]]] = {
    422: {"model": ErrorResponse},
    500: {"model": ErrorResponse},
}
