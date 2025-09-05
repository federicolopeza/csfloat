from __future__ import annotations

from typing import Any, Iterable, List, Mapping, Optional, Tuple

from .http import request
from .models import Listing, ListingsPage
from .utils import build_query


LISTINGS_PATH = "/api/v1/listings"


def _extract_next_cursor(headers: Mapping[str, str]) -> Optional[str]:
    for key in ("x-next-cursor", "next-cursor", "x_next_cursor"):
        val = headers.get(key)
        if val:
            return val
    # httpx lower-cases headers access; ensure search is case-insensitive
    for k, v in headers.items():
        if k.lower() in {"x-next-cursor", "next-cursor", "x_next_cursor"} and v:
            return v
    return None


def get_listings_page(**filters: Any) -> ListingsPage:
    """Obtiene una página de listados y el cursor para la siguiente.

    Acepta todos los filtros documentados como kwargs.
    """
    # Cap de seguridad para limit
    limit = filters.get("limit")
    if isinstance(limit, int) and limit > 50:
        filters = dict(filters)
        filters["limit"] = 50

    params = build_query(filters)
    res = request("GET", LISTINGS_PATH, params=params)
    data = res.response.json()
    if not isinstance(data, list):
        raise ValueError("Respuesta inesperada: se esperaba una lista de listings")
    items = [Listing.model_validate(obj) for obj in data]

    next_cursor = _extract_next_cursor(res.response.headers)
    return ListingsPage(items=items, next_cursor=next_cursor)


def get_listings(**filters: Any) -> List[Listing]:
    """Lista los listados activos con filtros/orden. Retorna lista tipada."""
    page = get_listings_page(**filters)
    return page.items


def get_listing(listing_id: str) -> Listing:
    """Detalle completo de un listing, incluso si state != listed."""
    path = f"{LISTINGS_PATH}/{listing_id}"
    res = request("GET", path)
    return Listing.model_validate(res.response.json())


def post_listing(
    *,
    asset_id: str,
    type: str = "buy_now",
    price: Optional[int] = None,
    max_offer_discount: Optional[int] = None,
    reserve_price: Optional[int] = None,
    duration_days: Optional[int] = None,
    description: Optional[str] = None,
    private: Optional[bool] = None,
    **kwargs: Any,
) -> Listing:
    """Publica un ítem. Requiere Authorization.

    - `type`: "buy_now" | "auction"
    - Si `type == buy_now`, `price` es obligatorio (centavos).
    - Campos opcionales: `max_offer_discount`, `reserve_price`, `duration_days` (1|3|5|7|14),
      `description` (<=180), `private` (bool).
    """
    if type not in {"buy_now", "auction"}:
        raise ValueError("type debe ser 'buy_now' o 'auction'")
    if type == "buy_now" and price is None:
        raise ValueError("price es obligatorio cuando type='buy_now'")
    if description is not None and len(description) > 180:
        raise ValueError("description debe tener 180 caracteres o menos")
    if duration_days is not None and duration_days not in {1, 3, 5, 7, 14}:
        raise ValueError("duration_days debe ser uno de {1,3,5,7,14}")

    body: dict[str, Any] = {
        "asset_id": int(asset_id) if isinstance(asset_id, str) and asset_id.isdigit() else asset_id,
        "type": type,
    }
    if price is not None:
        body["price"] = price
    if max_offer_discount is not None:
        body["max_offer_discount"] = max_offer_discount
    if reserve_price is not None:
        body["reserve_price"] = reserve_price
    if duration_days is not None:
        body["duration_days"] = duration_days
    if description is not None:
        body["description"] = description
    if private is not None:
        body["private"] = private

    # Pasar kwargs adicionales por si la API agrega campos opcionales futuros
    for k, v in kwargs.items():
        if v is not None and k not in body:
            body[k] = v

    res = request("POST", LISTINGS_PATH, json=body)
    return Listing.model_validate(res.response.json())
