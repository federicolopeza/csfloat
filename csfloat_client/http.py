from __future__ import annotations

import json as _json
import random
import time
import os
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Mapping, Optional

import httpx
from rich.console import Console
from rich.table import Table

from .config import get_settings

console = Console()


DEFAULT_TIMEOUT = httpx.Timeout(10.0, connect=5.0)
RETRY_STATUSES = {429, 500, 502, 503, 504}


@dataclass
class HTTPResult:
    response: httpx.Response
    latency_ms: float


class CSFloatHTTPError(Exception):
    pass


def _default_headers() -> Dict[str, str]:
    s = get_settings()
    headers = {
        "User-Agent": "csfloat-market-harness/0.1 (+https://csfloat.com)",
        "Accept": "application/json",
    }
    if s.api_key:
        headers["Authorization"] = s.api_key
    return headers


def create_client(timeout: httpx.Timeout | float | None = None) -> httpx.Client:
    s = get_settings()
    return httpx.Client(
        base_url=s.base_url,
        headers=_default_headers(),
        timeout=timeout or DEFAULT_TIMEOUT,
    )


def _sleep_backoff(attempt: int, retry_after: Optional[str]) -> None:
    # Respeta Retry-After (segundos) si está presente
    if os.getenv("CSFLOAT_TEST_NO_SLEEP") == "1":
        return
    if retry_after:
        try:
            delay = float(retry_after)
            time.sleep(delay)
            return
        except ValueError:
            pass
    # Exponential backoff con jitter
    base = min(0.5 * (2 ** attempt), 8.0)  # cap
    delay = base + random.uniform(0, 0.25)
    time.sleep(delay)


def _log_request(method: str, url: httpx.URL, status: Optional[int], latency_ms: Optional[float], request_id: Optional[str], filters_preview: Optional[Mapping[str, Any]] = None) -> None:
    method = method.upper()
    path = url.raw_path.decode()
    status_str = str(status) if status is not None else "-"
    latency_str = f"{latency_ms:.1f}ms" if latency_ms is not None else "-"

    table = Table(show_header=True, header_style="bold blue")
    table.add_column("method", style="cyan")
    table.add_column("path")
    table.add_column("status", style="magenta")
    table.add_column("latency")
    table.add_column("request-id", style="yellow")

    rid = request_id or "-"
    table.add_row(method, path, status_str, latency_str, rid)

    console.print(table)

    if filters_preview:
        # Mostrar un fragmento compacto de filtros
        try:
            snippet = _json.dumps(dict(filters_preview), ensure_ascii=False)[:240]
            console.print(f"filters: {snippet}")
        except Exception:
            pass


def request(
    method: str,
    path: str,
    *,
    params: Optional[Iterable[tuple[str, Any]] | Mapping[str, Any]] = None,
    json: Optional[Mapping[str, Any]] = None,
    max_retries: int = 3,
    timeout: httpx.Timeout | float | None = None,
) -> HTTPResult:
    """Realiza una solicitud HTTP con reintentos/backoff y logging.

    - Reintenta en 429/5xx hasta `max_retries`.
    - Respeta Retry-After si el servidor lo provee.
    - Lanza CSFloatHTTPError con contexto claro en errores definitivos.
    """
    client = create_client(timeout=timeout)
    try:
        last_exc: Optional[Exception] = None
        for attempt in range(max_retries + 1):
            start = time.perf_counter()
            status: Optional[int] = None
            try:
                resp = client.request(method, path, params=params, json=json)
                latency_ms = (time.perf_counter() - start) * 1000.0
                status = resp.status_code

                req_id = resp.headers.get("x-request-id") or resp.headers.get("request-id")
                _log_request(method, resp.request.url, status, latency_ms, req_id, filters_preview=params if method.upper()=="GET" else None)

                if status in RETRY_STATUSES and attempt < max_retries:
                    _sleep_backoff(attempt, resp.headers.get("Retry-After"))
                    continue

                resp.raise_for_status()
                return HTTPResult(response=resp, latency_ms=latency_ms)
            except httpx.HTTPStatusError as e:
                latency_ms = (time.perf_counter() - start) * 1000.0
                status = e.response.status_code if e.response else None
                req_id = None
                try:
                    req_id = e.response.headers.get("x-request-id") if e.response else None
                except Exception:
                    pass
                _log_request(method, e.request.url if e.request else httpx.URL(path), status, latency_ms, req_id)

                # Si es reintetable y nos quedan intentos, backoff
                if status in RETRY_STATUSES and attempt < max_retries:
                    _sleep_backoff(attempt, e.response.headers.get("Retry-After") if e.response else None)
                    continue

                # No reintetable o sin intentos -> error definitivo
                body = None
                try:
                    body = e.response.text[:500] if e.response else None
                except Exception:
                    pass
                raise CSFloatHTTPError(
                    f"HTTP {status} en {method.upper()} {path}: {body}"
                ) from e
            except httpx.RequestError as e:
                latency_ms = (time.perf_counter() - start) * 1000.0
                _log_request(method, httpx.URL(path), None, latency_ms, None)
                last_exc = e
                if attempt < max_retries:
                    _sleep_backoff(attempt, None)
                    continue
                raise CSFloatHTTPError(f"Error de red/timeout en {method.upper()} {path}: {e}") from e
        # Si salimos del loop sin retorno, levantar último error
        if last_exc:
            raise CSFloatHTTPError(f"Fallo tras reintentos: {last_exc}")
        raise CSFloatHTTPError("Fallo desconocido tras reintentos")
    finally:
        client.close()
