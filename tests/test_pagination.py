from __future__ import annotations

import urllib.parse as up

import respx
from httpx import Response

from csfloat_client import endpoints as ep
from csfloat_client.utils import paginate_listings, build_query


@respx.mock
def test_pagination_with_cursor_and_different_items(make_listing):
    calls = {"n": 0}

    def _callback(request):
        calls["n"] += 1
        if calls["n"] == 1:
            # Primera página: limit=1, sin cursor
            assert request.url.params.get("limit") == "1"
            assert request.url.params.get("cursor") is None
            headers = {"X-Next-Cursor": "abc123"}
            return Response(200, json=[make_listing(id="one")], headers=headers)
        else:
            # Segunda página: cursor=abc123
            assert request.url.params.get("cursor") == "abc123"
            return Response(200, json=[make_listing(id="two")])

    respx.get("https://csfloat.com/api/v1/listings").mock(side_effect=_callback)

    items = list(paginate_listings(initial_filters={"limit": 1}, max_pages=2))

    assert len(items) == 2
    assert items[0].id == "one"
    assert items[1].id == "two"


@respx.mock
def test_limit_is_clamped_to_50(make_listing):
    def _callback(request):
        # Debe respetar clamp a 50
        assert request.url.params.get("limit") == "50"
        return Response(200, json=[make_listing()])

    respx.get("https://csfloat.com/api/v1/listings").mock(side_effect=_callback)

    page = ep.get_listings_page(limit=200)
    assert len(page.items) == 1
