from __future__ import annotations

import os
from typing import Any, Dict

import pytest

from csfloat_client.config import get_settings


@pytest.fixture(autouse=True)
def _no_sleep_and_reset_env(monkeypatch: pytest.MonkeyPatch):
    # Acelera reintentos en tests
    monkeypatch.setenv("CSFLOAT_TEST_NO_SLEEP", "1")
    # Base por defecto
    monkeypatch.setenv("CSFLOAT_BASE", "https://csfloat.com")
    # Ignorar .env para no filtrar Authorization durante los tests
    monkeypatch.setenv("CSFLOAT_IGNORE_DOTENV", "1")
    # Quitar API key por defecto
    monkeypatch.delenv("CSFLOAT_API_KEY", raising=False)
    # Resetear cache de settings en cada test
    try:
        get_settings.cache_clear()  # type: ignore[attr-defined]
    except Exception:
        pass
    yield
    try:
        get_settings.cache_clear()  # type: ignore[attr-defined]
    except Exception:
        pass

@pytest.fixture
def make_listing() -> Any:
    def _make(*, id: str = "324288155723370196", asset_id: str = "22547095285", fv: float = 0.0279, seed: int = 700, price: int = 260000) -> Dict[str, Any]:
        return {
            "id": id,
            "created_at": "2021-06-13T20:45:21.311794Z",
            "type": "buy_now",
            "price": price,
            "state": "listed",
            "seller": {
                "avatar": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/97/974f0a94f47f50a1a6a769fc8ff093cb93a49066_full.jpg",
                "flags": 435,
                "online": True,
                "stall_public": True,
                "statistics": {
                    "median_trade_time": 236,
                    "total_failed_trades": 0,
                    "total_trades": 24,
                    "total_verified_trades": 24,
                },
                "steam_id": "76561198084749846",
                "username": "Step7750",
            },
            "item": {
                "asset_id": asset_id,
                "def_index": 16,
                "paint_index": 449,
                "paint_seed": seed,
                "float_value": fv,
                "icon_url": "-9a81dlW...",
                "d_param": "17054198177995786400",
                "is_stattrak": False,
                "is_souvenir": False,
                "rarity": 5,
                "quality": 4,
                "market_hash_name": "M4A4 | Poseidon (Factory New)",
                "stickers": [
                    {
                        "stickerId": 1060,
                        "slot": 3,
                        "icon_url": "columbus2016/nv_holo.png",
                        "name": "Sticker | Team EnVyUs (Holo) | MLG Columbus 2016",
                        "scm": {"price": 736, "volume": 1},
                    }
                ],
                "tradable": 0,
                "inspect_link": "steam://rungame/730/...",
                "has_screenshot": True,
                "scm": {"price": 175076, "volume": 0},
                "item_name": "M4A4 | Poseidon",
                "wear_name": "Factory New",
                "description": "It has been custom painted...",
                "collection": "The Gods and Monsters Collection",
                "badges": [],
            },
            "is_seller": False,
            "min_offer_price": 221000,
            "max_offer_discount": 1500,
            "is_watchlisted": False,
            "watchers": 0,
        }
    return _make
