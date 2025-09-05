from __future__ import annotations

import urllib.parse as up

import pytest
import respx
from httpx import Response

from csfloat_client import endpoints as ep
from csfloat_client.utils import build_query


@respx.mock
def test_get_listings_returns_typed_array_with_core_fields(make_listing):
    route = respx.get("https://csfloat.com/api/v1/listings").mock(
        return_value=Response(200, json=[make_listing()])
    )

    items = ep.get_listings(limit=2, max_float=0.5, sort_by="lowest_price")

    assert route.called
    assert len(items) == 1
    l = items[0]
    assert l.item.float_value is not None
    assert l.item.paint_seed is not None
    assert l.item.inspect_link is not None


@respx.mock
def test_get_listings_supports_combined_filters_and_sorted_query(make_listing):
    filters = dict(
        limit=20,
        sort_by="lowest_price",
        max_float=0.07,
        market_hash_name="AK-47 | Redline (Field-Tested)",
    )
    # httpx usa %20 para espacios; urlencode por defecto usa '+'. Forzar quote_via=quote.
    expected_q = up.urlencode(build_query(filters), doseq=True, quote_via=up.quote)

    def _callback(request):
        # Asegura orden determinístico de query
        assert request.url.query == expected_q
        return Response(200, json=[make_listing()])

    respx.get("https://csfloat.com/api/v1/listings").mock(side_effect=_callback)

    items = ep.get_listings(**filters)
    assert len(items) == 1
    assert items[0].item.market_hash_name is not None
