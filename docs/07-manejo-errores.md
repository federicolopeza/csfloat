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

### 401/403 Unauthorized/Forbidden
- Verificá que `CSFLOAT_API_KEY` esté presente en `.env`
- Confirmá que el endpoint requiere autenticación
- Revisá que la API key sea válida en tu perfil CSFloat

### 404 Not Found  
- Revisá el `id` del listing (debe ser número largo válido)
- Confirmá que la ruta del endpoint sea correcta
- El listing puede haber sido eliminado o no existir

### 429 Too Many Requests
- El cliente implementa reintentos automáticos con backoff exponencial
- Respeta `Retry-After` header cuando está presente
- Si persiste, reducí la frecuencia de requests

### Timeouts / Errores de Red
- Se aplican timeouts razonables (10s total, 5s connect)
- Configurá proxies via `HTTP_PROXY` / `HTTPS_PROXY` si es necesario
- Verificá conectividad a internet y DNS
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
```

### Manejo de Response Bodies Largos
- **Truncar a 500 caracteres** en mensajes de error
- **Preservar información crítica** (status, headers importantes)
- **JSON pretty-print** en logs de desarrollo (opcional)

### Rate Limiting Inteligente
- **Detectar patrones** de 429 frecuentes
- **Sugerir delays** entre requests en CLI
- **Mostrar progreso** en operaciones de export masivo