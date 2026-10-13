from __future__ import annotations

from io import BytesIO

import pdfplumber


def extract_pdf_pages(content: bytes) -> list[str]:
    """O texto de cada página, na ordem, uma linha do layout por linha."""
    with pdfplumber.open(BytesIO(content)) as pdf:
        return [page.extract_text() or "" for page in pdf.pages]
