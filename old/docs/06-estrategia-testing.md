# Estrategia de Testing y QA

## 🏗️ Arquitectura de Testing Dual

Este proyecto implementa una estrategia de testing integral que cubre tanto el cliente CLI de Python como el dashboard web de React. Cada componente tiene sus propias herramientas y patrones de testing, pero comparten objetivos comunes de calidad y cobertura.

### Componentes de Testing
- **CLI Python**: pytest + respx para mocking HTTP
- **Web Dashboard**: Vitest + React Testing Library para componentes
- **Proxy Server**: Vitest para testing de Hono server
- **E2E (Futuro)**: Playwright para testing end-to-end

## 🧪 Framework de Testing - CLI Python

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

## 🌐 Framework de Testing - Web Dashboard

### Stack de Testing Frontend
- **Framework principal**: Vitest (≥1.0.0)
- **Testing Library**: @testing-library/react (≥13.0.0)
- **DOM Testing**: @testing-library/jest-dom
- **User Interactions**: @testing-library/user-event (≥14.0.0)
- **Mocking**: vi.mock() de Vitest para módulos y APIs

### Configuración en vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})
```

### Setup de Testing (src/test/setup.ts)
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de fetch global para tests
global.fetch = vi.fn()

// Mock de variables de entorno
vi.mock('../config/env', () => ({
  API_BASE_URL: 'http://localhost:8787',
  API_KEY: 'test-api-key'
}))
```

## 🎯 Objetivos de Cobertura - Web Dashboard

### Metas Específicas Frontend
- **Global**: ≥70% de cobertura total
- **Componentes críticos**: ≥80% en FiltersPanel, ListingCard, Toolbar
- **Hooks personalizados**: ≥90% en useListings, useFilters
- **Utilidades**: ≥85% en formatters, validators
- **Branch coverage**: Habilitado para detectar ramas no cubiertas

### Comandos de Testing Web
```bash
# Ejecutar tests (Vitest)
pnpm test

# Ejecutar con cobertura
pnpm test -- --coverage

# Modo watch para desarrollo
pnpm test -- --watch

# Ejecutar tests específicos por patrón
pnpm test -- FiltersPanel

# UI de Vitest (si está disponible)
pnpm test -- --ui
```

## 📋 Plan de Tests Específicos - Web Dashboard

### 1. Componentes de UI (`src/components/__tests__/`)

#### FiltersPanel.test.tsx
```typescript
describe('FiltersPanel', () => {
  test('renders all filter inputs correctly', () => {
    // ✅ Renderiza inputs de min/max float, paint seed, market hash name
    // ✅ Valores por defecto correctos
    // ✅ Labels y placeholders apropiados
  })

  test('updates filters when user interacts', async () => {
    // ✅ onChange callbacks funcionan correctamente
    // ✅ Validación de rangos (float 0.0-1.0)
    // ✅ Debounce en text inputs
  })

  test('resets filters when reset button clicked', async () => {
    // ✅ Botón reset limpia todos los filtros
    // ✅ Callback onReset se ejecuta
  })
})
```

#### ListingCard.test.tsx
```typescript
describe('ListingCard', () => {
  test('displays listing information correctly', () => {
    // ✅ Muestra float value, paint seed, precio
    // ✅ Imagen del item con fallback
    // ✅ Información del seller
    // ✅ Badges y stickers si existen
  })

  test('handles missing optional data gracefully', () => {
    // ✅ Maneja stickers vacíos
    // ✅ Seller statistics faltantes
    // ✅ Imagen no disponible
  })

  test('formats prices and floats correctly', () => {
    // ✅ Precios en formato correcto (centavos a dólares)
    // ✅ Float values con precisión apropiada
    // ✅ Números grandes con separadores
  })
})
```

#### Toolbar.test.tsx
```typescript
describe('Toolbar', () => {
  test('sort options work correctly', async () => {
    // ✅ Dropdown de sort muestra opciones correctas
    // ✅ Callback onSortChange se ejecuta
    // ✅ Valor seleccionado se refleja en UI
  })

  test('view toggle switches between grid and list', async () => {
    // ✅ Botones de vista funcionan
    // ✅ Estado visual correcto
    // ✅ Callback onViewChange se ejecuta
  })
})
```

### 2. Hooks Personalizados (`src/hooks/__tests__/`)

#### useListings.test.ts
```typescript
describe('useListings', () => {
  test('fetches listings with correct parameters', async () => {
    // ✅ Hace fetch con filtros correctos
    // ✅ Maneja loading state
    // ✅ Actualiza data al recibir respuesta
  })

  test('handles API errors gracefully', async () => {
    // ✅ Captura errores de red
    // ✅ Muestra error state apropiado
    // ✅ Permite retry
  })

  test('implements pagination correctly', async () => {
    // ✅ Carga más resultados con cursor
    // ✅ Maneja fin de resultados
    // ✅ Evita duplicados
  })
})
```

#### useFilters.test.ts
```typescript
describe('useFilters', () => {
  test('manages filter state correctly', () => {
    // ✅ Estado inicial correcto
    // ✅ Actualiza filtros individuales
    // ✅ Reset funciona correctamente
  })

  test('validates filter values', () => {
    // ✅ Float range validation (0.0-1.0)
    // ✅ Paint seed debe ser número positivo
    // ✅ Market hash name sanitization
  })
})
```

### 3. Utilidades (`src/utils/__tests__/`)

#### formatters.test.ts
```typescript
describe('formatters', () => {
  test('formatPrice converts cents to dollars correctly', () => {
    // ✅ Convierte centavos a formato $X.XX
    // ✅ Maneja números grandes con comas
    // ✅ Casos edge: 0, null, undefined
  })

  test('formatFloat displays appropriate precision', () => {
    // ✅ Muestra 4-6 decimales según valor
    // ✅ Trunca en lugar de redondear
    // ✅ Casos especiales: 0.0, 1.0
  })
})
```

#### api.test.ts
```typescript
describe('API utilities', () => {
  test('buildQueryString creates correct URLs', () => {
    // ✅ Parámetros en orden alfabético
    // ✅ Encoding correcto de caracteres especiales
    // ✅ Omite parámetros vacíos/null
  })

  test('handleApiError processes errors correctly', () => {
    // ✅ Extrae mensajes de error del response
    // ✅ Maneja diferentes códigos de estado
    // ✅ Fallback para errores desconocidos
  })
})
```

## 🔧 Framework de Testing - Proxy Server

### Stack de Testing Proxy (Hono)
- **Framework principal**: Vitest (≥1.0.0)
- **HTTP Testing**: @hono/testing para testing de rutas
- **Mocking**: vi.mock() para CSFloat API calls
- **Environment**: Node.js test environment

### Configuración para Proxy Testing
```typescript
// proxy/test/setup.ts
import { vi } from 'vitest'

// Mock del cliente CSFloat
vi.mock('../src/csfloat-client', () => ({
  CSFloatClient: vi.fn().mockImplementation(() => ({
    getListings: vi.fn(),
    getListing: vi.fn(),
    postListing: vi.fn()
  }))
}))

// Mock de variables de entorno
process.env.CSFLOAT_API_KEY = 'test-api-key'
process.env.CSFLOAT_BASE_URL = 'https://csfloat.com/api/v1'
```

## 📋 Plan de Tests Específicos - Proxy Server

### 1. Rutas de API (`proxy/test/routes/`)

#### listings.test.ts
```typescript
import { testClient } from '@hono/testing'
import { app } from '../../src/app'

describe('Listings API Routes', () => {
  test('GET /api/listings proxies to CSFloat correctly', async () => {
    // ✅ Pasa query parameters al cliente CSFloat
    // ✅ Inyecta API key en headers
    // ✅ Retorna respuesta JSON correcta
    // ✅ Maneja CORS headers
    
    const client = testClient(app)
    const res = await client.api.listings.$get({
      query: { min_float: '0.0', max_float: '0.1' }
    })
    
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      data: expect.any(Array)
    })
  })

  test('GET /api/listings/:id proxies single listing', async () => {
    // ✅ Pasa ID correctamente
    // ✅ Maneja listing no encontrado (404)
    // ✅ Retorna estructura completa del listing
    
    const client = testClient(app)
    const res = await client.api.listings[':id'].$get({
      param: { id: '123456' }
    })
    
    expect(res.status).toBe(200)
  })

  test('POST /api/listings creates listing with auth', async () => {
    // ✅ Requiere API key válida
    // ✅ Valida payload JSON
    // ✅ Pasa datos al CSFloat API
    // ✅ Maneja errores de validación
    
    const client = testClient(app)
    const res = await client.api.listings.$post({
      json: {
        asset_id: '123456789',
        type: 'buy_now',
        price: 1000
      }
    })
    
    expect(res.status).toBe(201)
  })
})
```

### 2. Middleware Testing (`proxy/test/middleware/`)

#### cors.test.ts
```typescript
describe('CORS Middleware', () => {
  test('sets correct CORS headers for frontend', async () => {
    // ✅ Access-Control-Allow-Origin para localhost:5173
    // ✅ Access-Control-Allow-Methods correctos
    // ✅ Access-Control-Allow-Headers incluye Authorization
    // ✅ Maneja preflight OPTIONS requests
  })

  test('handles preflight requests correctly', async () => {
    // ✅ OPTIONS request retorna 200
    // ✅ Headers CORS apropiados
    // ✅ No body en respuesta
  })
})
```

#### auth.test.ts
```typescript
describe('Auth Middleware', () => {
  test('injects API key for CSFloat requests', async () => {
    // ✅ Agrega Authorization header automáticamente
    // ✅ Usa API key de variables de entorno
    // ✅ No expone API key al frontend
  })

  test('handles missing API key gracefully', async () => {
    // ✅ Error 500 si API key no configurada
    // ✅ Mensaje de error claro
    // ✅ No crash del servidor
  })
})
```

### 3. Error Handling (`proxy/test/errors/`)

#### error-handler.test.ts
```typescript
describe('Error Handler', () => {
  test('handles CSFloat API errors correctly', async () => {
    // ✅ 429 Rate Limit → 429 con Retry-After
    // ✅ 404 Not Found → 404 con mensaje apropiado
    // ✅ 500 Server Error → 502 Bad Gateway
    // ✅ Network errors → 503 Service Unavailable
  })

  test('handles validation errors', async () => {
    // ✅ JSON malformado → 400 Bad Request
    // ✅ Campos faltantes → 400 con detalles
    // ✅ Tipos incorrectos → 400 con validación
  })

  test('handles timeout scenarios', async () => {
    // ✅ Timeout del CSFloat API → 504 Gateway Timeout
    // ✅ Mensaje de error apropiado
    // ✅ Logs para debugging
  })
})
```

### 4. Integration Testing (`proxy/test/integration/`)

#### api-integration.test.ts
```typescript
describe('API Integration', () => {
  test('full request flow works end-to-end', async () => {
    // ✅ Frontend request → Proxy → CSFloat API → Response
    // ✅ Headers correctos en cada paso
    // ✅ Data transformation apropiada
    // ✅ Error propagation correcta
  })

  test('handles concurrent requests correctly', async () => {
    // ✅ Múltiples requests simultáneos
    // ✅ No race conditions
    // ✅ Rate limiting respetado
  })
})
```

## 🔍 Mocking Strategy - Proxy Server

### CSFloat API Mocking
```typescript
import { vi } from 'vitest'

// Mock del cliente CSFloat completo
const mockCSFloatClient = {
  getListings: vi.fn().mockResolvedValue({
    data: [mockListing()],
    cursor: 'next-cursor'
  }),
  
  getListing: vi.fn().mockResolvedValue(mockListing()),
  
  postListing: vi.fn().mockResolvedValue({
    id: '123456',
    status: 'created'
  })
}

// Factory para crear listings de prueba
function mockListing() {
  return {
    id: '123456',
    item: {
      float_value: 0.15,
      paint_seed: 42,
      inspect_link: 'steam://...'
    },
    seller: {
      username: 'testuser',
      statistics: { median_trade_time: 300 }
    },
    price: 1000
  }
}
```

### Error Scenario Mocking
```typescript
// Mock de errores específicos
mockCSFloatClient.getListings
  .mockRejectedValueOnce(new Error('Rate limited'))
  .mockRejectedValueOnce(new Error('Network timeout'))
  .mockResolvedValueOnce({ data: [] }) // Success después de errores
```

## 🚀 Comandos de Testing - Proxy Server

### Ejecución de Tests Proxy
```bash
# Tests del proxy server (comparten suite Vitest con el frontend)
cd apps/csfloat-dash
pnpm test

# Con cobertura
pnpm test -- --coverage

# Tests específicos (por patrón)
pnpm test -- listings.test.ts

# Modo watch
pnpm test -- --watch
```

## 🎭 Framework de Testing E2E (Futuro)

### Stack de Testing End-to-End
- **Framework principal**: Playwright (≥1.40.0)
- **Browsers**: Chromium, Firefox, Safari (WebKit)
- **Test Runner**: Playwright Test Runner
- **Reporting**: HTML reports, screenshots, videos
- **CI/CD**: GitHub Actions integration

### Configuración Planificada (playwright.config.ts)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: [
    {
      command: 'pnpm dev:proxy',
      port: 8787,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'pnpm dev:web',
      port: 5173,
      reuseExistingServer: !process.env.CI
    }
  ]
})
```

## 📋 Plan de Tests Específicos - Web Dashboard

### 1. User Journeys Críticos (`e2e/journeys/`)

#### listing-exploration.spec.ts
```typescript
import { test, expect } from '@playwright/test'

test.describe('Listing Exploration Journey', () => {
  test('user can browse and filter listings', async ({ page }) => {
    // ✅ Navegar a la página principal
    // ✅ Ver grid de listings cargado
    // ✅ Aplicar filtro de float range
    // ✅ Ver resultados filtrados
    // ✅ Cambiar a vista de lista
    // ✅ Ordenar por precio
    // ✅ Scroll infinito funciona
    
    await page.goto('/')
    
    // Esperar que los listings carguen
    await expect(page.locator('[data-testid="listing-card"]')).toHaveCount({ min: 1 })
    
    // Aplicar filtro de float
    await page.fill('[data-testid="min-float-input"]', '0.0')
    await page.fill('[data-testid="max-float-input"]', '0.1')
    await page.click('[data-testid="apply-filters"]')
    
    // Verificar que los resultados están filtrados
    await expect(page.locator('[data-testid="listing-card"]')).toHaveCount({ min: 1 })
    
    // Cambiar vista
    await page.click('[data-testid="list-view-toggle"]')
    await expect(page.locator('[data-testid="listings-container"]')).toHaveClass(/list-view/)
  })

  test('user can view listing details', async ({ page }) => {
    // ✅ Click en listing card
    // ✅ Modal/página de detalles se abre
    // ✅ Información completa visible
    // ✅ Stickers y badges mostrados
    // ✅ Seller information presente
    // ✅ Cerrar modal funciona
  })
})
```

#### search-and-filter.spec.ts
```typescript
test.describe('Search and Filter Functionality', () => {
  test('advanced filtering works correctly', async ({ page }) => {
    // ✅ Filtro por market hash name
    // ✅ Combinación de múltiples filtros
    // ✅ Reset filters funciona
    // ✅ URL parameters se actualizan
    // ✅ Refresh mantiene filtros
  })

  test('sorting options work correctly', async ({ page }) => {
    // ✅ Sort by price (low to high)
    // ✅ Sort by float value
    // ✅ Sort by newest first
    // ✅ Resultados se reordenan correctamente
  })
})
```

### 2. Performance Testing (`e2e/performance/`)

#### loading-performance.spec.ts
```typescript
test.describe('Performance Metrics', () => {
  test('initial page load is fast', async ({ page }) => {
    // ✅ First Contentful Paint < 2s
    // ✅ Largest Contentful Paint < 3s
    // ✅ Time to Interactive < 4s
    // ✅ Cumulative Layout Shift < 0.1
    
    const startTime = Date.now()
    await page.goto('/')
    
    // Esperar que el contenido principal cargue
    await expect(page.locator('[data-testid="listings-container"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3 segundos máximo
  })

  test('infinite scroll performs well', async ({ page }) => {
    // ✅ Scroll suave sin lag
    // ✅ Nuevos items cargan rápidamente
    // ✅ No memory leaks con muchos items
  })
})
```

### 3. Error Scenarios (`e2e/errors/`)

#### error-handling.spec.ts
```typescript
test.describe('Error Handling', () => {
  test('handles API errors gracefully', async ({ page }) => {
    // ✅ Mock API error responses
    // ✅ Error messages mostrados al usuario
    // ✅ Retry functionality funciona
    // ✅ Fallback states apropiados
  })

  test('handles network issues', async ({ page }) => {
    // ✅ Offline state detection
    // ✅ Connection retry logic
    // ✅ User feedback durante errores
  })
})
```

### 4. Cross-Browser Testing (`e2e/compatibility/`)

#### browser-compatibility.spec.ts
```typescript
test.describe('Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`core functionality works in ${browserName}`, async ({ page }) => {
      // ✅ Listings cargan correctamente
      // ✅ Filtros funcionan
      // ✅ UI responsive
      // ✅ No JavaScript errors
    })
  })
})
```

## 🎯 Objetivos de Cobertura E2E

### Metas de Testing E2E
- **User Journeys**: 100% de flujos críticos cubiertos
- **Browser Coverage**: Chrome, Firefox, Safari
- **Performance**: Métricas Core Web Vitals dentro de umbrales
- **Error Scenarios**: Principales casos de error cubiertos
- **Responsive**: Testing en mobile, tablet, desktop

### Comandos E2E Planificados
```bash
# Ejecutar todos los tests E2E
pnpm test:e2e

# Tests en modo headed (con browser visible)
pnpm test:e2e --headed

# Tests específicos
pnpm test:e2e listing-exploration.spec.ts

# Tests en un browser específico
pnpm test:e2e --project=chromium

# Generar reporte HTML
pnpm test:e2e --reporter=html

# Tests con debug
pnpm test:e2e --debug

# Tests en CI (headless, con retries)
pnpm test:e2e:ci
```

## 📊 Métricas y Reporting Integral

### Cobertura de Testing Global
- **CLI Python**: ≥70% cobertura de código
- **Web Components**: ≥70% cobertura de componentes React
- **Proxy Server**: ≥80% cobertura de rutas y middleware
- **E2E Coverage**: 100% de user journeys críticos

### Reporting Consolidado
```bash
# CLI Python: cobertura
pytest --cov=csfloat_client --cov-report=term-missing

# Web/Proxy (Vitest): cobertura + reporte HTML
cd apps/csfloat-dash
pnpm test -- --coverage --reporter=html
```

### Integration con CI/CD
```yaml
# .github/workflows/test.yml (planificado)
name: Test Suite
on: [push, pull_request]

jobs:
  test-cli:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pytest --cov-report=xml
      
  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test -- --coverage
      
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: microsoft/playwright-github-action@v1
      - run: pnpm test:e2e:ci
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