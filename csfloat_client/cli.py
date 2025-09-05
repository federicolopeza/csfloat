from __future__ import annotations

from typing import Any, Iterable, List, Optional

import typer
from rich.console import Console
from rich.table import Table

from . import endpoints as ep
from .utils import build_query, paginate_listings, export_listings_csv

app = typer.Typer(add_completion=False, help="CLI para CSFloat Market API")
console = Console()


SortValues = [
    "lowest_price",
    "highest_price",
    "most_recent",
    "expires_soon",
    "lowest_float",
    "highest_float",
    "best_deal",
    "highest_discount",
    "float_rank",
    "num_bids",
]


# Helpers

def _filters_from_cli(**kwargs: Any) -> dict[str, Any]:
    # Convierte None y colecciones vacías en None y deja el resto tal como viene
    filters: dict[str, Any] = {}
    for k, v in kwargs.items():
        if isinstance(v, (list, tuple)) and len(v) == 0:
            continue
        if v is None:
            continue
        # Mapea nombres de CLI a nombres de API cuando difieren
        # En este caso usamos los mismos nombres salvo algunos alias (desc -> description)
        filters[k] = v
    return filters


def _print_listings_table(listings: List[ep.Listing]) -> None:
    table = Table(show_header=True, header_style="bold blue")
    table.add_column("id", style="cyan")
    table.add_column("price")
    table.add_column("float")
    table.add_column("seed")
    table.add_column("paint")
    table.add_column("defidx")
    table.add_column("name")
    table.add_column("watchers")

    for l in listings:
        table.add_row(
            l.id,
            str(l.price or ""),
            f"{l.item.float_value:.6f}" if l.item.float_value is not None else "",
            str(l.item.paint_seed or ""),
            str(l.item.paint_index or ""),
            str(l.item.def_index),
            l.item.market_hash_name or "",
            str(l.watchers or 0),
        )
    console.print(table)


@app.command(name="listings:find")
def listings_find(
    limit: Optional[int] = typer.Option(None, help="Máx 50"),
    sort_by: Optional[str] = typer.Option(None, help=f"Orden: {', '.join(SortValues)}"),
    cursor: Optional[str] = typer.Option(None, help="Cursor opaco para página siguiente"),
    # Filtros
    category: Optional[int] = typer.Option(None),
    def_index: List[int] = typer.Option([], help="Puede repetirse"),
    min_float: Optional[float] = typer.Option(None),
    max_float: Optional[float] = typer.Option(None),
    rarity: Optional[int] = typer.Option(None),
    paint_seed: Optional[int] = typer.Option(None),
    paint_index: Optional[int] = typer.Option(None),
    user_id: Optional[str] = typer.Option(None),
    collection: Optional[str] = typer.Option(None),
    min_price: Optional[int] = typer.Option(None, help="Centavos"),
    max_price: Optional[int] = typer.Option(None, help="Centavos"),
    market_hash_name: Optional[str] = typer.Option(None),
    type: Optional[str] = typer.Option(None, help="buy_now|auction"),
    stickers: Optional[str] = typer.Option(None, help="ID|POSITION?[,ID|POSITION?...]"),
) -> None:
    filters = _filters_from_cli(
        limit=limit,
        sort_by=sort_by,
        cursor=cursor,
        category=category,
        def_index=def_index,
        min_float=min_float,
        max_float=max_float,
        rarity=rarity,
        paint_seed=paint_seed,
        paint_index=paint_index,
        user_id=user_id,
        collection=collection,
        min_price=min_price,
        max_price=max_price,
        market_hash_name=market_hash_name,
        type=type,
        stickers=stickers,
    )

    page = ep.get_listings_page(**filters)
    _print_listings_table(page.items)
    if page.next_cursor:
        console.print(f"[yellow]next_cursor[/yellow]: {page.next_cursor}")


@app.command(name="listing:get")
def listing_get(id: str = typer.Option(..., "--id", help="Listing ID")) -> None:
    l = ep.get_listing(id)
    table = Table(show_header=True, header_style="bold blue")
    table.add_column("field")
    table.add_column("value")

    table.add_row("id", l.id)
    table.add_row("created_at", l.created_at.isoformat())
    table.add_row("type", l.type)
    table.add_row("price", str(l.price or ""))
    table.add_row("state", l.state or "")
    table.add_row("market_hash_name", l.item.market_hash_name or "")
    table.add_row("float_value", f"{l.item.float_value}" if l.item.float_value is not None else "")
    table.add_row("paint_seed", str(l.item.paint_seed or ""))
    table.add_row("inspect_link", l.item.inspect_link or "")
    table.add_row("seller.steam_id", l.seller.steam_id or "")
    table.add_row("watchers", str(l.watchers or 0))

    console.print(table)


@app.command(name="listing:list")
def listing_list(
    asset_id: str = typer.Option(..., help="Asset ID"),
    type: str = typer.Option("buy_now", help="buy_now|auction"),
    price: Optional[int] = typer.Option(None, help="Centavos"),
    max_offer_discount: Optional[int] = typer.Option(None),
    reserve_price: Optional[int] = typer.Option(None),
    duration_days: Optional[int] = typer.Option(None, help="1|3|5|7|14"),
    desc: Optional[str] = typer.Option(None, help="Descripción (<=180)"),
    private: Optional[bool] = typer.Option(None),
) -> None:
    l = ep.post_listing(
        asset_id=asset_id,
        type=type,
        price=price,
        max_offer_discount=max_offer_discount,
        reserve_price=reserve_price,
        duration_days=duration_days,
        description=desc,
        private=private,
    )
    console.print(f"Publicado listing id={l.id} tipo={l.type} price={l.price}")


@app.command(name="listings:export")
def listings_export(
    out: str = typer.Option(..., "--out", help="Ruta de salida CSV"),
    title: Optional[str] = typer.Option(None, help="Metadata opcional"),
    limit: Optional[int] = typer.Option(None),
    sort_by: Optional[str] = typer.Option(None),
    cursor: Optional[str] = typer.Option(None),
    category: Optional[int] = typer.Option(None),
    def_index: List[int] = typer.Option([]),
    min_float: Optional[float] = typer.Option(None),
    max_float: Optional[float] = typer.Option(None),
    rarity: Optional[int] = typer.Option(None),
    paint_seed: Optional[int] = typer.Option(None),
    paint_index: Optional[int] = typer.Option(None),
    user_id: Optional[str] = typer.Option(None),
    collection: Optional[str] = typer.Option(None),
    min_price: Optional[int] = typer.Option(None),
    max_price: Optional[int] = typer.Option(None),
    market_hash_name: Optional[str] = typer.Option(None),
    type: Optional[str] = typer.Option(None),
    stickers: Optional[str] = typer.Option(None),
    pages: Optional[int] = typer.Option(None, help="Máx páginas a recorrer"),
) -> None:
    filters = _filters_from_cli(
        limit=limit,
        sort_by=sort_by,
        cursor=cursor,
        category=category,
        def_index=def_index,
        min_float=min_float,
        max_float=max_float,
        rarity=rarity,
        paint_seed=paint_seed,
        paint_index=paint_index,
        user_id=user_id,
        collection=collection,
        min_price=min_price,
        max_price=max_price,
        market_hash_name=market_hash_name,
        type=type,
        stickers=stickers,
    )

    listings = list(paginate_listings(initial_filters=filters, max_pages=pages))
    n = export_listings_csv(listings, out)
    console.print(f"Exportadas {n} filas a {out}")
    if title:
        console.print(f"Título: {title}")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
