from __future__ import annotations

import httpx
import pytest
import respx
from httpx import Response

from csfloat_client import endpoints as ep
from csfloat_client.http import CSFloatHTTPError


@respx.mock
def test_429_then_success_retries(make_listing):
    route = respx.get("https://csfloat.com/api/v1/listings").mock(
        side_effect=[
            Response(429, json={"detail": "Too Many Requests"}, headers={"Retry-After": "0"}),
            Response(200, json=[make_listing(id="ok")]),
        ]
    )

    items = ep.get_listings(limit=1)

    assert route.called
    # Debe haber sido llamado al menos 2 veces
    assert route.call_count >= 2
    assert len(items) == 1 and items[0].id == "ok"


@respx.mock
def test_500_eventually_fails_after_retries():
    route = respx.get("https://csfloat.com/api/v1/listings").mock(return_value=Response(500))

    with pytest.raises(CSFloatHTTPError):
        ep.get_listings(limit=1)
    assert route.call_count >= 3


@respx.mock
def test_400_bad_request_no_retry():
    route = respx.get("https://csfloat.com/api/v1/listings").mock(
        return_value=Response(400, json={"error": "bad"})
    )
    with pytest.raises(CSFloatHTTPError):
        ep.get_listings(limit=1)
    assert route.call_count == 1


@respx.mock
def test_network_error_raises():
    route = respx.get("https://csfloat.com/api/v1/listings").mock(
        side_effect=httpx.ConnectError("boom")
    )
    with pytest.raises(CSFloatHTTPError):
        ep.get_listings(limit=1)
    assert route.called
