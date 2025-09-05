# Modelos Pydantic y Validación de Datos

## 🏗️ Arquitectura de Modelos

### Configuración Base para Todos los Modelos
```python
from pydantic import BaseModel, ConfigDict

class BaseCSFloatModel(BaseModel):
    """Configuración base para todos los modelos CSFloat"""
    model_config = ConfigDict(extra="ignore")  # Forward compatibility
```

### Principios de Diseño
- **Forward compatibility**: `extra="ignore"` para campos nuevos de la API
- **Campos opcionales**: Usar `Optional[T]` para campos que pueden ser `None`
- **Defaults apropiados**: `Field(default_factory=list)` para listas vacías
- **Type hints completos**: Todos los campos con tipos explícitos

## 📊 Modelos Principales

### 1. Modelo `Listing` - Estructura Principal
```python
class Listing(BaseModel):
    # Campos obligatorios
    id: str                      # ID único del listing
    created_at: datetime         # Timestamp de creación
    type: str                    # "buy_now" | "auction"
    
    # Campos opcionales principales
    price: Optional[int] = None          # Precio en centavos
    description: Optional[str] = None    # Descripción del seller
    state: Optional[str] = None          # "listed" | "sold" | "cancelled"
    
    # Relaciones (objetos anidados)
    seller: Seller               # Información del vendedor
    item: Item                   # Información del ítem
    
    # Metadatos de ofertas y watchlist
    is_seller: Optional[bool] = None
    min_offer_price: Optional[int] = None
    max_offer_discount: Optional[int] = None
    is_watchlisted: Optional[bool] = None
    watchers: Optional[int] = None
    
    model_config = ConfigDict(extra="ignore")
```

### 2. Modelo `Item` - Información del Ítem
```python
class Item(BaseModel):
    # Identificadores obligatorios
    asset_id: str                # Steam asset ID
    def_index: int              # Definition index del ítem
    
    # Características del skin (críticas para tests)
    paint_index: Optional[int] = None     # Pattern/paint index
    paint_seed: Optional[int] = None      # ⚠️ CRÍTICO: Paint seed
    float_value: Optional[float] = None   # ⚠️ CRÍTICO: Float value
    
    # Metadatos visuales
    icon_url: Optional[str] = None
    d_param: Optional[str] = None
    has_screenshot: Optional[bool] = None
    
    # Clasificación del ítem
    is_stattrak: Optional[bool] = None
    is_souvenir: Optional[bool] = None
    rarity: Optional[int] = None
    quality: Optional[int] = None
    
    # Información de mercado
    market_hash_name: Optional[str] = None
    item_name: Optional[str] = None
    wear_name: Optional[str] = None
    collection: Optional[str] = None
    
    # Enlaces y extras
    inspect_link: Optional[str] = None    # ⚠️ CRÍTICO: Link de inspección
    tradable: Optional[int] = None
    description: Optional[str] = None
    
    # Colecciones anidadas
    stickers: List[Sticker] = Field(default_factory=list)
    badges: List[str] = Field(default_factory=list)
    scm: Optional[SCM] = None
    
    model_config = ConfigDict(extra="ignore")
```

### 3. Modelo `Seller` - Información del Vendedor
```python
class Seller(BaseModel):
    # Identificación
    steam_id: Optional[str] = None
    username: Optional[str] = None
    obfuscated_id: Optional[str] = None  # Para sellers anónimos
    
    # Estado y configuración
    avatar: Optional[str] = None
    flags: Optional[int] = None
    online: Optional[bool] = None
    stall_public: Optional[bool] = None
    
    # Estadísticas de trading
    statistics: Optional[SellerStats] = None
    
    model_config = ConfigDict(extra="ignore")
```

### 4. Modelo `SellerStats` - Estadísticas del Vendedor
```python
class SellerStats(BaseModel):
    median_trade_time: Optional[int] = None
    total_failed_trades: Optional[int] = None
    total_trades: Optional[int] = None
    total_verified_trades: Optional[int] = None
    
    model_config = ConfigDict(extra="ignore")
```

### 5. Modelo `Sticker` - Stickers en Ítems
```python
class Sticker(BaseModel):
    # Identificación obligatoria
    stickerId: int               # ID único del sticker
    slot: int                   # Posición en el ítem (0-4)
    
    # Información opcional
    wear: Optional[float] = None         # Desgaste del sticker
    icon_url: Optional[str] = None       # URL del ícono
    name: Optional[str] = None           # Nombre del sticker
    
    # Información de mercado
    scm: Optional[SCM] = None           # Steam Community Market data
    
    model_config = ConfigDict(extra="ignore")
```

### 6. Modelo `SCM` - Steam Community Market
```python
class SCM(BaseModel):
    price: Optional[int] = None     # Precio en Steam Market (centavos)
    volume: Optional[int] = None    # Volumen de ventas
    
    model_config = ConfigDict(extra="ignore")
```

### 7. Modelo `ListingsPage` - Paginación
```python
class ListingsPage(BaseModel):
    items: List[Listing]                    # Lista de listings
    next_cursor: Optional[str] = None       # Cursor para página siguiente
    
    model_config = ConfigDict(extra="ignore")
```

## 🔍 Validaciones Específicas

### Campos Críticos para Tests
```python
# Estos campos DEBEN estar presentes en tests
CRITICAL_FIELDS = [
    "item.float_value",    # Para filtros de float
    "item.paint_seed",     # Para filtros de seed
    "item.inspect_link",   # Para verificar completitud
]
```

### Validaciones de Tipos
```python
# Precios siempre en centavos (int)
assert isinstance(listing.price, int)
assert listing.price >= 0

# Timestamps como datetime
assert isinstance(listing.created_at, datetime)

# Float values en rango válido
if listing.item.float_value is not None:
    assert 0.0 <= listing.item.float_value <= 1.0

# Paint seeds como enteros positivos
if listing.item.paint_seed is not None:
    assert isinstance(listing.item.paint_seed, int)
    assert listing.item.paint_seed >= 0
```

## 🧪 Factory para Tests

### Fixture `make_listing` en conftest.py
```python
@pytest.fixture
def make_listing():
    """Factory para crear objetos Listing realistas para tests"""
    def _make_listing(
        listing_id: str = "324288155723370196",
        price: int = 8900,  # $89.00 en centavos
        float_value: float = 0.15234567,
        paint_seed: int = 555,
        market_hash_name: str = "AK-47 | Redline (Field-Tested)",
        **overrides
    ) -> dict:
        base_data = {
            "id": listing_id,
            "created_at": "2024-01-15T10:30:00Z",
            "type": "buy_now",
            "price": price,
            "state": "listed",
            "seller": {
                "steam_id": "76561198000000000",
                "username": "TestUser",
                "avatar": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/00/000.jpg",
                "online": True,
                "stall_public": True,
                "statistics": {
                    "total_trades": 150,
                    "total_verified_trades": 145,
                    "median_trade_time": 3600
                }
            },
            "item": {
                "asset_id": "21078095468",
                "def_index": 7,
                "paint_index": 179,
                "paint_seed": paint_seed,
                "float_value": float_value,
                "market_hash_name": market_hash_name,
                "inspect_link": f"steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S{listing_id}A{21078095468}D0000000000000000",
                "collection": "set_bravo_ii",
                "rarity": 4,
                "quality": 4,
                "stickers": [],
                "badges": []
            },
            "watchers": 5,
            "is_watchlisted": False
        }
        
        # Aplicar overrides
        base_data.update(overrides)
        return base_data
    
    return _make_listing
```

## 📝 Patrones de Uso

### Parsing de Respuestas API
```python
# Single listing
def get_listing(listing_id: str) -> Listing:
    response = http.request("GET", f"/api/v1/listings/{listing_id}")
    return Listing.model_validate(response.response.json())

# Lista de listings
def get_listings(**filters) -> list[Listing]:
    response = http.request("GET", "/api/v1/listings", params=filters)
    data = response.response.json()
    return [Listing.model_validate(item) for item in data]

# Página con cursor
def get_listings_page(**filters) -> ListingsPage:
    response = http.request("GET", "/api/v1/listings", params=filters)
    data = response.response.json()
    return ListingsPage(
        items=[Listing.model_validate(item) for item in data],
        next_cursor=response.response.headers.get("x-next-cursor")
    )
```

### Serialización para POST
```python
def post_listing(asset_id: str, **kwargs) -> Listing:
    # Construir payload
    payload = {
        "asset_id": asset_id,
        "type": kwargs.get("type", "buy_now"),
        **kwargs
    }
    
    # Enviar JSON minificado
    response = http.request("POST", "/api/v1/listings", json=payload)
    return Listing.model_validate(response.response.json())
```

## ⚠️ Consideraciones Especiales

### Manejo de Campos Faltantes
- **API evoluciona**: Nuevos campos pueden aparecer → `extra="ignore"`
- **Campos opcionales**: Siempre verificar `is not None` antes de usar
- **Listas vacías**: Usar `Field(default_factory=list)` en lugar de `[]`

### Compatibilidad con Versiones
```python
# Verificar presencia de campos críticos
if listing.item.float_value is None:
    logger.warning(f"Listing {listing.id} missing float_value")

# Fallbacks para campos opcionales
display_name = listing.item.market_hash_name or listing.item.item_name or "Unknown Item"
```

### Performance en Parsing
- **Validación lazy**: Pydantic v2 es más eficiente
- **Reutilizar modelos**: No recrear para cada response
- **Batch processing**: Procesar listas de una vez cuando sea posible