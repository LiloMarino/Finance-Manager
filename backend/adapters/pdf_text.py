from __future__ import annotations

from io import BytesIO

import pdfplumber


def extract_pdf_text(content: bytes) -> str:
    """Texto de todas as páginas, na ordem, uma linha do layout por linha."""
    with pdfplumber.open(BytesIO(content)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)
