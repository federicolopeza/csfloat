# Comandos CLI y Especificaciones

> **💡 Alternativa Web**: Muchas de estas funciones también están disponibles en el [Dashboard Web](../README.md#web-dashboard-features) con una interfaz visual interactiva. Ver [comparación CLI vs Web](#cli-vs-web-dashboard) al final de este documento.

## 🖥️ CLI Framework y Configuración

### Framework Base
- **CLI Framework**: Typer (moderno, basado en Click)
- **Formateo de salida**: Rich (tablas, colores, formateo)
- **Entry point**: `csf` (instalado via `pip install -e .`)
- **Idioma**: Español en help text y mensajes de error

### Configuración en pyproject.toml
```toml
[project.scripts]
csf = "csfloat_client.cli:main"
```

## 📋 Comandos Disponibles

### 1. `csf listings:find` - Búsqueda de Listados

#### Descripción
Busca listados con filtros avanzados y muestra resultados en tabla formateada.

> **🌐 Equivalente Web**: El dashboard web ofrece la misma funcionalidad con filtros interactivos, vista de tarjetas visuales y paginación automática. Ideal para exploración visual de ítems.

#### Sintaxis Completa
```bash
csf listings:find [OPTIONS]
```

#### Opciones de Paginación
| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `--limit` | int | - | Máximo 50 items |
| `--sort-by` | str | - | Ver valores válidos abajo |
| `--cursor` | str | - | Cursor opaco para página siguiente |

#### Valores Válidos para `--sort-by`
- `lowest_price`, `highest_price`, `most_recent`, `expires_soon`
- `lowest_float`, `highest_float`, `best_deal`, `highest_discount`
- `float_rank`, `num_bids`

#### Filtros Disponibles
| Opción | Tipo | Descripción | Ejemplo |
|--------|------|-------------|---------|
| `--category` | int | 0:any, 1:normal, 2:stattrak, 3:souvenir | `--category 1` |
| `--def-index` | int | Puede repetirse múltiples veces | `--def-index 7 --def-index 1` |
| `--min-float` | float | Float mínimo | `--min-float 0.00` |
| `--max-float` | float | Float máximo | `--max-float 0.07` |
| `--rarity` | int | Rareza exacta | `--rarity 6` |
| `--paint-seed` | int | Seed exacto | `--paint-seed 555` |
| `--paint-index` | int | Pattern index | `--paint-index 179` |
| `--user-id` | str | SteamID64 del vendedor | `--user-id 76561198000000000` |
| `--collection` | str | ID de colección | `--collection set_bravo_ii` |
| `--min-price` | int | Precio mínimo en centavos | `--min-price 1000` |
| `--max-price` | int | Precio máximo en centavos | `--max-price 50000` |
| `--market-hash-name` | str | Nombre exacto | `--market-hash-name "AK-47 \| Redline (Field-Tested)"` |
| `--type` | str | buy_now o auction | `--type buy_now` |
| `--stickers` | str | Formato ID\|POS[,ID\|POS...] | `--stickers "1,2\|0"` |

#### Ejemplos de Uso
```bash
# Buscar AK-47 Redline con float bajo
csf listings:find --limit 20 --sort-by lowest_price --max-float 0.07 --market-hash-name "AK-47 | Redline (Field-Tested)"

# Buscar por paint seed en colección específica
csf listings:find --paint-seed 555 --collection set_bravo_ii --limit 50

# Buscar StatTrak con precio máximo
csf listings:find --category 2 --max-price 10000 --sort-by lowest_price
```

#### Formato de Salida (Tabla Rich)
| Columna | Descripción | Formato |
|---------|-------------|---------|
| `id` | ID del listing | Cyan |
| `price` | Precio en centavos | - |
| `float` | Float value | 6 decimales |
| `seed` | Paint seed | - |
| `paint` | Paint index | - |
| `defidx` | Def index | - |
| `name` | Market hash name | - |
| `watchers` | Número de watchers | - |

Adicionalmente, si el servidor retorna un cursor de paginación, el comando imprime:

```
next_cursor: <CURSOR>
```

### 2. `csf listing:get` - Detalle de Listing

#### Descripción
Obtiene y muestra el detalle completo de un listing específico.

> **🌐 Equivalente Web**: En el dashboard web, haz clic en cualquier ítem para ver sus detalles completos con imágenes, historial de precios y enlaces de inspección.

#### Sintaxis
```bash
csf listing:get --id <LISTING_ID>
```

#### Parámetros Requeridos
| Opción | Tipo | Descripción |
|--------|------|-------------|
| `--id` | str | ID único del listing |

#### Ejemplo de Uso
```bash
csf listing:get --id 324288155723370196
```

#### Formato de Salida (Tabla de Campos)
| Campo | Descripción |
|-------|-------------|
| `id` | ID del listing |
| `created_at` | Fecha de creación (ISO format) |
| `type` | Tipo (buy_now/auction) |
| `price` | Precio en centavos |
| `state` | Estado actual |
| `market_hash_name` | Nombre del ítem |
| `float_value` | Valor de float |
| `paint_seed` | Paint seed |
| `inspect_link` | Link de inspección |
| `seller.steam_id` | Steam ID del vendedor |
| `watchers` | Número de watchers |

### 3. `csf listing:list` - Publicar Ítem

#### Descripción
Publica un nuevo ítem en el marketplace. **Requiere CSFLOAT_API_KEY configurada**.

> **🌐 Equivalente Web**: Actualmente solo disponible via CLI. El dashboard web se enfoca en búsqueda y exploración de ítems existentes.

#### Sintaxis
```bash
csf listing:list --asset-id <ASSET_ID> [OPTIONS]
```

#### Parámetros Requeridos
| Opción | Tipo | Descripción |
|--------|------|-------------|
| `--asset-id` | str | Asset ID de Steam |

#### Parámetros Opcionales
| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `--type` | str | `buy_now` | buy_now o auction |
| `--price` | int | - | Precio en centavos (requerido si buy_now) |
| `--max-offer-discount` | int | - | Descuento máximo en ofertas |
| `--reserve-price` | int | - | Precio de reserva |
| `--duration-days` | int | - | Duración: 1, 3, 5, 7, 14 |
| `--desc` | str | - | Descripción (≤180 caracteres) |
| `--private` | bool | - | Listing privado |

#### Ejemplo de Uso
```bash
csf listing:list --asset-id 21078095468 --type buy_now --price 8900 --private false --desc "Just for show"
```

#### Formato de Salida
```
Publicado listing id=<ID> tipo=<TYPE> price=<PRICE>
```

### 4. `csf listings:export` - Exportar a CSV

#### Descripción
Exporta resultados de búsqueda a archivo CSV, con soporte para paginación automática.

> **🌐 Equivalente Web**: El dashboard web permite copiar datos de ítems individuales. Para exportación masiva, usa este comando CLI.

#### Sintaxis
```bash
csf listings:export --out <ARCHIVO.csv> [FILTROS] [OPTIONS]
```

#### Parámetros Requeridos
| Opción | Tipo | Descripción |
|--------|------|-------------|
| `--out` | str | Ruta del archivo CSV de salida |

#### Parámetros Específicos de Export
| Opción | Tipo | Descripción |
|--------|------|-------------|
| `--title` | str | Metadata opcional para el export |
| `--pages` | int | Máximo número de páginas a recorrer |

#### Filtros Soportados
Todos los mismos filtros que `listings:find` (ver arriba).

#### Ejemplo de Uso
```bash
csf listings:export --title "AK-47 | Redline" --min-float 0.00 --max-float 0.07 --out redline_fn.csv
```

#### Formato de Salida
```
Exportadas <N> filas a <archivo>
Título: <título>
```

Nota: `listings:export` usa internamente `paginate_listings()` para recorrer múltiples páginas hasta completar el número solicitado (`--pages`) o agotarse los resultados.

## 🔧 Implementación Técnica

### Función Helper `_filters_from_cli()`
```python
def _filters_from_cli(**kwargs: Any) -> dict[str, Any]:
    """
    Convierte parámetros CLI a filtros de API:
    - Elimina None values
    - Elimina listas/tuplas vacías
    - Mapea nombres CLI a nombres API si difieren
    """
```

### Función de Formateo `_print_listings_table()`
```python
def _print_listings_table(listings: List[ep.Listing]) -> None:
    """
    Crea tabla Rich con columnas específicas:
    id, price, float, seed, paint, defidx, name, watchers
    """
```

### Manejo de Errores CLI
- **401/403**: "Verificá que CSFLOAT_API_KEY esté presente en .env"
- **404**: "Revisá el ID del listing o que la ruta sea correcta"
- **429**: "Rate limit - el cliente implementa reintentos automáticos"
- **Timeouts**: "Podés configurar proxies via HTTP_PROXY/HTTPS_PROXY"

### Configuración de Typer
```python
app = typer.Typer(
    add_completion=False, 
    help="CLI para CSFloat Market API"
)
```

## 🔄 CLI vs Web Dashboard

### Comparación de Funcionalidades

| Funcionalidad | CLI | Web Dashboard | Recomendación |
|---------------|-----|---------------|---------------|
| **Búsqueda de ítems** | ✅ `csf listings:find` | ✅ Filtros interactivos | Web para exploración visual, CLI para automatización |
| **Detalle de ítem** | ✅ `csf listing:get` | ✅ Vista de tarjeta expandida | Web para inspección visual, CLI para datos estructurados |
| **Publicar ítem** | ✅ `csf listing:list` | ❌ No disponible | Solo CLI |
| **Exportar datos** | ✅ `csf listings:export` | ⚠️ Copia individual | CLI para exportación masiva |
| **Filtros avanzados** | ✅ Todos los parámetros | ✅ Interfaz visual | Web más intuitivo, CLI más preciso |
| **Paginación** | ✅ Manual con `--cursor` | ✅ Automática | Web más fluido |
| **Visualización** | 📊 Tabla en terminal | 🎨 Tarjetas con imágenes | Web superior para UX |
| **Automatización** | ✅ Scripts y pipelines | ❌ No scripteable | CLI único para automatización |
| **Velocidad** | ⚡ Muy rápido | 🌐 Depende de conexión | CLI más rápido para consultas simples |

### Cuándo Usar Cada Interfaz

#### Usa CLI cuando:
- **Automatización**: Scripts, cron jobs, pipelines de datos
- **Exportación masiva**: Grandes volúmenes de datos a CSV
- **Publicación de ítems**: Única interfaz disponible
- **Integración**: Con otras herramientas de línea de comandos
- **Velocidad**: Consultas rápidas sin overhead visual
- **Precisión**: Filtros exactos con parámetros específicos

#### Usa Web Dashboard cuando:
- **Exploración visual**: Browsing casual de ítems
- **Comparación de ítems**: Vista lado a lado de múltiples ítems
- **Experiencia de usuario**: Interfaz más amigable e intuitiva
- **Filtros interactivos**: Ajuste dinámico de criterios de búsqueda
- **Inspección detallada**: Imágenes, enlaces, datos visuales
- **Demostración**: Mostrar funcionalidad a otros usuarios

### Configuración Compartida

Ambas interfaces comparten:
- **API Key**: Misma `CSFLOAT_API_KEY` en archivo `.env`
- **Endpoints**: Mismos endpoints de CSFloat Market API
- **Modelos de datos**: Estructuras Pydantic compartidas
- **Manejo de errores**: Lógica de reintentos y rate limiting