# Endpoints y Especificaciones de la API

## 🌐 Base URL y Autenticación

### Configuración Base
- **Base URL**: `https://csfloat.com`
- **Documentación oficial**: https://docs.csfloat.com/#introduction
- **Autenticación**: API key en header `Authorization: <API-KEY>`
- **Generación de API Key**: Perfil CSFloat → pestaña "developer"

## 📋 Endpoints Soportados

### 1. `GET /api/v1/listings` - Listados Activos

#### Descripción
Obtiene listados activos con filtros y ordenamiento. Soporta cursor-based pagination con límite máximo de 50 items.

#### Parámetros de Paginación
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `cursor` | string | - | Cursor opaco para página siguiente |
| `limit` | int | 50 | Máximo 50 items por página |
| `sort_by` | string | - | Ver opciones de ordenamiento abajo |

#### Opciones de Ordenamiento (`sort_by`)
- `lowest_price` - Precio más bajo primero
- `highest_price` - Precio más alto primero  
- `most_recent` - Más recientes primero
- `expires_soon` - Próximos a expirar primero
- `lowest_float` - Float más bajo primero
- `highest_float` - Float más alto primero
- `best_deal` - Mejores ofertas primero
- `highest_discount` - Mayor descuento primero
- `float_rank` - Ranking por float
- `num_bids` - Número de ofertas

#### Filtros Disponibles
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `category` | int | 0:any, 1:normal, 2:stattrak, 3:souvenir | `1` |
| `def_index` | int[] | Uno o varios def_index | `[7, 1]` |
| `min_float` | float | Float mínimo | `0.00` |
| `max_float` | float | Float máximo | `0.07` |
| `rarity` | int | Rareza exacta | `6` |
| `paint_seed` | int | Seed exacto | `555` |
| `paint_index` | int | Pattern/paint index | `179` |
| `user_id` | string | SteamID64 del vendedor | `76561198000000000` |
| `collection` | string | ID de colección | `set_bravo_ii` |
| `min_price` | int | Precio mínimo en centavos | `1000` |
| `max_price` | int | Precio máximo en centavos | `50000` |
| `market_hash_name` | string | Nombre exacto de mercado | `"AK-47 \| Redline (Field-Tested)"` |
| `type` | string | Tipo de listing | `buy_now` o `auction` |
| `stickers` | string | Formato: ID\|POSITION?[,ID\|POSITION?...] | `"1,2\|0,3\|1"` |

#### Ejemplo de Wrapper
```python
def get_listings(**filters) -> list[Listing]:
    """
    Construir query de forma determinística (orden alfabético) 
    para reproducibilidad en tests.
    """
```

### 2. `GET /api/v1/listings/{id}` - Detalle de Listing

#### Descripción
Obtiene el detalle completo de un listing específico. Devuelve el objeto completo incluso si `state ≠ listed`.

#### Parámetros
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | string | ✅ | ID único del listing |

#### Ejemplo de Wrapper
```python
def get_listing(listing_id: str) -> Listing:
    """
    Debe obtener el objeto completo incluso si state ≠ listed.
    """
```

### 3. `POST /api/v1/listings` - Publicar Ítem

#### Descripción
Publica un nuevo ítem en el marketplace. **Requiere Authorization header**.

#### Parámetros del Body (JSON)
| Parámetro | Tipo | Requerido | Descripción | Valores |
|-----------|------|-----------|-------------|---------|
| `asset_id` | string | ✅ | ID del asset de Steam | - |
| `type` | string | ✅ | Tipo de listing | `buy_now` o `auction` |
| `price` | int | ⚠️ | Precio en centavos (requerido si buy_now) | - |
| `max_offer_discount` | int | - | Descuento máximo en ofertas | - |
| `reserve_price` | int | - | Precio de reserva para subastas | - |
| `duration_days` | int | - | Duración en días | `1`, `3`, `5`, `7`, `14` |
| `description` | string | - | Descripción (máximo 180 caracteres) | - |
| `private` | bool | - | Listing privado | `true`/`false` |

#### Ejemplo de Wrapper
```python
def post_listing(
    asset_id: str, 
    type: str = "buy_now", 
    price: int = None, 
    **kwargs
) -> Listing:
    """
    Enviar JSON minificado; incluir Authorization.
    Validar campos obligatorios según type.
    """
```

## 🔍 Estructura de Respuesta

### Modelo Listing Completo
```python
class Listing(BaseModel):
    # Campos principales
    id: str
    created_at: datetime
    type: str                    # "buy_now" | "auction"
    price: Optional[int]         # En centavos
    state: Optional[str]         # "listed" | otros estados
    
    # Relaciones
    seller: Seller
    item: Item
    
    # Metadatos
    min_offer_price: Optional[int]
    max_offer_discount: Optional[int]
    is_watchlisted: Optional[bool]
    watchers: Optional[int]
    is_seller: Optional[bool]
```

### Campos Críticos del Item
```python
class Item(BaseModel):
    # Identificadores
    asset_id: str
    def_index: int
    
    # Características del skin
    paint_index: Optional[int]
    paint_seed: Optional[int]     # ⚠️ Crítico para tests
    float_value: Optional[float]  # ⚠️ Crítico para tests
    
    # Metadatos
    market_hash_name: Optional[str]
    inspect_link: Optional[str]   # ⚠️ Crítico para tests
    collection: Optional[str]
    
    # Stickers y extras
    stickers: List[Sticker] = Field(default_factory=list)
    scm: Optional[SCM]
```

## ⚠️ Notas Importantes

### Precios en Centavos
- **Todos los precios** (`price`, `min_price`, `max_price`) están expresados en **centavos**
- Ejemplo: `$89.00 USD = 8900 centavos`

### Manejo de Estados
- `GET /listings/{id}` devuelve el objeto **incluso si `state ≠ "listed"`**
- Estados posibles: `"listed"`, `"sold"`, `"cancelled"`, etc.

### Autenticación Requerida
- `POST /listings` **siempre requiere** header `Authorization`
- `GET` endpoints pueden funcionar sin auth, pero algunos pueden requerir auth para datos completos