# CSFloat Search Dashboard (React + Vite + Tailwind)

SPA para explorar listados de CS2 usando la API pública de CSFloat. Incluye proxy Node que inyecta `Authorization` del lado servidor y soporta paginación por cursor con TanStack Query.

## Requisitos

- Node.js 18+
- pnpm 8+

## Setup rápido

```powershell
# Desde la raíz del repo
# 1) Instalar dependencias
pnpm install --prefix apps/csfloat-dash

# 2) Copiar variables de entorno
copy apps/csfloat-dash/.env.example apps/csfloat-dash/.env
# Editar apps/csfloat-dash/.env y completar CSFLOAT_API_KEY (opcional para GET /listings)

# 3) Levantar entorno local (proxy :8787 + Vite :5173)
pnpm --dir apps/csfloat-dash dev
```

- Frontend hace requests a `/proxy/*` y Vite redirige al server en `:8787`.
- El proxy reintenta con backoff para 429/5xx y loguea en JSON { método, ruta, status, latencia }.

## Scripts

- `pnpm dev` → levanta Proxy y Web en paralelo
- `pnpm dev:proxy` → solo proxy (Hono)
- `pnpm dev:web` → solo frontend (Vite)
- `pnpm build` → build de producción del frontend

## Estructura

```
apps/csfloat-dash/
├── server/index.ts                 # Proxy Hono con backoff y logs
├── src/
│   ├── lib/api/{csfloat,buildQuery}.ts
│   ├── lib/models/types.ts
│   ├── store/{useFilters,useListings}.ts
│   ├── components/{FiltersPanel,Toolbar,ListingCard,ListingsGrid}.tsx
│   └── pages/Home.tsx
├── tailwind.config.ts / postcss.config.cjs / src/index.css
├── vite.config.ts / tsconfig.json / package.json
└── .env.example / README.md / .gitignore
```

## Notas de seguridad

- La API key nunca llega al cliente; si está definida en `.env`, el proxy agrega `Authorization`.
- No subir `.env` ni secretos al repo. `.env` ya está git-ignored.

## Próximos pasos

- Completar `FiltersPanel` con TODOS los parámetros (min/max_float, category, def_index[], stickers, etc.) y validaciones Zod.
- Tests: unit (buildQuery, formateos), integración (proxy), e2e (Playwright).
- Mejoras de UI/UX y a11y.
