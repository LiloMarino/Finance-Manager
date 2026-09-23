"""Na fronteira HTTP, Decimal atravessa como string, nos DOIS sentidos.

O DTO de sonda vive no teste: a fronteira é infraestrutura e vale para qualquer DTO.
"""

from __future__ import annotations

from decimal import Decimal

import pytest
from pydantic import ValidationError

from backend.core.dto import BaseDTO, DecimalStr, DecimalStrIn

# 1/7 no contexto padrão: dízima com 28 dígitos significativos, o mesmo tamanho de
# um preço médio calculado.
LONG_REPEATING_DECIMAL = str(Decimal(1) / Decimal(7))


class ProbeDTO(BaseDTO):
    quantity: DecimalStrIn
    unit_price: DecimalStr


def test_float_input_is_rejected() -> None:
    """Número JSON na entrada é erro de validação: Decimal só entra como string."""
    with pytest.raises(ValidationError) as excinfo:
        ProbeDTO.model_validate({"quantity": 0.1, "unit_price": "1"})

    assert "string" in str(excinfo.value)


def test_string_keeps_scale() -> None:
    """`"10.10"` sai como `"10.10"`, com a escala original."""
    dto = ProbeDTO(quantity=Decimal("10.10"), unit_price=Decimal("1"))

    assert dto.model_dump(mode="json")["quantity"] == "10.10"


def test_28_digit_repeating_decimal_survives() -> None:
    """Uma dízima de 28 dígitos atravessa a serialização intacta."""
    dto = ProbeDTO(quantity=Decimal("1"), unit_price=Decimal(LONG_REPEATING_DECIMAL))

    assert dto.model_dump(mode="json")["unit_price"] == LONG_REPEATING_DECIMAL


def test_schema_declares_string_with_decimal_format() -> None:
    """O JSON schema marca `format: "decimal"`, que o codegen do front vira
    DecimalString."""
    properties = ProbeDTO.model_json_schema()["properties"]

    for field in ("quantity", "unit_price"):
        assert properties[field] == {
            "type": "string",
            "format": "decimal",
            "title": field.replace("_", " ").title(),
        }
