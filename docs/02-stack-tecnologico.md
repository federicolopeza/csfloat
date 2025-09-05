# Stack Tecnológico y Configuración

## 🐍 Requerimientos Base

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

## ⚙️ Configuración de Entorno

### Variables de Entorno Requeridas
```bash
# .env (obligatorio para POST endpoints)
CSFLOAT_API_KEY=xxxxxxxxxxxxxxxx  # Desde perfil CSFloat, tab "developer"
CSFLOAT_BASE=https://csfloat.com   # Base URL (opcional, por defecto csfloat.com)

# Proxies opcionales (respetados por httpx)
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=https://proxy:8080
```

### Configuración de Autenticación
- **Header**: `Authorization: <API-KEY>`
- **Generación**: Perfil CSFloat → pestaña "developer"
- **Uso**: Requerido para `POST /api/v1/listings`
- **Opcional**: Para endpoints `GET` (algunos pueden requerir auth)

## 🔧 Comandos de Desarrollo

### Setup Inicial (PowerShell)
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

### Testing y Calidad
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

## 🏗️ Configuración de Build

### pyproject.toml - Secciones Clave
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