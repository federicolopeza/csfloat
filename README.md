# CSFloat Market API — Test Harness (Python 3.11+)

Test harness **"listo para correr"** que prueba exhaustivamente la CSFloat Market API pública. Construido como Senior Backend + QA Automation con cliente Python tipado, CLI completa y suite de tests robusta.

## 🎯 Características Principales

- **Cliente HTTP robusto** con reintentos automáticos, backoff exponencial y logging detallado
- **CLI completa** con 4 comandos principales y formateo Rich
- **Modelos Pydantic tipados** con validación completa de datos
- **Suite de tests** con cobertura ≥70% y mocking HTTP
- **Documentación técnica** completa en [`/docs`](docs/)

### Endpoints Soportados
- **`GET /api/v1/listings`** - Listados activos con filtros avanzados y paginación
- **`GET /api/v1/listings/{id}`** - Detalle completo de un listing específico
- **`POST /api/v1/listings`** - Publicar ítem en el marketplace (requiere auth)

## 🚀 Instalación Rápida

### Requisitos
- **Python 3.11+** (requerimiento estricto)
- **Windows PowerShell** (para los ejemplos)

### Setup
```powershell
# 1. Crear y activar entorno virtual
python -m venv .venv
. .venv/Scripts/Activate.ps1

# 2. Instalar en modo desarrollo
pip install -e .

# 3. Instalar con dependencias de testing
pip install -e ".[test]"

# 4. Configurar variables de entorno
copy .env.example .env
# Editar .env con tu CSFLOAT_API_KEY
```

### Variables de Entorno
```ini
# Obligatorio para POST /listings
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx

# Opcional - Base URL (default: https://csfloat.com)
CSFLOAT_BASE=https://csfloat.com

# Opcional - Proxies (respetados por httpx)
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=https://proxy:8080
```

> **API Key**: Obtené tu clave desde tu perfil CSFloat → pestaña "developer"

## 🖥️ Uso de la CLI

La instalación registra el comando global `csf` con 4 comandos principales:

### 1. Búsqueda de Listados (`listings:find`)
```powershell
# Buscar AK-47 Redline con float bajo y precio mínimo
csf listings:find --limit 20 --sort-by lowest_price --max-float 0.07 --market-hash-name "AK-47 | Redline (Field-Tested)"

# Buscar por paint seed específico en colección Bravo II
csf listings:find --paint-seed 555 --collection set_bravo_ii --limit 50

# Buscar StatTrak con precio máximo
csf listings:find --category 2 --max-price 10000 --sort-by lowest_price
```

### 2. Detalle de Listing (`listing:get`)
```powershell
# Obtener información completa de un listing específico
csf listing:get --id 324288155723370196
```

### 3. Publicar Ítem (`listing:list`)
```powershell
# Publicar ítem (requiere CSFLOAT_API_KEY configurada)
csf listing:list --asset-id 21078095468 --type buy_now --price 8900 --private false --desc "Just for show"
```

### 4. Exportar a CSV (`listings:export`)
```powershell
# Exportar resultados de búsqueda con paginación automática
csf listings:export --title "AK-47 | Redline" --min-float 0.00 --max-float 0.07 --out redline_fn.csv
```

> **Ayuda**: Usa `csf --help` o `csf <comando> --help` para ver todas las opciones disponibles

## 🔍 Capacidades de Filtrado

### Paginación y Ordenamiento
- **`cursor`** - Cursor opaco para página siguiente
- **`limit`** - Máximo 50 items por página
- **`sort_by`** - Opciones: `lowest_price`, `highest_price`, `most_recent`, `expires_soon`, `lowest_float`, `highest_float`, `best_deal`, `highest_discount`, `float_rank`, `num_bids`

### Filtros por Ítem
- **`def_index`** - Definition index (puede repetirse)
- **`min_float` / `max_float`** - Rango de float value
- **`paint_seed`** - Paint seed exacto
- **`paint_index`** - Pattern/paint index
- **`rarity`** - Rareza específica
- **`market_hash_name`** - Nombre exacto de mercado
- **`collection`** - ID de colección (ej. `set_bravo_ii`)

### Filtros por Precio y Categoría
- **`min_price` / `max_price`** - Rango de precio en **centavos**
- **`category`** - 0:any | 1:normal | 2:stattrak | 3:souvenir
- **`type`** - `buy_now` | `auction`
- **`user_id`** - SteamID64 del vendedor
- **`stickers`** - Formato: `ID|POSITION?[,ID|POSITION?...]`

> **Nota**: Las queries se construyen de forma determinística (orden alfabético) para reproducibilidad en tests

## 📊 Modelos de Datos

### Estructura Principal (`Listing`)
```python
class Listing(BaseModel):
    # Campos principales
    id: str                      # ID único del listing
    created_at: datetime         # Timestamp de creación
    type: str                    # "buy_now" | "auction"
    price: Optional[int]         # Precio en centavos
    state: Optional[str]         # "listed" | "sold" | "cancelled"
    
    # Relaciones
    seller: Seller               # Información del vendedor
    item: Item                   # Información del ítem
    
    # Metadatos
    watchers: Optional[int]      # Número de watchers
    min_offer_price: Optional[int]
    max_offer_discount: Optional[int]
    is_watchlisted: Optional[bool]
    is_seller: Optional[bool]
```

### Información del Ítem (`Item`)
- **Identificadores**: `asset_id`, `def_index`
- **Características críticas**: `paint_seed`, `float_value`, `inspect_link`
- **Metadatos**: `market_hash_name`, `collection`, `rarity`, `quality`
- **Extras**: `stickers[]`, `badges[]`, `scm` (Steam Community Market data)

### Información del Vendedor (`Seller`)
- **Identificación**: `steam_id`, `username`, `obfuscated_id`
- **Estado**: `online`, `avatar`, `stall_public`
- **Estadísticas**: `statistics` (trades, tiempo promedio, etc.)

> **Importante**: 
> - Todos los precios están en **centavos** (ej. $89.00 = 8900 centavos)
> - `GET /listings/{id}` devuelve el objeto completo incluso si `state ≠ "listed"`
> - Modelos usan Pydantic v2 con `extra="ignore"` para forward compatibility

## 🔧 Desarrollo y Testing

### Ejecutar Tests
```powershell
# Tests completos con cobertura
pytest

# Tests específicos con verbose
pytest -v tests/test_listings_filters.py

# Solo un test específico
pytest tests/test_pagination.py::test_pagination_limit_1_produces_different_cursor
```

### Objetivos de Cobertura
- **≥70%** cobertura global
- **≥80%** en módulos críticos (`http.py`, `endpoints.py`)
- **Branch coverage** habilitado
- **CLI excluida** por ser interfaz de usuario

### Stack Técnico
- **httpx** - Cliente HTTP con async, timeouts y reintentos
- **Pydantic v2** - Modelos tipados con validación
- **Typer** - Framework CLI moderno
- **Rich** - Formateo de consola y tablas
- **pytest + respx** - Testing con HTTP mocking

## 🚨 Troubleshooting

### Errores de Autenticación
- **401/403 Unauthorized/Forbidden**
  - Verificá que `CSFLOAT_API_KEY` esté en `.env`
  - Confirmá que el endpoint requiere autenticación
  - Revisá que la API key sea válida en tu perfil CSFloat

### Errores de Datos
- **404 Not Found**
  - Revisá el `id` del listing (formato de número largo)
  - Confirmá que la ruta del endpoint sea correcta
  - El listing puede haber sido eliminado

### Rate Limiting y Red
- **429 Too Many Requests**
  - El cliente implementa **reintentos automáticos** con backoff exponencial
  - Respeta `Retry-After` header cuando está presente
  - Si persiste, reducí la frecuencia de requests

- **Timeouts / Errores de Red**
  - Timeouts configurados: 10s total, 5s connect
  - Configurá proxies via `HTTP_PROXY` / `HTTPS_PROXY`
  - Verificá conectividad a internet y DNS

## 📚 Documentación Técnica

La documentación completa del proyecto está disponible en [`/docs`](docs/):

- **[01. Producto y Propósito](docs/01-producto-y-proposito.md)** - Funcionalidades y casos de uso
- **[02. Stack Tecnológico](docs/02-stack-tecnologico.md)** - Dependencias y configuración
- **[03. Estructura y Arquitectura](docs/03-estructura-y-arquitectura.md)** - Organización del código
- **[04. Endpoints API](docs/04-endpoints-api.md)** - Especificaciones detalladas de la API
- **[05. Comandos CLI](docs/05-comandos-cli.md)** - Sintaxis completa de comandos
- **[06. Estrategia de Testing](docs/06-estrategia-testing.md)** - Plan de tests y QA
- **[07. Manejo de Errores](docs/07-manejo-errores.md)** - Logging y troubleshooting
- **[08. Modelos Pydantic](docs/08-modelos-pydantic.md)** - Validación de datos

## 🔗 Referencias

- **API Oficial**: https://docs.csfloat.com/#introduction
- **Base URL**: `https://csfloat.com`
- **Endpoints**: `GET /api/v1/listings`, `GET /api/v1/listings/{id}`, `POST /api/v1/listings`

## ⚠️ Notas Importantes

- **Tests aislados**: Durante las pruebas, `CSFLOAT_IGNORE_DOTENV=1` evita cargar `.env` accidentalmente
- **Configuración real**: Solo configurá `.env` para ejecutar ejemplos o la CLI en producción
- **Precios en centavos**: Todos los valores monetarios están expresados en centavos según la documentación oficial
- **Forward compatibility**: Los modelos Pydantic ignoran campos desconocidos para compatibilidad futura
