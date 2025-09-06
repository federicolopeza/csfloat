# CSFloat Market API — Test Harness

## 🎯 Propósito del Proyecto

Este es un **test harness "listo para correr"** que prueba exhaustivamente la CSFloat Market API pública. Actúa como Senior Backend + QA Automation para construir un cliente Python tipado con CLI completa y un dashboard web interactivo.

### Componentes Principales

- **Cliente Python con CLI**: Herramienta de línea de comandos para automatización y scripting
- **Dashboard Web**: Interfaz visual premium con React para exploración interactiva de datos
- **Proxy Server**: Servidor Hono que conecta el frontend con la API de CSFloat

## 📋 Funcionalidades Específicas

### Endpoints Soportados (Según Documentación Oficial)
- **`GET /api/v1/listings`** - Listados activos con filtros y ordenamiento
- **`GET /api/v1/listings/{id}`** - Detalle completo de un listing (activo o inactivo)  
- **`POST /api/v1/listings`** - Publicar un ítem (requiere Authorization)

### Capacidades de Filtrado Completas
- **Paginación**: cursor-based con `limit ≤ 50`
- **Ordenamiento**: `lowest_price`, `highest_price`, `most_recent`, `expires_soon`, `lowest_float`, `highest_float`, `best_deal`, `highest_discount`, `float_rank`, `num_bids`
- **Filtros por ítem**: `def_index`, `min_float`, `max_float`, `rarity`, `paint_seed`, `paint_index`, `market_hash_name`
- **Filtros por precio**: `min_price`, `max_price` (en centavos)
- **Filtros por categoría**: `category` (0:any | 1:normal | 2:stattrak | 3:souvenir)
- **Filtros avanzados**: `user_id`, `collection`, `type` (buy_now|auction), `stickers` (formato ID|POSITION)

## 🎮 Casos de Uso Específicos

### Búsquedas Típicas de Traders (CLI)
```bash
# Buscar AK-47 Redline con float bajo y precio mínimo
csf listings:find --limit 20 --sort-by lowest_price --max-float 0.07 --market-hash-name "AK-47 | Redline (Field-Tested)"

# Buscar por paint seed específico en colección Bravo II
csf listings:find --paint-seed 555 --collection set_bravo_ii --limit 50

# Exportar datos para análisis
csf listings:export --title "AK-47 | Redline" --min-float 0.00 --max-float 0.07 --out redline_fn.csv
```

### Exploración Visual (Dashboard Web)
- **Filtrado Interactivo**: Usar controles visuales para ajustar rangos de float, precio y rareza en tiempo real
- **Exploración de Colecciones**: Navegar visualmente por colecciones completas con previsualizaciones de skins
- **Análisis de Tendencias**: Visualizar distribución de precios y floats con gráficos interactivos
- **Comparación de Ítems**: Ver múltiples listings lado a lado con detalles completos de stickers y wear
- **Imágenes de Skins**: Renderizado de imágenes mediante `icon_url` (Steam economy) con `getItemImageUrl` y fallback, carga diferida (lazy-load)
- **Enlaces a CSFloat**: Botón "Ver en CSFloat" que enlaza al permalink público `https://csfloat.com/item/<ID>`; si no hay `item.id`, cae al checker `https://csfloat.com/checker?inspect=...` (ver `apps/csfloat-dash/src/lib/utils/url.ts`)

### Flujos de Trabajo para Traders (Dashboard Web)
- **Monitoreo de Mercado**: Dashboard en tiempo real para seguir listings de interés con actualizaciones automáticas
- **Búsqueda Avanzada**: Combinar múltiples filtros usando una interfaz intuitiva sin comandos complejos
- **Gestión de Favoritos**: Guardar búsquedas frecuentes y recibir notificaciones de nuevos listings
- **Análisis de Inversión**: Evaluar potencial de ganancia con herramientas visuales de análisis de precios

### Gestión de Inventario (CLI)
```bash
# Obtener detalle completo de un listing
csf listing:get --id 324288155723370196

# Publicar ítem propio
csf listing:list --asset-id 21078095468 --type buy_now --price 8900 --private false --desc "Just for show"
```

## 🔍 Criterios de Aceptación

### Cliente CLI
- ✅ `csf listings:find` obtiene resultados con `float_value`, `paint_seed`, `inspect_link`
- ✅ `csf listing:get` devuelve objeto completo con `seller`, `item` (incl. stickers y scm) y metadatos
- ✅ `csf listing:list` valida campos obligatorios y funciona con Authorization
- ✅ Tests de paginación por cursor, filtros por float y manejo de errores pasan con cobertura ≥70%

### Dashboard Web
- ✅ Interfaz visual permite filtrar listings por float, precio, rareza y otros criterios sin comandos CLI
- ✅ Componentes React muestran listings con imágenes, detalles de stickers y metadatos completos
- ✅ Proxy server maneja autenticación y reenvía requests a CSFloat API correctamente
- ✅ Filtros interactivos actualizan resultados en tiempo real con validación de entrada
- ✅ Diseño responsive funciona en desktop y mobile con componentes Tailwind optimizados
- ✅ Manejo de errores muestra mensajes user-friendly para problemas de conexión y API
- ✅ Paginación visual permite navegar grandes conjuntos de resultados sin perder filtros aplicados