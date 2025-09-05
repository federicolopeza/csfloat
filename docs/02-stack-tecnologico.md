# Stack Tecnológico y Configuración

## 🐍 Requerimientos Base - CLI Python

### Python y Dependencias Obligatorias
- **Python**: `3.11+` (requerimiento estricto)
- **Build Backend**: `hatchling>=1.18.0`
- **Dependencias Core**:
  - `httpx>=0.25,<0.28` - Cliente HTTP con soporte async, timeouts y reintentos
  - `pydantic>=2.2,<3` - Modelos tipados con validación
  - `typer>=0.12,<1.0` - Framework CLI moderno
  - `rich>=13.0,<14.0` - Formateo de consola y tablas
  - `python-dotenv>=1.0,<2.0` - Gestión de variables de entorno

### Dependencias de Testing
- `pytest>=7,<9` - Framework de testing
- `pytest-cov>=4,<6` - Cobertura de código
- `respx>=0.20,<0.22` - Mock de HTTP para testing

## 🌐 Requerimientos Base - Web Dashboard

### Node.js y Gestión de Paquetes
- **Node.js**: `18+` (requerimiento mínimo para ESM y APIs modernas)
- **pnpm**: `8+` (gestor de paquetes recomendado para monorepos)
- **TypeScript**: `5.6+` (tipado estático y compatibilidad con React 18)

### Stack Frontend Principal
- **React**: `18.3+` - Framework UI con concurrent features
- **Vite**: `7.1+` - Build tool y dev server con HMR
- **Tailwind CSS**: `3.4+` - Framework CSS utility-first
- **PostCSS**: `8.4+` - Procesamiento CSS y autoprefixer

### Stack Backend (Proxy Server)
- **Hono**: `4.6+` - Framework web ligero para proxy API
- **@hono/node-server**: `1.11+` - Adaptador Node.js para Hono
- **tsx**: `4.19+` - Ejecutor TypeScript con hot reload

### Dependencias UI y Estado
- **@radix-ui/react-dialog**: `1.0+` - Componentes accesibles de modal
- **@radix-ui/react-scroll-area**: `1.0+` - Área de scroll personalizada
- **@tanstack/react-query**: `5.51+` - Gestión de estado servidor
- **zustand**: `4.5+` - Gestión de estado cliente ligera
- **lucide-react**: `0.424+` - Iconografía SVG optimizada
- **zod**: `3.23+` - Validación de esquemas TypeScript

### Dependencias de Testing y Desarrollo
- **vitest**: `3.2+` - Framework de testing para Vite
- **concurrently**: `9.0+` - Ejecución paralela de scripts
- **dotenv**: `16.4+` - Gestión de variables de entorno

## ⚙️ Configuración de Entorno

### Variables de Entorno - CLI Python
```bash
# .env (obligatorio para POST endpoints)
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx  # Desde perfil CSFloat, tab "developer"
CSFLOAT_BASE=https://csfloat.com   # Base URL (opcional, por defecto csfloat.com)

# Proxies opcionales (respetados por httpx)
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=https://proxy:8080
```

### Variables de Entorno - Web Dashboard
```bash
# apps/csfloat-dash/.env (configuración del proxy server)
PORT=8787                          # Puerto del servidor proxy Hono
CSFLOAT_BASE=https://csfloat.com   # Base URL de la API CSFloat
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx  # API key (mismo que CLI)
RATE_LIMIT=60                      # Límite de requests por ventana
RATE_WINDOW_MS=60000              # Ventana de rate limiting en ms
```

### Configuración de Autenticación
- **Header**: `Authorization: <API-KEY>`
- **Generación**: Perfil CSFloat → pestaña "developer"
- **Uso**: Requerido para `POST /api/v1/listings`
- **Opcional**: Para endpoints `GET` (algunos pueden requerir auth)

## 🔧 Comandos de Desarrollo

### Setup Inicial CLI Python (PowerShell)
```powershell
# Crear y activar entorno virtual
python -m venv .venv
. .venv/Scripts/Activate.ps1

# Instalar en modo desarrollo
pip install -e .

# Instalar con dependencias de testing
pip install -e ".[test]"

# Copiar configuración de ejemplo
copy .env.example .env
# Editar .env con tu CSFLOAT_API_KEY
```

### Setup Inicial Web Dashboard (PowerShell)
```powershell
# Navegar al directorio del web dashboard
cd apps/csfloat-dash

# Instalar dependencias con pnpm
pnpm install

# Copiar configuración de ejemplo
copy .env.example .env
# Editar .env con tu CSFLOAT_API_KEY y configuración del proxy
```

### Comandos de Desarrollo Web
```powershell
# Desarrollo completo (proxy + frontend en paralelo)
pnpm dev

# Solo servidor proxy (puerto 8787)
pnpm dev:proxy

# Solo frontend Vite (puerto 5173, requiere proxy corriendo)
pnpm dev:web

# Build de producción
pnpm build

# Preview del build de producción
pnpm preview

# Ejecutar tests unitarios
pnpm test
```

### Testing y Calidad CLI Python
```powershell
# Ejecutar tests con cobertura (configuración en pyproject.toml)
pytest

# Tests específicos con verbose
pytest -v tests/test_listings_filters.py

# Solo cobertura sin tests
pytest --cov=csfloat_client --cov-report=term-missing

# Verificar cobertura mínima (configurado: ≥70% global, ≥80% http.py/endpoints.py)
pytest --cov-fail-under=70
```

### CLI Instalada
```powershell
# El package instala comando 'csf' globalmente
csf listings:find --help
csf listing:get --help  
csf listing:list --help
csf listings:export --help
```

### Web Dashboard - Flujo de Desarrollo
```powershell
# 1. Instalar Node.js 18+ y pnpm 8+ (si no están instalados)
# Verificar versiones
node --version  # debe ser 18+
pnpm --version  # debe ser 8+

# 2. Setup del web dashboard
cd apps/csfloat-dash
pnpm install
copy .env.example .env

# 3. Configurar .env con tu API key
# Editar apps/csfloat-dash/.env:
# CSFLOAT_API_KEY=tu_api_key_aqui

# 4. Iniciar desarrollo (proxy + frontend)
pnpm dev
# Acceder a http://localhost:5173 (frontend)
# Proxy API corriendo en http://localhost:8787
```

### Web Dashboard - Proceso de Build
```powershell
# Build de producción
cd apps/csfloat-dash
pnpm build

# Los archivos se generan en dist/
# Para servir: pnpm preview (puerto 4173)

# Testing unitario
pnpm test

# Testing con watch mode
pnpm test --watch
```

## 🏗️ Configuración de Build

### pyproject.toml - CLI Python
```toml
[project.scripts]
csf = "csfloat_client.cli:main"  # Entry point CLI

[tool.pytest.ini_options]
addopts = "-q --cov=csfloat_client --cov-report=term-missing --cov-fail-under=70"
testpaths = ["tests"]

[tool.coverage.run]
branch = true
source = ["csfloat_client"]
```

### package.json - Web Dashboard
```json
{
  "scripts": {
    "dev": "concurrently -n PROXY,WEB -c blue,green \"npm run dev:proxy\" \"npm run dev:web\"",
    "dev:web": "vite",
    "dev:proxy": "tsx -r dotenv/config server/index.ts",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

### Configuración Vite (vite.config.ts)
- **Puerto dev**: `5173` (frontend React)
- **Puerto preview**: `4173` (build de producción)
- **Proxy API**: `8787` (servidor Hono)
- **Build output**: `dist/` (archivos estáticos optimizados)
- **TypeScript**: Compilación y type-checking automático

## 🌐 Configuración HTTP

### Cliente httpx - Especificaciones
- **Base URL**: `https://csfloat.com` (configurable via `CSFLOAT_BASE`)
- **Headers por defecto**:
  - `User-Agent: csfloat-market-harness/0.1 (+https://csfloat.com)`
  - `Accept: application/json`
  - `Authorization: <API-KEY>` (si está configurada)
- **Timeouts**: `10.0s` total, `5.0s` connect
- **Reintentos**: Automáticos en `429, 500, 502, 503, 504`
- **Backoff**: Exponencial con jitter, respeta `Retry-After`