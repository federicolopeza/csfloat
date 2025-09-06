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

### Web Dashboard (`apps/csfloat-dash/`)
```
apps/csfloat-dash/
├── package.json                   # Dependencias Node.js: React, Vite, Tailwind, Hono
├── vite.config.ts                 # Configuración Vite para desarrollo y build
├── tailwind.config.ts             # Configuración Tailwind CSS
├── tsconfig.json                  # Configuración TypeScript
├── index.html                     # Template HTML principal
├── .env.example                   # Variables de entorno para desarrollo
├── server/
│   └── index.ts                   # Servidor proxy Hono (puerto 8787)
└── src/
    ├── main.tsx                   # Punto de entrada React
    ├── App.tsx                    # Componente raíz de la aplicación
    ├── index.css                  # Estilos globales y Tailwind imports
    ├── components/
    │   ├── FiltersPanel.tsx       # Panel de filtros lateral
    │   ├── Toolbar.tsx            # Barra de herramientas superior
    │   ├── ListingsGrid.tsx       # Grid de listings con paginación
    │   └── ListingCard.tsx        # Tarjeta individual de listing
    ├── pages/
    │   └── Home.tsx               # Página principal del dashboard
    ├── store/
    │   ├── useFilters.ts          # Estado global de filtros (Zustand)
    │   └── useListings.ts         # Estado global de listings (Zustand)
    └── lib/
        ├── api/                   # Clientes API y utilidades
        ├── models/                # Tipos TypeScript (mirrors Pydantic)
        ├── utils/                 # Utilidades de frontend
        │   ├── images.ts          # buildSteamEconomyImageUrl, getItemImageUrl
        │   └── url.ts             # getCsfloatPublicUrl, resolveCsfloatPublicUrl(With)
        └── demo-data.ts           # Datos de demostración
```

## 🏗️ Arquitectura en Capas

### 1. CLI Layer (`cli.py`)
- **Framework**: Typer con Rich para formateo
- **Comandos**: `listings:find`, `listing:get`, `listing:list`, `listings:export`
- **Salida**: Tablas Rich con columnas específicas (id, price, float, seed, paint, etc.)
- **Idioma**: Español en help text y mensajes

### 2. Web Dashboard Layer (`apps/csfloat-dash/`)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build Tool**: Vite con hot reload y optimización de producción
- **Proxy Server**: Hono ejecutándose en puerto 8787
- **Estado**: Zustand para manejo de estado global
- **Queries**: TanStack Query para cache y sincronización de datos
 - **Fuentes**: Inter cargada con `<link>` en `index.html` (sin `@import` en CSS) para evitar errores PostCSS y mejorar performance

### 3. Endpoints Layer (`endpoints.py`)
- **Wrappers tipados** para cada endpoint de la API
- **Funciones principales**:
  - `get_listings(**filters) -> list[Listing]`
  - `get_listing(listing_id: str) -> Listing`  
  - `post_listing(asset_id: str, type: str="buy_now", **kwargs) -> Listing`
  - `get_listings_page(**filters) -> ListingsPage` (con cursor)

### 4. HTTP Layer (`http.py`)
- **Cliente**: httpx con configuración específica
- **Headers automáticos**: User-Agent, Accept, Authorization
- **Reintentos**: 429/5xx con backoff exponencial y jitter
- **Logging**: Rich tables con método, ruta, status, latencia, request-id
- **Timeouts**: 10s total, 5s connect

### 5. Models Layer (`models.py`)
- **Pydantic v2** con `extra="ignore"` para compatibilidad futura
- **Modelos principales**: `Listing`, `Item`, `Seller`, `Sticker`, `SCM`, `SellerStats`
- **Campos específicos**: Todos los documentados en la API oficial

## 🌐 Arquitectura del Proxy Web

### Servidor Proxy Hono (Puerto 8787)
El web dashboard utiliza un servidor proxy intermedio construido con Hono que actúa como puente entre el frontend React y la API de CSFloat:

```
Frontend React (Puerto 5173) → Proxy Hono (Puerto 8787) → CSFloat API
```

#### Flujo de Comunicación
1. **Frontend Request**: React envía peticiones a `http://localhost:8787/proxy/*`
2. **Proxy Processing**: Hono intercepta, añade headers de autenticación y reenvía a CSFloat API
3. **API Response**: CSFloat API responde al proxy con datos JSON
4. **Frontend Response**: Proxy reenvía la respuesta al frontend con headers CORS apropiados

#### Ventajas del Proxy
- **Seguridad**: API key se mantiene en el servidor, no expuesta al cliente
- **CORS**: Resuelve problemas de cross-origin entre frontend y API externa
- **Caching**: Posibilidad de implementar cache de respuestas
- **Rate Limiting**: Control centralizado de límites de peticiones
- **Error Handling**: Transformación consistente de errores para el frontend

#### Configuración del Proxy
- **Puerto**: 8787 (configurable via `PORT` env var)
- **Rutas**: Endpoints `/proxy/*` que forwardean hacia `https://csfloat.com/api/v1/*`
- **Headers**: Inyección automática de `Authorization: <API_KEY>`
- **Environment**: Variables cargadas desde `.env` file

## ⚛️ Arquitectura de Componentes React

### Jerarquía de Componentes
```
App.tsx (Raíz)
└── Home.tsx (Página principal)
    ├── Toolbar.tsx (Barra superior)
    ├── FiltersPanel.tsx (Panel lateral)
    └── ListingsGrid.tsx (Grid principal)
        └── ListingCard.tsx (Tarjeta individual)
```

### Componentes Principales

#### `App.tsx` - Componente Raíz
- **Responsabilidad**: Configuración global de providers y routing
- **Providers**: TanStack Query Client, Zustand stores
- **Estilos**: Configuración de Tailwind CSS

#### `Home.tsx` - Página Principal
- **Layout**: Grid CSS con sidebar y main content
- **Responsabilidad**: Orquestación de componentes principales
- **Estado**: Conexión con stores globales de filtros y listings

#### `Toolbar.tsx` - Barra de Herramientas
- **Funcionalidad**: Controles de vista, búsqueda rápida, acciones globales
- **Estado**: Conectado a `useFilters` store
- **UI**: Botones, inputs de búsqueda, selectores de vista

#### `FiltersPanel.tsx` - Panel de Filtros
- **Funcionalidad**: Filtros avanzados (precio, float, paint seed, etc.)
- **Estado**: Manejo local de formulario + sincronización con `useFilters`
- **UI**: Radix UI components para sliders, selects, checkboxes
- **Validación**: Zod schemas para validación de filtros

#### `ListingsGrid.tsx` - Grid de Listings
- **Responsabilidad**: Renderizado de lista de listings con paginación
- **Estado**: Conectado a `useListings` store y TanStack Query
- **Performance**: Virtualización para grandes listas
- **Loading**: Estados de carga, error y datos vacíos

#### `ListingCard.tsx` - Tarjeta de Listing
- **Responsabilidad**: Visualización individual de cada listing
- **Props**: Recibe objeto `Listing` tipado
- **UI**: Imagen, precio, float, detalles del item
- **Interacciones**: Click para detalles, hover effects
 - **Permalink**: Botón "View on CSFloat" que usa `getCsfloatPublicUrl(listing)` y `resolveCsfloatPublicUrl` con fallback a `https://csfloat.com/checker?inspect=...`

### Manejo de Estado

#### Zustand Stores
- **`useFilters.ts`**: Estado global de filtros aplicados
- **`useListings.ts`**: Estado global de listings y paginación

#### TanStack Query
- **Cache**: Gestión automática de cache de API responses
- **Invalidation**: Invalidación inteligente cuando cambian filtros
- **Background Updates**: Actualizaciones en background
- **Error Handling**: Manejo centralizado de errores de API

### Flujo de Datos
1. **User Input**: Usuario modifica filtros en `FiltersPanel`
2. **State Update**: Filtros se actualizan en `useFilters` store
3. **Query Trigger**: TanStack Query detecta cambio y ejecuta nueva query
4. **API Call**: Query llama al proxy server en `/proxy/*` con nuevos filtros
5. **UI Update**: `ListingsGrid` se re-renderiza con nuevos datos

## 🔧 Workflow de Desarrollo y Build

### Comandos de Desarrollo

#### Desarrollo Completo
```bash
cd apps/csfloat-dash
npm run dev
```
- **Ejecuta**: Proxy server (puerto 8787) + Vite dev server (puerto 5173) concurrentemente
- **Hot Reload**: Cambios en código se reflejan automáticamente
- **Proxy**: Maneja automáticamente requests del frontend a la API

#### Desarrollo por Separado
```bash
# Terminal 1: Solo proxy server
npm run dev:proxy

# Terminal 2: Solo frontend
npm run dev:web
```

#### Testing
```bash
npm run test
```
- **Framework**: Vitest para unit tests
- **Coverage**: Reportes de cobertura automáticos
- **Watch Mode**: Re-ejecución automática en cambios

### Proceso de Build

#### Build de Producción
```bash
npm run build
```
- **Output**: Directorio `dist/` con assets optimizados
- **Optimizaciones**: Minificación, tree-shaking, code splitting
- **Assets**: CSS y JS bundleados con hashing para cache busting

#### Preview de Build
```bash
npm run preview
```
- **Servidor**: Sirve build de producción localmente
- **Testing**: Verificación de build antes de deployment

### Configuración de Entorno

#### Variables de Entorno
```bash
# .env file
CSFLOAT_API_KEY=your_api_key_here
PORT=8787
# Nota: el frontend usa rutas relativas (`/proxy/*`) y no requiere `VITE_API_BASE_URL`
```

#### Archivos de Configuración
- **`vite.config.ts`**: Configuración de Vite (plugins, proxy, build)
- **`tailwind.config.ts`**: Configuración de Tailwind CSS
- **`tsconfig.json`**: Configuración de TypeScript
- **`postcss.config.cjs`**: Configuración de PostCSS para Tailwind

### Consideraciones de Deployment

#### Build Assets
- **Static Files**: Frontend compilado puede servirse desde CDN
- **Proxy Server**: Requiere Node.js runtime para el servidor Hono
- **Environment**: Variables de entorno deben configurarse en producción

#### Opciones de Deployment
1. **Vercel/Netlify**: Frontend estático + Serverless functions para proxy
2. **Docker**: Containerización completa con Node.js
3. **Traditional Hosting**: VPS con Node.js + nginx para static assets

#### Performance
- **Bundle Size**: Optimizado con tree-shaking y code splitting
- **Caching**: Headers de cache apropiados para assets estáticos
- **API Caching**: Implementación de cache en proxy server para reducir calls a CSFloat API

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