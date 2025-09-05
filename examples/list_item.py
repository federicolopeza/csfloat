from __future__ import annotations

from csfloat_client.endpoints import post_listing


def main() -> None:
    # Requiere CSFLOAT_API_KEY en tu entorno o .env
    listing = post_listing(
        asset_id="21078095468",
        type="buy_now",
        price=8900,
        description="Just for show",
        private=False,
    )
    print("Publicado:", listing.id, listing.type, listing.price)


if __name__ == "__main__":
    main()
