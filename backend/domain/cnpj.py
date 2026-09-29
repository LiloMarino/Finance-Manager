"""O CNPJ do ativo, que o IRPF pede em Bens e Direitos."""

from __future__ import annotations

import re

_WEIGHTS = (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)


def _check_digit(digits: str) -> str:
    """O dígito verificador dos dígitos dados, pelo módulo 11 da Receita: os pesos
    são os últimos `len(digits)` de `_WEIGHTS`."""
    weights = _WEIGHTS[-len(digits) :]
    remainder = (
        sum(int(digit) * weight for digit, weight in zip(digits, weights, strict=True))
        % 11
    )
    return "0" if remainder < 2 else str(11 - remainder)


def normalize_cnpj(value: str) -> str:
    """O CNPJ com a pontuação (`XX.XXX.XXX/XXXX-XX`), a partir de qualquer escrita
    com os 14 dígitos. Levanta `ValueError` quando faltam dígitos ou quando os
    verificadores não conferem."""
    digits = re.sub(r"\D", "", value)
    if len(digits) != 14:
        raise ValueError("O CNPJ tem 14 dígitos.")
    first = _check_digit(digits[:12])
    second = _check_digit(digits[:12] + first)
    if digits[12:] != first + second or len(set(digits)) == 1:
        raise ValueError("CNPJ inválido: os dígitos verificadores não conferem.")
    return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}/{digits[8:12]}-{digits[12:]}"
