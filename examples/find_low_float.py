from __future__ import annotations

from csfloat_client.endpoints import get_listings_page


def main() -> None:
    page = get_listings_page(
        limit=20,
        sort_by="lowest_price",
        max_float=0.07,
        market_hash_name="AK-47 | Redline (Field-Tested)",
    )
    for l in page.items:
        fv = f"{l.item.float_value:.6f}" if l.item.float_value is not None else "-"
        print(l.id, l.item.market_hash_name, l.price, fv, l.item.inspect_link)
    if page.next_cursor:
        print("next_cursor:", page.next_cursor)


if __name__ == "__main__":
    main()
