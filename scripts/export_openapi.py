"""Escreve o schema OpenAPI no stdout, SEM subir servidor.

Quem consome é o `frontend/scripts/generate-types.mjs`, que roda este script e lê
a saída em memória. O stdout carrega só o JSON, em ASCII: acento vai escapado e
atravessa o pipe igual em qualquer codificação de console.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app import create_app


def main() -> int:
    schema = create_app().openapi()
    sys.stdout.write(json.dumps(schema))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
