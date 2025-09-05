from __future__ import annotations

import csv
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, List, Mapping, MutableMapping, Optional, Sequence, Tuple

from .models import Listing, ListingsPage
from . import endpoints as _ep


def build_query(filters: Mapping[str, Any] | None) -> List[Tuple[str, str]]:
    """Construye la query en orden determinístico (alfabético por clave, luego por valor).

    - Omite claves con valor None.
    - Para secuencias, repite la clave por cada valor (p.ej. def_index=1&def_index=2).
    - Convierte valores a str de forma segura.
    """
    if not filters:
        return []
    pairs: List[Tuple[str, str]] = []
    for k, v in filters.items():
        if v is None:
            continue
        if isinstance(v, (list, tuple, set)):
            for vv in v:
                if vv is None:
                    continue
                pairs.append((k, _to_str(vv)))
        else:
            pairs.append((k, _to_str(v)))
    pairs.sort(key=lambda kv: (kv[0], kv[1]))
    return pairs


def _to_str(value: Any) -> str:
    if isinstance(value, float):
        # Evitar notación científica y normalizar
        return format(value, ".10g")
    return str(value)


def paginate_listings(
    *,
    initial_filters: Optional[Mapping[str, Any]] = None,
    max_pages: Optional[int] = None,
) -> Iterator[Listing]:
    """Itera listados usando cursor hasta agotar páginas o alcanzar `max_pages`.

    Nota: requiere que el servidor devuelva un cursor (p.ej. en header `X-Next-Cursor`).
    """
    filters: Dict[str, Any] = dict(initial_filters or {})
    pages = 0
    while True:
        page: ListingsPage = _ep.get_listings_page(**filters)
        for it in page.items:
            yield it
        pages += 1
        if max_pages is not None and pages >= max_pages:
            break
        if not page.next_cursor:
            break
        filters = dict(filters)
        filters["cursor"] = page.next_cursor


def export_listings_csv(listings: Sequence[Listing], out_path: str | Path) -> int:
    """Exporta listados a CSV. Retorna cantidad de filas escritas.

    Columnas principales: id, created_at, type, price, state, market_hash_name, float_value,
    paint_seed, paint_index, def_index, inspect_link, seller_steam_id, watchers, min_offer_price.
    """
    path = Path(out_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    headers = [
        "id",
        "created_at",
        "type",
        "price",
        "state",
        "market_hash_name",
        "float_value",
        "paint_seed",
        "paint_index",
        "def_index",
        "inspect_link",
        "seller_steam_id",
        "watchers",
        "min_offer_price",
    ]

    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        count = 0
        for l in listings:
            row = [
                l.id,
                l.created_at.isoformat(),
                l.type,
                l.price if l.price is not None else "",
                l.state or "",
                l.item.market_hash_name or "",
                l.item.float_value if l.item.float_value is not None else "",
                l.item.paint_seed if l.item.paint_seed is not None else "",
                l.item.paint_index if l.item.paint_index is not None else "",
                l.item.def_index,
                l.item.inspect_link or "",
                l.seller.steam_id or "",
                l.watchers if l.watchers is not None else "",
                l.min_offer_price if l.min_offer_price is not None else "",
            ]
            writer.writerow(row)
            count += 1
        return count
