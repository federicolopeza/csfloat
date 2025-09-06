from __future__ import annotations

import respx
from httpx import Response

from csfloat_client import endpoints as ep


@respx.mock
def test_get_listing_by_id_returns_full_object(make_listing):
    data = make_listing(id="324288155723370196")
    data["state"] = "sold"  # state != listed debe ser aceptado

    route = respx.get("https://csfloat.com/api/v1/listings/324288155723370196").mock(
        return_value=Response(200, json=data)
    )

    l = ep.get_listing("324288155723370196")

    assert route.called
    assert l.id == "324288155723370196"
    assert l.state == "sold"
    assert l.item.market_hash_name is not None
    assert l.item.inspect_link is not None
