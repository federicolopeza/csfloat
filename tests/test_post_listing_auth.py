from __future__ import annotations

import pytest
import respx
from httpx import Response
import json

from csfloat_client import endpoints as ep
from csfloat_client.http import CSFloatHTTPError
from csfloat_client.config import get_settings


@respx.mock
def test_post_listing_without_api_key_raises_and_sends_no_auth(monkeypatch: pytest.MonkeyPatch, make_listing):
    # Asegurar que no hay API key
    monkeypatch.delenv("CSFLOAT_API_KEY", raising=False)
    get_settings.cache_clear()  # type: ignore[attr-defined]

    def _callback(request):
        # No debe enviar Authorization
        assert request.headers.get("Authorization") is None
        return Response(401, json={"detail": "Unauthorized"})

    respx.post("https://csfloat.com/api/v1/listings").mock(side_effect=_callback)

    with pytest.raises(CSFloatHTTPError):
        ep.post_listing(asset_id="21078095468", type="buy_now", price=8900)


@respx.mock
def test_post_listing_with_api_key_succeeds_and_sends_auth(monkeypatch: pytest.MonkeyPatch, make_listing):
    monkeypatch.setenv("CSFLOAT_API_KEY", "abc123")
    get_settings.cache_clear()  # type: ignore[attr-defined]

    def _callback(request):
        assert request.headers.get("Authorization") == "abc123"
        # Validar que el body contiene campos esperados
        body = json.loads(request.content)
        assert body["asset_id"] == 21078095468
        assert body["type"] == "buy_now"
        assert body["price"] == 8900
        return Response(200, json=make_listing(id="292312870132253796", asset_id="21078095468", fv=0.26, seed=346, price=8900))

    respx.post("https://csfloat.com/api/v1/listings").mock(side_effect=_callback)

    l = ep.post_listing(asset_id="21078095468", type="buy_now", price=8900, description="Just for show", private=False)

    assert l.id == "292312870132253796"
    assert l.price == 8900
    assert l.item.paint_seed == 346
