# Manejo de Errores y Logging

## 🚨 Estrategia de Manejo de Errores

### Excepción Personalizada
```python
class CSFloatHTTPError(Exception):
    """
    Excepción específica para errores HTTP de CSFloat API.
    Incluye contexto claro sobre el error y la request que falló.
    """
    pass
```

### Categorías de Errores HTTP

#### 1. Errores Reintetables (Con Backoff)
| Status Code | Descripción | Acción |
|-------------|-------------|---------|
| `429` | Too Many Requests | Backoff exponencial + respeta `Retry-After` |
| `500` | Internal Server Error | Backoff exponencial |
| `502` | Bad Gateway | Backoff exponencial |
| `503` | Service Unavailable | Backoff exponencial |
| `504` | Gateway Timeout | Backoff exponencial |

#### 2. Errores No Reintetables (Fallo Inmediato)
| Status Code | Descripción | Mensaje de Error |
|-------------|-------------|------------------|
| `400` | Bad Request | "Parámetros inválidos en la request" |
| `401` | Unauthorized | "Verificá que CSFLOAT_API_KEY esté presente en .env" |
| `403` | Forbidden | "API key inválida o sin permisos" |
| `404` | Not Found | "Revisá el ID del listing o que la ruta sea correcta" |

#### 3. Errores de Red/Conectividad
| Tipo | Descripción | Acción |
|------|-------------|---------|
| `httpx.RequestError` | Timeout, DNS, conexión | Reintentos con backoff |
| `httpx.ConnectTimeout` | Timeout de conexión | Mensaje sobre conectividad |
| `httpx.ReadTimeout` | Timeout de lectura | Sugerir configurar proxies |

## ⏱️ Algoritmo de Backoff Exponencial

### Implementación Específica
```python
def _sleep_backoff(attempt: int, retry_after: Optional[str]) -> None:
    """
    Backoff exponencial con jitter y respeto a Retry-After.
    
    Prioridades:
    1. Retry-After header (si presente)
    2. Backoff exponencial: min(0.5 * (2 ** attempt), 8.0)
    3. Jitter aleatorio: +random.uniform(0, 0.25)
    4. Skip en tests: CSFLOAT_TEST_NO_SLEEP=1
    """
```

### Configuración de Reintentos
- **Máximo reintentos**: 3 (configurable)
- **Base delay**: 0.5 segundos
- **Cap máximo**: 8.0 segundos
- **Jitter**: +0 a +0.25 segundos aleatorio
- **Test mode**: Skip sleep si `CSFLOAT_TEST_NO_SLEEP=1`

### Secuencia de Delays
| Intento | Base Delay | Con Jitter | Total Máximo |
|---------|------------|------------|--------------|
| 1 | 0.5s | 0.5-0.75s | 0.75s |
| 2 | 1.0s | 1.0-1.25s | 1.25s |
| 3 | 2.0s | 2.0-2.25s | 2.25s |
| 4 | 4.0s | 4.0-4.25s | 4.25s |
| 5+ | 8.0s | 8.0-8.25s | 8.25s |

## 📊 Logging Detallado con Rich

### Formato de Log de Requests
```python
def _log_request(
    method: str, 
    url: httpx.URL, 
    status: Optional[int], 
    latency_ms: Optional[float], 
    request_id: Optional[str],
    filters_preview: Optional[Mapping[str, Any]] = None
) -> None:
    """
    Log estructurado con Rich Table:
    - method (cyan)
    - path 
    - status (magenta)
    - latency
    - request-id (yellow)
    - filters preview (para GET requests)
    """
```

### Tabla de Log Ejemplo
```
┏━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┓
┃ method ┃ path                 ┃ status ┃ latency  ┃ request-id           ┃
┡━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━┩
│ GET    │ /api/v1/listings     │ 200    │ 245.3ms  │ req_abc123def456     │
└────────┴──────────────────────┴────────┴──────────┴──────────────────────┘
filters: {"limit":20,"max_float":0.07,"sort_by":"lowest_price"}
```

### Headers de Request ID
- **Prioridad 1**: `x-request-id`
- **Prioridad 2**: `request-id`
- **Fallback**: `"-"` si no está presente

## 🔧 Configuración HTTP Robusta

### Timeouts Específicos
```python
DEFAULT_TIMEOUT = httpx.Timeout(
    10.0,      # Total timeout
    connect=5.0 # Connect timeout
)
```

### Headers por Defecto
```python
def _default_headers() -> Dict[str, str]:
    return {
        "User-Agent": "csfloat-market-harness/0.1 (+https://csfloat.com)",
        "Accept": "application/json",
        "Authorization": api_key  # Si está configurada
    }
```

### Cliente HTTP Configurado
```python
def create_client(timeout: httpx.Timeout | float | None = None) -> httpx.Client:
    """
    Cliente httpx con:
    - Base URL configurable (CSFLOAT_BASE)
    - Headers automáticos
    - Timeout configurado
    - Soporte para proxies (HTTP_PROXY/HTTPS_PROXY)
    """
```

## 📝 Mensajes de Error Específicos

### Troubleshooting Guide en README
```markdown
## Troubleshooting

### CLI - Errores Comunes

#### 401/403 Unauthorized/Forbidden
- Verificá que `CSFLOAT_API_KEY` esté presente en `.env`
- Confirmá que el endpoint requiere autenticación
- Revisá que la API key sea válida en tu perfil CSFloat

#### 404 Not Found  
- Revisá el `id` del listing (debe ser número largo válido)
- Confirmá que la ruta del endpoint sea correcta
- El listing puede haber sido eliminado o no existir

#### 429 Too Many Requests
- El cliente implementa reintentos automáticos con backoff exponencial
- Respeta `Retry-After` header cuando está presente
- Si persiste, reducí la frecuencia de requests

#### Timeouts / Errores de Red
- Se aplican timeouts razonables (10s total, 5s connect)
- Configurá proxies via `HTTP_PROXY` / `HTTPS_PROXY` si es necesario
- Verificá conectividad a internet y DNS

### Web Dashboard - Troubleshooting

#### Problemas de Setup Inicial

**Error: "Node.js version not supported"**
```bash
# Verificar versión de Node.js
node --version  # Debe ser >= 18.0.0

# Actualizar Node.js si es necesario
# Via nvm (recomendado):
nvm install 18
nvm use 18

# Via instalador oficial:
# Descargar desde https://nodejs.org
```

**Error: "pnpm: command not found"**
```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalación
pnpm --version  # Debe ser >= 8.0.0
```

**Error: "Cannot find module" después de git pull**
```bash
# Reinstalar dependencias
cd apps/csfloat-dash
pnpm install

# Si persiste, limpiar cache
pnpm store prune
rm -rf node_modules
pnpm install
```

#### Problemas de Desarrollo

**Error: "Port 8787 already in use"**
```bash
# Encontrar proceso usando el puerto
lsof -i :8787  # macOS/Linux
netstat -ano | findstr :8787  # Windows

# Terminar proceso o cambiar puerto del proxy
# Opción recomendada: cambiar PORT por entorno y relanzar el proxy
# macOS/Linux (temporal para la sesión):
PORT=8788 pnpm dev:proxy

# Windows PowerShell (temporal para la sesión):
$env:PORT=8788; pnpm dev:proxy

# Para persistir en Windows (nueva sesión):
setx PORT 8788
```

**Error: "Proxy server not responding"**
```bash
# 1. Verificar que el proxy esté corriendo
pnpm dev:proxy

# 2. Verificar logs del proxy
# El proxy imprime logs JSON en consola (método, path, status, ms)
# Revisar salida para códigos 4xx/5xx o timeouts

# 3. Verificar configuración de API key
echo $CSFLOAT_API_KEY  # Debe estar definida

# 4. Reiniciar proxy y observar nuevamente la salida
pnpm dev:proxy
```

**Error: "API requests returning 401 in web dashboard"**
```bash
# 1. Verificar que API key esté en el entorno del proxy
# El proxy debe tener acceso a CSFLOAT_API_KEY

# 2. Verificar que el proxy esté inyectando la API key
# Revisar logs del proxy para confirmar headers

# 3. Verificar que la API key sea válida
# Probar con CLI primero:
python -m csfloat_client.cli listings --limit 1
```

#### Problemas de Build

**Error: "Vite build failed - TypeScript errors"**
```bash
# 1. Verificar errores de TypeScript
pnpm type-check

# 2. Verificar sintaxis de componentes React
# Revisar imports, exports, y JSX syntax

# 3. Limpiar cache de Vite
rm -rf .vite
pnpm dev
```

**Error: "Tailwind styles not loading"**
```bash
# 1. Verificar configuración de Tailwind
cat tailwind.config.js

# 2. Verificar que CSS esté importado
# En src/main.tsx debe estar: import './index.css'

# 3. Regenerar estilos
pnpm build:css
```

#### Problemas de Performance

**Web dashboard muy lento**
- Verificar que el proxy esté corriendo localmente (no en red)
- Revisar logs del proxy para identificar requests lentas
- Considerar reducir frecuencia de polling si está habilitado
- Verificar que no haya memory leaks en React DevTools

**Requests fallando intermitentemente**
- Revisar logs del proxy para patrones de error
- Verificar estabilidad de conexión a internet
- Considerar aumentar timeouts en configuración del proxy
- Verificar rate limiting de la API de CSFloat

#### Logs y Debugging

**Habilitar logs del proxy:**
```bash
# El proxy ya imprime logs JSON por cada request (method, path, status, ms)
# No existen flags PROXY_LOG_LEVEL / PROXY_VERBOSE en esta implementación.
# Para depurar más, podés agregar logs temporales en `apps/csfloat-dash/server/index.ts`.
pnpm dev:proxy
```

**Debugging del frontend:**
```bash
# Desarrollo con React DevTools
pnpm dev

# Build de desarrollo (no minificado)
pnpm build --mode development
```

**Verificar configuración completa:**
```bash
# Verificar variables de entorno
env | grep CSFLOAT

# Verificar versiones de herramientas
node --version
pnpm --version
python --version

# Verificar que CLI funcione
python -m csfloat_client.cli --help
```
```

### Contexto en Excepciones
```python
# Ejemplo de mensaje de error completo
raise CSFloatHTTPError(
    f"HTTP {status} en {method.upper()} {path}: {response_body[:500]}"
) from original_exception
```

## 🧪 Testing de Error Handling

### Mocks de Errores HTTP
```python
@respx.mock
def test_http_error_handling():
    # Mock 429 con Retry-After
    respx.get("https://csfloat.com/api/v1/listings").mock(
        return_value=Response(
            429, 
            headers={"Retry-After": "2.5"},
            json={"error": "Rate limited"}
        )
    )
    
    # Mock 404 con body de error
    respx.get("https://csfloat.com/api/v1/listings/123").mock(
        return_value=Response(
            404,
            json={"error": "Listing not found", "id": "123"}
        )
    )
```

### Verificación de Reintentos
```python
def test_retry_logic():
    """
    Verificar que:
    - Se hacen exactamente max_retries + 1 intentos
    - Cada intento tiene delay apropiado
    - Se respeta Retry-After si está presente
    - Se logea cada intento con latencia
    """
```

## 🌐 Manejo de Errores en Web Dashboard

### Proxy Server Error Handling

El servidor proxy (Hono) maneja errores entre el frontend y la API de CSFloat con estrategias específicas:

#### Categorías de Errores del Proxy
| Tipo de Error | Descripción | Estrategia |
|---------------|-------------|------------|
| **Upstream API Error** | Error de la API de CSFloat | Forward del error + logging |
| **Proxy Connection Error** | Fallo de conexión al API | Retry con backoff exponencial |
| **Authentication Error** | API key inválida/faltante | Error inmediato + mensaje claro |
| **Timeout Error** | Timeout en request upstream | Retry limitado + timeout progresivo |

#### Implementación de Retry Logic en Proxy
```typescript
// Configuración de reintentos para el proxy
const PROXY_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 500, // ms
  maxDelay: 5000, // ms
  retryableStatuses: [429, 500, 502, 503, 504],
  timeoutProgression: [5000, 8000, 12000] // ms por intento
}

// Backoff exponencial con jitter
function calculateDelay(attempt: number): number {
  const baseDelay = PROXY_RETRY_CONFIG.baseDelay
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, attempt),
    PROXY_RETRY_CONFIG.maxDelay
  )
  const jitter = Math.random() * 0.25 * exponentialDelay
  return exponentialDelay + jitter
}
```

#### Error Response Format del Proxy
```typescript
interface ProxyErrorResponse {
  error: string
  code: string
  details?: {
    upstream_status?: number
    upstream_error?: string
    retry_after?: number
    request_id?: string
  }
  timestamp: string
}
```

### Estrategias de Backoff en Contexto Web

#### 1. Client-Side Retry (Frontend)
```typescript
// Retry automático en el cliente para errores de red
const CLIENT_RETRY_CONFIG = {
  maxRetries: 2,
  retryableErrors: ['NetworkError', 'TimeoutError'],
  baseDelay: 1000,
  showUserFeedback: true
}
```

#### 2. Proxy-Side Retry (Servidor)
```typescript
// Retry en el proxy para errores upstream
const PROXY_RETRY_CONFIG = {
  maxRetries: 3,
  respectRetryAfter: true,
  logAllAttempts: true,
  failFast: ['400', '401', '403', '404'] // No retry
}
```

#### 3. Progressive Timeout Strategy
```typescript
// Timeouts progresivos por intento
const TIMEOUT_STRATEGY = {
  attempt1: 5000,  // 5s primer intento
  attempt2: 8000,  // 8s segundo intento  
  attempt3: 12000, // 12s tercer intento
  maxTimeout: 15000 // Cap máximo
}
```

### Errores Específicos del Web Dashboard

#### 1. Errores de Entorno Node.js
| Error | Causa | Solución |
|-------|-------|----------|
| **Node version mismatch** | Node.js < 18.0 | Actualizar a Node.js 18+ |
| **pnpm not found** | pnpm no instalado | `npm install -g pnpm` |
| **Module resolution error** | Dependencias faltantes | `pnpm install` |
| **Permission denied** | Permisos de archivo/puerto | Verificar permisos y puerto 8787 |

#### 2. Errores de Build y Desarrollo
| Error | Descripción | Acción |
|-------|-------------|---------|
| **Vite build failed** | Error en compilación | Verificar sintaxis TypeScript/React |
| **Tailwind compilation error** | CSS no compila | Verificar configuración tailwind.config.js |
| **Port 8787 in use** | Puerto ocupado | Cambiar puerto o terminar proceso |
| **Hot reload not working** | HMR falla | Reiniciar dev server |

#### 3. Errores de Conexión Proxy
| Tipo | Síntoma | Diagnóstico |
|------|---------|-------------|
| **Proxy not responding** | Frontend no conecta | Verificar que proxy esté corriendo en :8787 |
| **CORS errors** | Requests bloqueados | Verificar configuración CORS en proxy |
| **API key not forwarded** | 401 en todas las requests | Verificar variable CSFLOAT_API_KEY en proxy |
| **Timeout en proxy** | Requests lentas/fallan | Ajustar timeouts en configuración |

#### 4. Client-Side Error Handling
```typescript
// Manejo de errores en el frontend
interface ErrorState {
  type: 'network' | 'api' | 'validation' | 'unknown'
  message: string
  retryable: boolean
  details?: Record<string, any>
}

// Estrategia de UX para errores
const ERROR_UX_STRATEGY = {
  network: {
    showRetryButton: true,
    autoRetry: true,
    userMessage: "Problema de conexión. Reintentando..."
  },
  api: {
    showRetryButton: false,
    autoRetry: false,
    userMessage: "Error del servidor. Verificá tu configuración."
  },
  validation: {
    showRetryButton: false,
    autoRetry: false,
    userMessage: "Datos inválidos. Revisá los filtros."
  }
}
```

#### 5. Consideraciones de User Experience
- **Loading States**: Mostrar spinners durante reintentos
- **Error Boundaries**: Capturar errores de React y mostrar fallback UI
- **Toast Notifications**: Notificaciones no intrusivas para errores temporales
- **Graceful Degradation**: Funcionalidad limitada si el proxy falla
- **Offline Detection**: Detectar pérdida de conexión y mostrar estado offline

## ⚠️ Consideraciones Especiales

### Variables de Entorno para Control
```bash
# Deshabilitar sleep en tests para velocidad
CSFLOAT_TEST_NO_SLEEP=1

# Override base URL para testing
CSFLOAT_BASE=https://test-api.csfloat.com

# Configurar proxies si es necesario
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=https://proxy:8080

# Web Dashboard - Configuración del proxy
PROXY_PORT=8787
PROXY_TIMEOUT=10000
PROXY_MAX_RETRIES=3
PROXY_LOG_LEVEL=info
```

### Manejo de Response Bodies Largos
- **Truncar a 500 caracteres** en mensajes de error
- **Preservar información crítica** (status, headers importantes)
- **JSON pretty-print** en logs de desarrollo (opcional)

### Rate Limiting Inteligente
- **Detectar patrones** de 429 frecuentes
- **Sugerir delays** entre requests en CLI
- **Mostrar progreso** en operaciones de export masivo
- **Web Dashboard**: Mostrar indicadores de rate limiting en UI