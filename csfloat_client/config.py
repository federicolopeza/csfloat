from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Optional
from urllib.parse import urlparse

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    base_url: str
    api_key: Optional[str]


def _validate_base_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError(f"CSFLOAT_BASE debe ser http(s). Valor recibido: {url}")
    if not parsed.netloc:
        raise ValueError(f"CSFLOAT_BASE inválido (sin host): {url}")
    return url.rstrip("/")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Carga variables desde .env y entorno, con defaults seguros."""
    # Cargar .env si existe
    load_dotenv(override=False)

    base = os.getenv("CSFLOAT_BASE", "https://csfloat.com")
    api_key = os.getenv("CSFLOAT_API_KEY")

    base = _validate_base_url(base)

    return Settings(base_url=base, api_key=api_key)
