# Estructura del Proyecto y Arquitectura

## 📁 Estructura de Directorios

### Raíz del Proyecto
```
csfloat-market-harness/
├── README.md                 # Documentación en español con setup, auth, filtros, ejemplos CLI
├── .env.example             # Template de variables de entorno
├── .env                     # Variables reales (gitignored)
├── pyproject.toml           # Configuración de dependencias + pytest/coverage
├── .gitignore              # Python estándar + específicos del proyecto
└── prompt.xml              # Especificaciones técnicas del proyecto
```

### Package Principal (`csfloat_client/`)
```
csfloat_client/
├── __init__.py             # Exports: Listing, Item, Seller, get_listings, etc.
├── config.py               # Carga .env, valida base_url y api_key
├── http.py                 # Cliente httpx: headers, retries/backoff, timeouts, logging
├── models.py               # Pydantic: Listing, Seller, Item, Sticker, SCM, ListingsPage
├── endpoints.py            # Wrappers tipados: get_listings(), get_listing(id), post_listing()
├── cli.py                  # CLI Typer con comandos listings:find, listing:get, etc.
└── utils.py                # Helpers: build_query, paginate_listings, export_listings_csv
```

### Ejemplos Prácticos (`examples/`)
```
examples/
├── find_low_float.py       # Búsqueda por max_float y orden por precio
├── find_by_seed.py         # Filtro por paint_seed y/o collection  
└── list_item.py            # POST /listings (requiere API key)
```

### Suite de Tests (`tests/`)
```
tests/
├── conftest.py                    # Fixtures: cliente, base_url, api_key dummy
├── test_listings_filters.py       # GET /listings con filtros combinados
├── test_pagination.py             # limit=1 + cursor → página siguiente
├── test_listing_by_id.py          # GET /listings/{id} estructura completa
├── test_post_listing_auth.py      # POST sin/con Authorization
└── test_error_handling.py         # 4xx/5xx/429 con backoff y mensajes
```

## 🏗️ Arquitectura en Capas

### 1. CLI Layer (`cli.py`)
- **Framework**: Typer con Rich para formateo
- **Comandos**: `listings:find`, `listing:get`, `listing:list`, `listings:export`
- **Salida**: Tablas Rich con columnas específicas (id, price, float, seed, paint, etc.)
- **Idioma**: Español en help text y mensajes

### 2. Endpoints Layer (`endpoints.py`)
- **Wrappers tipados** para cada endpoint de la API
- **Funciones principales**:
  - `get_listings(**filters) -> list[Listing]`
  - `get_listing(listing_id: str) -> Listing`  
  - `post_listing(asset_id: str, type: str="buy_now", **kwargs) -> Listing`
  - `get_listings_page(**filters) -> ListingsPage` (con cursor)

### 3. HTTP Layer (`http.py`)
- **Cliente**: httpx con configuración específica
- **Headers automáticos**: User-Agent, Accept, Authorization
- **Reintentos**: 429/5xx con backoff exponencial y jitter
- **Logging**: Rich tables con método, ruta, status, latencia, request-id
- **Timeouts**: 10s total, 5s connect

### 4. Models Layer (`models.py`)
- **Pydantic v2** con `extra="ignore"` para compatibilidad futura
- **Modelos principales**: `Listing`, `Item`, `Seller`, `Sticker`, `SCM`, `SellerStats`
- **Campos específicos**: Todos los documentados en la API oficial

## 🔧 Convenciones de Código

### Construcción de Queries
- **Orden determinístico**: Claves alfabéticas para reproducibilidad en tests
- **Función**: `build_query(filters)` en `utils.py`
- **Soporte completo**: Todos los query params documentados

### Manejo de Errores
- **Excepción custom**: `CSFloatHTTPError` con contexto claro
- **Reintentos automáticos**: Respeta `Retry-After` headers
- **Logging detallado**: Latencia, status codes, request IDs

### Paginación
- **Cursor-based**: Usando `next_cursor` de la respuesta
- **Helper**: `paginate_listings()` para recorrer múltiples páginas
- **Límite**: Máximo 50 items por página (API constraint)

### Validación de Datos
- **Precios**: Siempre en centavos según documentación
- **Campos opcionales**: Manejo correcto de `None` values
- **Type hints**: Completos en todas las funciones

## 📊 Cobertura de Tests

### Objetivos de Cobertura
- **Global**: ≥70% 
- **Módulos core**: ≥80% en `http.py` y `endpoints.py`
- **Configuración**: `pytest-cov` con `--cov-fail-under=70`

### Casos de Test Específicos
- ✅ GET /listings retorna array tipado con `float_value`, `paint_seed`, `inspect_link`
- ✅ Filtros combinados (`min/max_float` + `paint_seed` + `market_hash_name`)
- ✅ Paginación: `limit=1` produce cursor diferente en página siguiente
- ✅ GET /listings/{id} devuelve objeto completo aunque `state ≠ listed`
- ✅ POST /listings: 401/403 sin auth, 200 con API key (mocked)
- ✅ Errores 4xx/5xx/429 con backoff y logs con latencia