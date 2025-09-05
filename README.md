# CSFloat Market API — Test Harness (Python 3.11+)

Harness "listo para correr" que prueba y expone vía CLI los endpoints públicos de CSFloat Market para: listar publicaciones, obtener detalle por ID y publicar un ítem.

- Base URL: `https://csfloat.com`
- Doc oficial: https://docs.csfloat.com/#introduction
- Autenticación: API key en header `Authorization: <API-KEY>` (desde tu perfil, pestaña "developer").

## Requisitos
- Python 3.11+
- Windows PowerShell (los ejemplos usan `pwsh`)

## Instalación
1) Crear y activar un entorno virtual

```powershell
python -m venv .venv
. .venv/Scripts/Activate.ps1
```

2) Instalar dependencias

```powershell
pip install -e .
```

3) Configurar variables de entorno

- Copiá `.env.example` a `.env` y completá tu `CSFLOAT_API_KEY` si vas a usar `POST /listings`.
- `CSFLOAT_BASE` permite sobreescribir la base (por defecto `https://csfloat.com`).

```ini
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx
CSFLOAT_BASE=https://csfloat.com
```

> Proxies opcionales (respetados por httpx a través del entorno): `HTTP_PROXY`, `HTTPS_PROXY`.

## Uso de la CLI
La herramienta instala el comando `csf`.

Ejemplos:

```powershell
# Buscar por float y precio
csf listings:find --limit 20 --sort-by lowest_price --max-float 0.07 --market-hash-name "AK-47 | Redline (Field-Tested)"

# Buscar por seed y colección
csf listings:find --paint-seed 555 --collection set_bravo_ii --limit 50

# Detalle por ID
csf listing:get --id 324288155723370196

# Publicar un ítem (requiere API key)
csf listing:list --asset-id 21078095468 --type buy_now --price 8900 --private false --desc "Just for show"

# Exportar CSV
csf listings:export --title "AK-47 | Redline" --min-float 0.00 --max-float 0.07 --out redline_fn.csv
```

## Filtros soportados (`GET /api/v1/listings`)
- Paginación y orden: `cursor`, `limit (≤50)`, `sort_by` en {`lowest_price`, `highest_price`, `most_recent`, `expires_soon`, `lowest_float`, `highest_float`, `best_deal`, `highest_discount`, `float_rank`, `num_bids`}.
- Filtros: `category` (0:any | 1:normal | 2:stattrak | 3:souvenir), `def_index` (uno o varios), `min_float`, `max_float`, `rarity`, `paint_seed`, `paint_index`, `user_id`, `collection` (ej. `set_bravo_ii`), `min_price`, `max_price`, `market_hash_name` (exacto), `type` (`buy_now` | `auction`), `stickers` (formato `ID|POSITION?[,ID|POSITION?...]`).

La construcción de la query es determinística (orden alfabético de claves) para reproducibilidad en pruebas.

## Modelos de respuesta
De acuerdo a la documentación pública, los objetos Listing incluyen (entre otros):
- `id`, `created_at`, `type`, `price` (centavos), `state`.
- `seller`: `avatar`, `flags`, `online`, `stall_public`, `statistics`, `steam_id`, `username` (u `obfuscated_id` en algunos casos).
- `item`: `asset_id`, `def_index`, `paint_index`, `paint_seed`, `float_value`, `rarity`, `quality`, `market_hash_name`, `tradable`, `item_name`, `wear_name`, `collection`, `badges`, `has_screenshot`, `inspect_link`.
- `item.stickers[]`: `stickerId`, `slot`, `wear?`, `icon_url`, `name`, `scm { price, volume }`.
- Otros: `min_offer_price`, `max_offer_discount`, `is_watchlisted`, `watchers`, `is_seller`.

> Precios en centavos según doc. El endpoint `GET /api/v1/listings/{id}` devuelve el objeto completo incluso si `state ≠ listed`.

## Troubleshooting
- 401/403 Unauthorized/Forbidden
  - Verificá que `CSFLOAT_API_KEY` esté presente en `.env` o en tu entorno y que el endpoint lo requiera.
- 404 Not Found
  - Revisá el `id` del listing o que la ruta sea correcta.
- 429 Too Many Requests
  - El cliente implementa reintentos con backoff exponencial y respeta `Retry-After` cuando está presente.
- Timeouts / Red
  - Se aplican timeouts razonables. Podés configurar proxies via `HTTP_PROXY` / `HTTPS_PROXY`.

## Desarrollo y pruebas
- Ejecutar tests y cobertura:

```powershell
pytest
```

- Cobertura objetivo: ≥80% en `csfloat_client/http.py` y `csfloat_client/endpoints.py`; ≥70% global.

## Referencias
- Introducción y autenticación: https://docs.csfloat.com/#introduction
- Listings: `GET /api/v1/listings`, `GET /api/v1/listings/{id}`, `POST /api/v1/listings`.
