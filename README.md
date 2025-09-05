# CSFloat Market API — Test Harness (Python 3.11+)

Test harness **"listo para correr"** que prueba exhaustivamente la CSFloat Market API pública. Construido como Senior Backend + QA Automation con cliente Python tipado, CLI completa, suite de tests robusta y **dashboard web premium** para exploración visual.

## 🎯 Características Principales

- **Cliente HTTP robusto** con reintentos automáticos, backoff exponencial y logging detallado
- **CLI completa** con 4 comandos principales y formateo Rich
- **Dashboard web premium** con UI moderna, filtros interactivos y exploración visual
- **Modelos Pydantic tipados** con validación completa de datos
- **Suite de tests** con cobertura ≥70% y mocking HTTP
- **Documentación técnica** completa en [`/docs`](docs/)

## 🖥️ Interfaces Disponibles

Este proyecto ofrece **dos interfaces complementarias** para interactuar con la CSFloat Market API:

### CLI vs Web Dashboard

| Aspecto | CLI (`csf`) | Web Dashboard |
|---------|-------------|---------------|
| **Casos de uso** | Automatización, scripts, análisis de datos | Exploración visual, filtrado interactivo |
| **Velocidad** | Instantánea para consultas específicas | Óptima para navegación y descubrimiento |
| **Filtros** | Todos los parámetros API disponibles | Interfaz visual con validación en tiempo real |
| **Exportación** | CSV directo con paginación automática | Visualización rica con opciones de exportación |
| **Autenticación** | Variable de entorno `CSFLOAT_API_KEY` | Proxy server maneja auth automáticamente |
| **Instalación** | Solo Python 3.11+ | Python + Node.js 18+ + pnpm 8+ |

### ¿Cuándo usar cada interfaz?

**Usa la CLI cuando:**
- Necesites automatizar búsquedas o análisis
- Quieras exportar datos masivos a CSV
- Prefieras comandos rápidos y precisos
- Estés desarrollando scripts o integraciones

**Usa el Web Dashboard cuando:**
- Quieras explorar visualmente el mercado
- Necesites filtros interactivos con preview
- Prefieras una experiencia visual premium
- Quieras navegar y descubrir ítems de forma intuitiva

### Endpoints Soportados
- **`GET /api/v1/listings`** - Listados activos con filtros avanzados y paginación
- **`GET /api/v1/listings/{id}`** - Detalle completo de un listing específico
- **`POST /api/v1/listings`** - Publicar ítem en el marketplace (requiere auth)

## 🚀 Instalación Rápida

### Requisitos

#### Para CLI (Python)
- **Python 3.11+** (requerimiento estricto)
- **Windows PowerShell** (para los ejemplos)

#### Para Web Dashboard (adicional)
- **Node.js 18+** (requerimiento estricto)
- **pnpm 8+** (gestor de paquetes recomendado)

### Setup CLI (Python)
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

### Setup Web Dashboard (Node.js)

```powershell
# 1. Instalar dependencias del web dashboard
pnpm install --prefix apps/csfloat-dash

# 2. Configurar variables de entorno para web
copy apps/csfloat-dash/.env.example apps/csfloat-dash/.env
# Editar apps/csfloat-dash/.env con tu CSFLOAT_API_KEY (opcional para GET /listings)

# 3. Levantar entorno de desarrollo (proxy :8787 + frontend :5173)
pnpm --dir apps/csfloat-dash dev
```

> **Nota**: El web dashboard incluye un proxy server que maneja la autenticación automáticamente. El frontend se conecta a `http://localhost:5173` y el proxy corre en `:8787`.

### Variables de Entorno

#### CLI (archivo `.env` en raíz)
```ini
# Obligatorio para POST /listings
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx

# Opcional - Base URL (default: https://csfloat.com)
CSFLOAT_BASE=https://csfloat.com

# Opcional - Proxies (respetados por httpx)
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=https://proxy:8080
```

#### Web Dashboard (archivo `apps/csfloat-dash/.env`)
```ini
# Opcional - API Key para autenticación automática
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx

# Opcional - Base URL (default: https://csfloat.com)
CSFLOAT_BASE=https://csfloat.com

# Puerto del proxy server (default: 8787)
PORT=8787
```

> **API Key**: Obtené tu clave desde tu perfil CSFloat → pestaña "developer". Para el web dashboard, la API key es opcional ya que solo se necesita para endpoints que requieren autenticación.

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

## 🌐 Uso del Web Dashboard

### Inicio Rápido

1. **Instalar pnpm** (si no lo tenés):
```powershell
# Usando npm
npm install -g pnpm

# O usando Chocolatey en Windows
choco install pnpm
```

2. **Levantar el entorno de desarrollo**:
```powershell
# Desde la raíz del proyecto
pnpm --dir apps/csfloat-dash dev
```

3. **Acceder al dashboard**:
   - Abrí tu navegador en `http://localhost:5173`
   - El proxy server corre automáticamente en `:8787`

### Configuración del Proxy Server

El web dashboard incluye un proxy server (Hono) que:
- **Inyecta autenticación**: Agrega automáticamente el header `Authorization` si tenés `CSFLOAT_API_KEY` configurada
- **Maneja reintentos**: Implementa backoff exponencial para errores 429/5xx
- **Logging detallado**: Registra todas las requests con método, ruta, status y latencia

### Scripts Disponibles

```powershell
# Desarrollo completo (proxy + frontend)
pnpm --dir apps/csfloat-dash dev

# Solo proxy server (puerto 8787)
pnpm --dir apps/csfloat-dash dev:proxy

# Solo frontend (puerto 5173)
pnpm --dir apps/csfloat-dash dev:web

# Build de producción
pnpm --dir apps/csfloat-dash build

# Preview del build
pnpm --dir apps/csfloat-dash preview
```

### Configuración de API Key

Para endpoints que requieren autenticación (como `POST /listings`):

1. Editá `apps/csfloat-dash/.env`:
```ini
CSFLOAT_API_KEY=tu_api_key_aqui
```

2. Reiniciá el servidor de desarrollo:
```powershell
pnpm --dir apps/csfloat-dash dev
```

> **Seguridad**: La API key nunca llega al cliente. El proxy server la inyecta del lado servidor para mantener la seguridad.

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

## ✨ Características del Web Dashboard

### 🎨 Sistema de Diseño Premium

El web dashboard implementa un sistema de diseño moderno y sofisticado que eleva la experiencia de usuario:

- **Glass Morphism Avanzado**: Efectos de backdrop blur multicapa con transparencias graduales y bordes sutiles
- **Paleta de Colores Premium**: Gradientes dinámicos inspirados en CSFloat con esquemas dark/light adaptativos
- **Tipografía Jerárquica**: Familia Inter con 6 pesos diferentes y espaciado óptico optimizado
- **Micro-Animaciones**: Sistema completo de efectos hover, focus, loading y transiciones con timing curves personalizados
- **Layout Fluido**: Grid system responsivo con breakpoints optimizados para desktop, tablet y mobile
- **Iconografía Consistente**: Librería de iconos Lucide React con variantes outline y filled
- **Estados Visuales**: Feedback visual inmediato para todos los estados de interacción (hover, active, disabled, loading)

### 🔧 Componentes Interactivos Avanzados

#### ListingCard Premium
- **Diseño Elevado**: Tarjetas con sombras dinámicas, bordes gradient y efectos de profundidad
- **Hover Sophisticado**: Transformaciones 3D sutiles con scale, rotate y glow effects
- **Badges Inteligentes**: Indicadores contextuales para rareza, float rank, stickers y condiciones especiales
- **Layout Adaptativo**: Información organizada jerárquicamente con tipografía responsive
- **Estados de Interacción**: Visual feedback para favoritos, comparación y acciones rápidas

#### FiltersPanel Interactivo
- **Secciones Colapsables**: Acordeones con animaciones suaves y estados persistentes
- **Inputs Avanzados**: Range sliders, multi-select dropdowns, autocomplete con debounce
- **Validación en Tiempo Real**: Feedback visual inmediato con mensajes contextuales
- **Preview Instantáneo**: Contador de resultados que se actualiza mientras filtras
- **Filtros Inteligentes**: Sugerencias automáticas basadas en el contexto de búsqueda
- **Reset Granular**: Limpieza individual o masiva de filtros con confirmación visual

#### Toolbar Sofisticado
- **Header Gradient**: Branding con efectos de paralaje y transiciones de color
- **Indicadores en Vivo**: Métricas de mercado actualizadas con animaciones de cambio
- **Controles de Vista**: Toggle entre grid/list con transiciones fluidas
- **Ordenamiento Dinámico**: Dropdown con preview de criterios y dirección visual
- **Búsqueda Global**: Input con autocompletado, historial y filtros rápidos

#### ListingsGrid Responsivo
- **Masonry Layout**: Grid adaptativo que optimiza el espacio disponible
- **Skeleton Loading**: Placeholders animados que mantienen la estructura visual
- **Estados Vacíos**: Ilustraciones y mensajes contextuales para diferentes escenarios
- **Paginación Infinita**: Scroll infinito con indicadores de progreso y control manual
- **Lazy Loading**: Carga progresiva de imágenes con placeholders blur-up

### 🎯 Funcionalidades de Exploración Visual Avanzadas

#### Filtrado Interactivo de Próxima Generación
- **Interfaz Visual Completa**: Todos los 20+ parámetros de la API con controles especializados
- **Filtros Contextuales**: Opciones que se adaptan según la categoría de ítem seleccionada
- **Combinaciones Inteligentes**: Sugerencias de filtros complementarios basadas en la selección actual
- **Presets Populares**: Filtros predefinidos para búsquedas comunes (low float, high tier, etc.)
- **Filtros Avanzados**: Rangos de precio con histogramas, float distribution charts
- **Búsqueda Semántica**: Búsqueda por descripción natural ("AK redline bajo float barato")

#### Exploración Visual Inmersiva
- **Vista de Galería**: Modo de exploración enfocado en las imágenes de los ítems
- **Comparación Visual**: Selección múltiple para comparar ítems lado a lado
- **Zoom Interactivo**: Inspección detallada de skins con zoom y pan
- **Filtros Visuales**: Filtrado por colores dominantes, patrones y características visuales
- **Mapas de Calor**: Visualización de distribución de precios y float values
- **Timeline de Mercado**: Historial de precios y tendencias para ítems similares

#### Búsqueda y Descubrimiento Inteligente
- **Autocompletado Contextual**: Sugerencias que incluyen nombres, colecciones y características
- **Búsqueda por Imagen**: Upload de screenshot para encontrar ítems similares
- **Recomendaciones Personalizadas**: Sugerencias basadas en historial de búsqueda
- **Alertas de Mercado**: Notificaciones cuando aparecen ítems que coinciden con criterios guardados
- **Análisis de Tendencias**: Insights sobre movimientos de precios y popularidad

#### Performance y Experiencia Optimizada
- **Carga Progresiva**: Resultados que aparecen incrementalmente mientras se cargan
- **Cache Inteligente**: Resultados guardados localmente para navegación rápida
- **Prefetch Predictivo**: Carga anticipada de páginas siguientes basada en comportamiento
- **Optimización de Imágenes**: WebP con fallbacks, lazy loading y progressive enhancement
- **Debounce Inteligente**: Delays adaptativos según el tipo de filtro y velocidad de tipeo

### 📱 Experiencia Mobile Premium

#### Interfaz Táctil Optimizada
- **Gestos Naturales**: Swipe para filtros, pinch para zoom, pull-to-refresh
- **Filtros en Drawer**: Panel deslizable con backdrop blur y navegación por pestañas
- **Touch Targets**: Áreas de toque optimizadas según guidelines de accesibilidad
- **Feedback Háptico**: Vibraciones sutiles para confirmaciones y transiciones (donde esté disponible)
- **Navegación Fluida**: Transiciones entre vistas con animaciones nativas

#### Adaptación Contextual
- **Layout Responsivo**: Reorganización inteligente de componentes según el viewport
- **Tipografía Escalable**: Tamaños de fuente que se adaptan a la densidad de pantalla
- **Controles Adaptativos**: Elementos de UI que cambian según el método de input (touch vs mouse)
- **Performance Mobile**: Optimizaciones específicas para dispositivos con recursos limitados

### 🔒 Características de Seguridad y Confiabilidad

#### Arquitectura Segura
- **Proxy Server Aislado**: Todas las API keys y credenciales manejadas server-side
- **Validación Multicapa**: Esquemas Zod en frontend + Pydantic en backend
- **Sanitización de Datos**: Limpieza automática de inputs para prevenir XSS
- **Rate Limiting Cliente**: Throttling inteligente para respetar límites de API
- **Error Boundaries**: Recuperación automática de errores sin pérdida de estado

#### Monitoreo y Observabilidad
- **Logging Detallado**: Tracking de interacciones de usuario y performance metrics
- **Error Tracking**: Captura automática de errores con contexto completo
- **Analytics de Uso**: Métricas de engagement y patrones de navegación
- **Health Checks**: Monitoreo continuo de conectividad y estado de servicios

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

### Errores del Web Dashboard

#### Problemas de Entorno Node.js
- **Error: "node: command not found"**
  - Instalá Node.js 18+ desde [nodejs.org](https://nodejs.org/)
  - Verificá la instalación: `node --version`
  - En Windows, reiniciá PowerShell después de la instalación

- **Error: "pnpm: command not found"**
  - Instalá pnpm globalmente: `npm install -g pnpm`
  - O usando Chocolatey: `choco install pnpm`
  - Verificá la instalación: `pnpm --version`
  - Si persiste, agregá pnpm al PATH manualmente

- **Error: "Unsupported Node.js version"**
  - Verificá que tengas Node.js 18 o superior: `node --version`
  - Actualizá Node.js si es necesario
  - Considerá usar nvm para manejar múltiples versiones

- **Error: "Permission denied" en instalación global**
  - En Windows: Ejecutá PowerShell como administrador
  - En sistemas Unix: Usá `sudo npm install -g pnpm`
  - O configurá npm para usar un directorio local: `npm config set prefix ~/.npm-global`

- **Error: "EACCES: permission denied, mkdir"**
  - Configurá npm para usar un directorio con permisos: `npm config set cache ~/.npm`
  - O ejecutá con permisos elevados según tu sistema operativo

#### Errores de Conexión del Proxy
- **Error: "ECONNREFUSED :8787"**
  - Verificá que el proxy server esté corriendo: `pnpm --dir apps/csfloat-dash dev:proxy`
  - Confirmá que el puerto 8787 no esté ocupado: `netstat -an | findstr :8787`
  - Revisá los logs del proxy para errores de inicio
  - Intentá cambiar el puerto en `apps/csfloat-dash/.env`: `PORT=8788`

- **Error: "Failed to fetch" en el navegador**
  - Verificá que Vite esté corriendo en `:5173`: `pnpm --dir apps/csfloat-dash dev:web`
  - Confirmá la configuración del proxy en `vite.config.ts`
  - Revisá la consola del navegador para errores de CORS
  - Verificá que ambos servidores (proxy y frontend) estén activos

- **Error: "Proxy server not responding"**
  - Reiniciá el proxy server: `Ctrl+C` y luego `pnpm --dir apps/csfloat-dash dev:proxy`
  - Verificá la configuración de red y firewall
  - Confirmá que no haya conflictos de puerto con otras aplicaciones
  - Revisá los logs del proxy para errores de conectividad con CSFloat API

- **Error: "CORS policy blocked"**
  - Verificá que estés accediendo desde `http://localhost:5173`
  - No uses la IP directa (127.0.0.1) sino localhost
  - Confirmá la configuración de CORS en el proxy server
  - Deshabilitá extensiones del navegador que puedan interferir

#### Errores de Build y Desarrollo
- **Error: "Module not found" durante build**
  - Ejecutá `pnpm install --prefix apps/csfloat-dash` para reinstalar dependencias
  - Verificá que todas las dependencias estén en `package.json`
  - Limpiá el cache: `rm -rf apps/csfloat-dash/node_modules/.vite`
  - En Windows: `rmdir /s apps\csfloat-dash\node_modules\.vite`

- **Error: "PostCSS plugin tailwindcss requires PostCSS 8"**
  - Verificá la versión de PostCSS: `pnpm list postcss`
  - Reinstalá las dependencias si es necesario
  - Confirmá la configuración en `postcss.config.cjs`
  - Limpiá node_modules y reinstalá: `rm -rf node_modules && pnpm install`

- **Errores de TypeScript en desarrollo**
  - Verificá la configuración en `tsconfig.json`
  - Ejecutá `pnpm --dir apps/csfloat-dash build` para ver errores de tipos
  - Revisá que las importaciones de tipos sean correctas
  - Reiniciá el TypeScript server en tu editor

- **Error: "Vite build failed"**
  - Verificá que no haya errores de TypeScript: `pnpm --dir apps/csfloat-dash type-check`
  - Limpiá el cache de Vite: `rm -rf apps/csfloat-dash/dist apps/csfloat-dash/node_modules/.vite`
  - Verificá la configuración en `vite.config.ts`
  - Revisá que todas las importaciones sean válidas

- **Error: "Out of memory" durante build**
  - Aumentá la memoria de Node.js: `NODE_OPTIONS="--max-old-space-size=4096" pnpm build`
  - Cerrá otras aplicaciones que consuman memoria
  - Considerá hacer un build incremental si está disponible

#### Problemas de Dependencias
- **Error: "Package not found" o versiones incompatibles**
  - Limpiá el lockfile y reinstalá: `rm pnpm-lock.yaml && pnpm install`
  - Verificá que estés usando pnpm 8+: `pnpm --version`
  - Actualizá las dependencias: `pnpm update`
  - Revisá conflictos de peer dependencies: `pnpm install --no-optional`

- **Error: "Workspace not found"**
  - Verificá que estés ejecutando comandos desde la raíz del proyecto
  - Confirmá que `apps/csfloat-dash/package.json` exista
  - Revisá la configuración de workspace en `pnpm-workspace.yaml`

### Errores de Autenticación (CLI y Web)
- **401/403 Unauthorized/Forbidden**
  - **CLI**: Verificá que `CSFLOAT_API_KEY` esté en `.env` (raíz del proyecto)
  - **Web**: Verificá que `CSFLOAT_API_KEY` esté en `apps/csfloat-dash/.env`
  - Confirmá que el endpoint requiere autenticación
  - Revisá que la API key sea válida en tu perfil CSFloat
  - **Web**: Reiniciá el proxy server después de cambiar la API key

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
  - **CLI**: Timeouts configurados: 10s total, 5s connect
  - **Web**: El proxy implementa reintentos automáticos con backoff exponencial
  - Configurá proxies via `HTTP_PROXY` / `HTTPS_PROXY` (solo CLI)
  - Verificá conectividad a internet y DNS
  - **Web**: Revisá los logs del proxy server para detalles de conectividad

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
