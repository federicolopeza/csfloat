from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SCM(BaseModel):
    price: Optional[int] = None
    volume: Optional[int] = None

    model_config = ConfigDict(extra="ignore")


class Sticker(BaseModel):
    stickerId: int
    slot: int
    wear: Optional[float] = None
    icon_url: Optional[str] = None
    name: Optional[str] = None
    scm: Optional[SCM] = None

    model_config = ConfigDict(extra="ignore")


class SellerStats(BaseModel):
    median_trade_time: Optional[int] = None
    total_failed_trades: Optional[int] = None
    total_trades: Optional[int] = None
    total_verified_trades: Optional[int] = None

    model_config = ConfigDict(extra="ignore")


class Seller(BaseModel):
    avatar: Optional[str] = None
    flags: Optional[int] = None
    online: Optional[bool] = None
    stall_public: Optional[bool] = None
    statistics: Optional[SellerStats] = None
    steam_id: Optional[str] = None
    username: Optional[str] = None
    obfuscated_id: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class Item(BaseModel):
    asset_id: str
    def_index: int
    paint_index: Optional[int] = None
    paint_seed: Optional[int] = None
    float_value: Optional[float] = None
    icon_url: Optional[str] = None
    d_param: Optional[str] = None
    is_stattrak: Optional[bool] = None
    is_souvenir: Optional[bool] = None
    rarity: Optional[int] = None
    quality: Optional[int] = None
    market_hash_name: Optional[str] = None
    stickers: List[Sticker] = Field(default_factory=list)
    tradable: Optional[int] = None
    inspect_link: Optional[str] = None
    has_screenshot: Optional[bool] = None
    scm: Optional[SCM] = None
    item_name: Optional[str] = None
    wear_name: Optional[str] = None
    description: Optional[str] = None
    collection: Optional[str] = None
    badges: List[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class Listing(BaseModel):
    id: str
    created_at: datetime
    type: str
    price: Optional[int] = None
    description: Optional[str] = None
    state: Optional[str] = None
    seller: Seller
    item: Item
    is_seller: Optional[bool] = None
    min_offer_price: Optional[int] = None
    max_offer_discount: Optional[int] = None
    is_watchlisted: Optional[bool] = None
    watchers: Optional[int] = None

    model_config = ConfigDict(extra="ignore")


class ListingsPage(BaseModel):
    items: List[Listing]
    next_cursor: Optional[str] = None
