from __future__ import annotations

from csfloat_client.endpoints import get_listings_page


def main() -> None:
    page = get_listings_page(
        limit=50,
        paint_seed=555,
        collection="set_bravo_ii",
    )
    for l in page.items:
        fv = f"{l.item.float_value:.6f}" if l.item.float_value is not None else "-"
        print(l.id, l.item.market_hash_name, l.price, fv, l.item.paint_seed)
    if page.next_cursor:
        print("next_cursor:", page.next_cursor)


if __name__ == "__main__":
    main()
