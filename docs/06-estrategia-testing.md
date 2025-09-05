# Estrategia de Testing y QA

## 🧪 Framework de Testing

### Stack de Testing
- **Framework principal**: pytest (≥7,<9)
- **Cobertura**: pytest-cov (≥4,<6) 
- **HTTP Mocking**: respx (≥0.20,<0.22)
- **Configuración**: pyproject.toml con addopts específicos

### Configuración en pyproject.toml
```toml
[tool.pytest.ini_options]
addopts = "-q --cov=csfloat_client --cov-report=term-missing --cov-fail-under=70"
testpaths = ["tests"]

[tool.coverage.run]
branch = true
source = ["csfloat_client"]

[tool.coverage.report]
show_missing = true
```

## 🎯 Objetivos de Cobertura

### Metas Específicas
- **Global**: ≥70% de cobertura total
- **Módulos críticos**: ≥80% en `http.py` y `endpoints.py`
- **Branch coverage**: Habilitado para detectar ramas no cubiertas
- **Fail under**: Tests fallan si cobertura < 70%

### Comandos de Cobertura
```powershell
# Ejecutar tests con cobertura
pytest

# Solo reporte de cobertura
pytest --cov=csfloat_client --cov-report=term-missing

# Verificar umbral mínimo
pytest --cov-fail-under=70

# Cobertura específica de módulos críticos
pytest --cov=csfloat_client.http --cov=csfloat_client.endpoints --cov-fail-under=80
```

## 📋 Plan de Tests Específicos

### 1. `tests/conftest.py` - Fixtures Compartidas

#### Fixtures Requeridas
```python
@pytest.fixture
def make_listing():
    """Factory para crear objetos Listing de prueba"""

@pytest.fixture  
def api_client():
    """Cliente HTTP configurado para tests"""

@pytest.fixture
def mock_base_url():
    """Base URL dummy para tests"""

@pytest.fixture
def mock_api_key():
    """API key dummy para tests de autenticación"""
```

### 2. `tests/test_listings_filters.py` - Filtros de Listings

#### Casos de Test Críticos
```python
def test_get_listings_returns_typed_array_with_core_fields():
    """
    ✅ GET /listings retorna array tipado con:
    - item.float_value presente
    - item.paint_seed presente  
    - item.inspect_link presente
    """

def test_get_listings_supports_combined_filters_and_sorted_query():
    """
    ✅ Filtros combinados funcionan:
    - min/max_float + paint_seed + market_hash_name
    - Query construida de forma determinística (orden alfabético)
    - Todos los sort_by documentados
    """

def test_query_parameter_deterministic_ordering():
    """
    ✅ build_query() produce orden alfabético reproducible
    Para reproducibilidad en tests
    """
```

### 3. `tests/test_pagination.py` - Paginación por Cursor

#### Casos de Test Específicos
```python
def test_pagination_limit_1_produces_different_cursor():
    """
    ✅ Paginación funciona correctamente:
    - limit=1 produce cursor válido
    - Página siguiente tiene cursor diferente
    - Items diferentes en páginas consecutivas
    """

def test_paginate_listings_helper_function():
    """
    ✅ Helper paginate_listings() en utils.py:
    - Recorre múltiples páginas automáticamente
    - Respeta max_pages parameter
    - Maneja cursor None (fin de resultados)
    """
```

### 4. `tests/test_listing_by_id.py` - Detalle por ID

#### Casos de Test Críticos
```python
def test_get_listing_returns_complete_object():
    """
    ✅ GET /listings/{id} devuelve estructura completa:
    - Seller con statistics, steam_id, username
    - Item con stickers[], scm, badges[]
    - Metadatos: watchers, min_offer_price, etc.
    """

def test_get_listing_works_even_if_state_not_listed():
    """
    ✅ Funciona incluso si state ≠ "listed":
    - state = "sold", "cancelled", etc.
    - Objeto completo devuelto igual
    """
```

### 5. `tests/test_post_listing_auth.py` - Autenticación POST

#### Casos de Test de Autenticación
```python
def test_post_listing_without_authorization_fails():
    """
    ✅ POST /listings sin Authorization:
    - Retorna 401/403 esperado
    - Mensaje de error claro sobre API key faltante
    """

def test_post_listing_with_api_key_succeeds():
    """
    ✅ POST /listings con API key válida:
    - Header Authorization incluido
    - JSON minificado enviado
    - Campos obligatorios validados (asset_id, type, price si buy_now)
    - Mock response 200 OK
    """

def test_post_listing_validates_required_fields():
    """
    ✅ Validación de campos obligatorios:
    - asset_id siempre requerido
    - price requerido si type="buy_now"
    - duration_days solo valores válidos: 1,3,5,7,14
    - description máximo 180 caracteres
    """
```

### 6. `tests/test_error_handling.py` - Manejo de Errores

#### Casos de Test de Robustez
```python
def test_http_429_triggers_exponential_backoff():
    """
    ✅ Rate limiting (429):
    - Backoff exponencial con jitter
    - Respeta Retry-After header si presente
    - Máximo de reintentos configurado
    - Log de reintentos con latencia
    """

def test_http_5xx_errors_retry_with_backoff():
    """
    ✅ Errores de servidor (500, 502, 503, 504):
    - Reintentos automáticos
    - Backoff exponencial
    - Mensaje de error claro tras agotar reintentos
    """

def test_http_4xx_errors_fail_immediately():
    """
    ✅ Errores de cliente (400, 401, 403, 404):
    - No reintentos (excepto 429)
    - CSFloatHTTPError con contexto claro
    - Incluye response body en error (truncado a 500 chars)
    """

def test_network_timeouts_handled_gracefully():
    """
    ✅ Timeouts de red:
    - httpx.RequestError capturado
    - Mensaje claro sobre timeout/conectividad
    - Reintentos si aplica
    """
```

## 🔍 Mocking Strategy con respx

### Configuración Base
```python
import respx
from httpx import Response

@respx.mock
def test_example():
    # Mock específico para endpoint
    respx.get("https://csfloat.com/api/v1/listings").mock(
        return_value=Response(200, json=[make_listing()])
    )
```

### Patterns de Mocking
```python
# Mock con callback para validar request
def test_query_validation():
    def validate_request(request):
        assert request.url.query == expected_query
        return Response(200, json=[])
    
    respx.get("https://csfloat.com/api/v1/listings").mock(
        side_effect=validate_request
    )

# Mock de errores HTTP
def test_error_handling():
    respx.get("https://csfloat.com/api/v1/listings/123").mock(
        return_value=Response(404, json={"error": "Not found"})
    )
```

## 🚀 Comandos de Testing

### Ejecución Básica
```powershell
# Todos los tests con cobertura
pytest

# Tests específicos con verbose
pytest -v tests/test_listings_filters.py

# Solo un test específico
pytest tests/test_pagination.py::test_pagination_limit_1_produces_different_cursor

# Tests sin cobertura (más rápido para desarrollo)
pytest --no-cov
```

### Debugging y Desarrollo
```powershell
# Parar en primer fallo
pytest -x

# Mostrar prints y logs
pytest -s

# Ejecutar tests que fallaron la última vez
pytest --lf

# Ejecutar tests modificados
pytest --ff
```

## ⚠️ Consideraciones Especiales

### Variables de Entorno para Tests
```python
# En tests, evitar sleep real para velocidad
os.environ["CSFLOAT_TEST_NO_SLEEP"] = "1"

# Base URL de test
os.environ["CSFLOAT_BASE"] = "https://test.csfloat.com"
```

### Datos de Test Realistas
- **IDs de listing**: Usar formato real (números largos)
- **Asset IDs**: Formato Steam válido
- **Float values**: Rangos realistas (0.0-1.0)
- **Paint seeds**: Números enteros positivos
- **Precios**: En centavos, rangos realistas

### Assertions Específicas
```python
# Verificar campos críticos presentes
assert listing.item.float_value is not None
assert listing.item.paint_seed is not None  
assert listing.item.inspect_link is not None

# Verificar tipos correctos
assert isinstance(listing.price, int)  # Centavos
assert isinstance(listing.created_at, datetime)

# Verificar estructura completa
assert hasattr(listing.seller, 'statistics')
assert isinstance(listing.item.stickers, list)
```