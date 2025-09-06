import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import type { Context, Next } from 'hono'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const app = new Hono()

const PORT = Number(process.env.PORT || 8787)
const CSFLOAT_BASE = process.env.CSFLOAT_BASE || 'https://csfloat.com'
const API_KEY = process.env.CSFLOAT_API_KEY

function jsonLog(obj: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...obj }))
}

// Request logging
app.use('*', async (c: Context, next: Next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  jsonLog({ method: c.req.method, path: c.req.path, status: c.res.status, ms })
})

app.get('/health', (c: Context) => c.json({ ok: true }))

// Basic per-IP fixed-window rate limiting
const RATE_LIMIT = Number(process.env.RATE_LIMIT ?? 60)
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS ?? 60_000)
type Counter = { count: number; windowStart: number }
const rateCounters = new Map<string, Counter>()

function clientKey(c: Context): string {
  const xf = c.req.header('x-forwarded-for')
  if (xf) {
    const first = xf.split(',')[0] ?? ''
    const trimmed = first.trim()
    if (trimmed) return trimmed
  }
  const xr = c.req.header('x-real-ip')
  if (xr) return xr
  return 'local'
}

app.use('/proxy/*', async (c: Context, next: Next) => {
  const key = clientKey(c)
  const now = Date.now()
  const entry = rateCounters.get(key) ?? { count: 0, windowStart: now }
  if (now - entry.windowStart >= RATE_WINDOW_MS) {
    entry.count = 0
    entry.windowStart = now
  }
  if (entry.count >= RATE_LIMIT) {
    const retrySec = Math.ceil((entry.windowStart + RATE_WINDOW_MS - now) / 1000)
    return c.json({ error: 'too_many_requests' }, 429, { 'retry-after': String(retrySec) })
  }
  entry.count++
  rateCounters.set(key, entry)
  await next()
})

async function fetchWithBackoff(url: string, init: RequestInit) {
  const delays = [500, 1000, 2000, 4000]
  let lastErr: any

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const res = await fetch(url, init)
    if (res.ok) return res
    const retryAfter = Number(res.headers.get('retry-after') || 0) * 1000
    if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
      const baseDelay = attempt < delays.length ? delays[attempt]! : 0
      const delay = Math.max(baseDelay, retryAfter || 0)
      if (delay > 0) await new Promise((r) => setTimeout(r, delay))
      lastErr = res
      if (attempt < delays.length) continue
    }
    return res
  }
  return lastErr as Response
}

app.get('/proxy/listings', async (c: Context) => {
  const url = new URL('/api/v1/listings', CSFLOAT_BASE)
  url.search = c.req.url.split('?')[1] ?? ''

  // If 'collection' is a friendly name (e.g., 'the_gamma_collection' or 'The Gamma Collection'),
  // rewrite it to the API id form expected by CSFloat (e.g., 'set_gamma').
  const rawSearch = c.req.url.includes('?') ? c.req.url.split('?')[1]! : ''
  const params = new URLSearchParams(rawSearch)
  const incomingCollection = params.get('collection')
  if (incomingCollection && !incomingCollection.startsWith('set_')) {
    const normalize = normalizeKey
    const guessApiCollectionId = (v: string): string => {
      let s = v.trim()
      try { s = decodeURIComponent(s) } catch {}
      s = s.toLowerCase()
      s = s.replace(/\s+/g, ' ')
      s = s.replace(/^the\s+/, '')
      s = s.replace(/\s+collection$/, '')
      s = s.replace(/&/g, 'and')
      s = s.replace(/[^a-z0-9]+/g, '_')
      s = s.replace(/^_+|_+$/g, '')
      // common variants like "the_gamma_collection" already underscored
      s = s.replace(/^the_/, '')
      s = s.replace(/_collection$/, '')
      return `set_${s}`
    }
    // Try static mapping via index first (covers id, name, with/without 'the'/'collection')
    const incomingNorm = stripArticlesAndSuffixes(normalize(incomingCollection))
    const mapped = staticIndex.get(incomingNorm)
    if (mapped) {
      params.set('collection', mapped)
      url.search = params.toString()
      jsonLog({ msg: 'collection_rewrite_static', from: incomingCollection, to: mapped })
    } else {
      const rewritten = guessApiCollectionId(incomingCollection)
      params.set('collection', rewritten)
      url.search = params.toString()
      jsonLog({ msg: 'collection_rewrite_heuristic', from: incomingCollection, to: rewritten })
    }
  }

  const headers: Record<string, string> = {
    accept: 'application/json',
  }
  if (API_KEY) headers['authorization'] = API_KEY

  const res = await fetchWithBackoff(url.toString(), { headers })
  const body = await res.text()
  const outHeaders: Record<string, string> = {
    'content-type': 'application/json',
  }
  const ra = res.headers.get('retry-after')
  if (ra) outHeaders['retry-after'] = ra
  // Forward pagination cursor for client-side infinite queries
  const cursor =
    res.headers.get('x-next-cursor') ||
    res.headers.get('next-cursor') ||
    res.headers.get('x_next_cursor')
  if (cursor) outHeaders['x-next-cursor'] = cursor
  // Normalize body to { data, cursor }
  let outBody = body
  try {
    const parsed = JSON.parse(body)
    const extract = (obj: any): any[] | undefined => {
      if (Array.isArray(obj)) return obj
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj.data)) return obj.data
        if (obj.data && typeof obj.data === 'object') {
          for (const k of ['listings', 'items', 'results']) if (Array.isArray((obj.data as any)[k])) return (obj.data as any)[k]
        }
        for (const k of ['listings', 'items', 'results']) if (Array.isArray((obj as any)[k])) return (obj as any)[k]
      }
      return undefined
    }
    const arr = extract(parsed)
    jsonLog({ msg: 'proxy_listings_response', items: Array.isArray(arr) ? arr.length : undefined, qs: url.search })
    outBody = JSON.stringify({ data: Array.isArray(arr) ? arr : [], cursor: cursor || undefined })
  } catch {
    // fallback: keep original text
  }
  // Cast res.status to any to satisfy Hono's StatusCode type
  const response = c.newResponse(outBody, res.status as any, outHeaders)
  if (res.status >= 400 && res.status < 600 && !incomingCollection) {
    jsonLog({ msg: 'no_rewrite_4xx_5xx', status: res.status, qs: url.search })
  }
  return response
})

app.get('/proxy/listings/:id', async (c: Context) => {
  const id = c.req.param('id')
  const url = new URL(`/api/v1/listings/${encodeURIComponent(id)}`, CSFLOAT_BASE)

  const headers: Record<string, string> = {
    accept: 'application/json',
  }
  if (API_KEY) headers['authorization'] = API_KEY

  const res = await fetchWithBackoff(url.toString(), { headers })
  const body = await res.text()
  const outHeaders: Record<string, string> = {
    'content-type': res.headers.get('content-type') ?? 'application/json',
  }
  const ra = res.headers.get('retry-after')
  if (ra) outHeaders['retry-after'] = ra
  const cursor =
    res.headers.get('x-next-cursor') ||
    res.headers.get('next-cursor') ||
    res.headers.get('x_next_cursor')
  if (cursor) outHeaders['x-next-cursor'] = cursor
  return c.newResponse(body, res.status as any, outHeaders)
})

// --- Meta endpoints (aggregations) ---
type CollectionsCache = {
  data: { id: string; name?: string; api_id?: string; count?: number }[]
  expiresAt: number
}

const META_TTL_MS = 10 * 60 * 1000 // 10 minutes
let collectionsCache: CollectionsCache | null = null

// Load static collections (complete catalog)
let staticCollections: { id: string; name?: string; api_id?: string }[] = []
try {
  const url = new URL('./data/collections.json', import.meta.url)
  const txt = readFileSync(fileURLToPath(url), 'utf-8')
  const parsed = JSON.parse(txt)
  if (Array.isArray(parsed)) staticCollections = parsed
} catch {
  // ignore if file not found; endpoint will still work via sampling
}

// Build an index from normalized keys -> api_id for fast and robust lookup
function normalizeKey(v: string): string {
  let s = v.trim()
  try { s = decodeURIComponent(s) } catch {}
  s = s.toLowerCase()
  s = s.replace(/&/g, 'and')
  s = s.replace(/[^a-z0-9]+/g, '_')
  s = s.replace(/^_+|_+$/g, '')
  return s
}

function stripArticlesAndSuffixes(s: string): string {
  s = s.replace(/^the_/, '')
  s = s.replace(/_collection$/, '')
  return s
}

const staticIndex = new Map<string, string>() // key -> api_id
for (const sc of staticCollections) {
  if (!sc.api_id) continue
  const keys = new Set<string>()
  const idNorm = normalizeKey(sc.id)
  const nameNorm = sc.name ? normalizeKey(sc.name) : idNorm
  keys.add(idNorm)
  keys.add(nameNorm)
  keys.add(stripArticlesAndSuffixes(idNorm))
  keys.add(stripArticlesAndSuffixes(nameNorm))
  for (const k of keys) if (k) staticIndex.set(k, sc.api_id)
}

async function fetchListingsPage(url: URL, cursor?: string) {
  if (cursor) url.searchParams.set('cursor', cursor)
  url.searchParams.set('limit', '50')
  const headers: Record<string, string> = { accept: 'application/json' }
  if (API_KEY) headers['authorization'] = API_KEY
  const res = await fetchWithBackoff(url.toString(), { headers })
  const text = await res.text()
  let items: any[] = []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) items = parsed
    else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.data)) items = parsed.data
      else if (parsed.data && typeof parsed.data === 'object') {
        for (const k of ['listings', 'items', 'results']) {
          const v = (parsed.data as any)[k]
          if (Array.isArray(v)) { items = v; break }
        }
      } else {
        for (const k of ['listings', 'items', 'results']) {
          const v = (parsed as any)[k]
          if (Array.isArray(v)) { items = v; break }
        }
      }
    }
  } catch {
    // ignore
  }
  // cursor from headers
  const nextCursor = res.headers.get('x-next-cursor') || res.headers.get('next-cursor') || res.headers.get('x_next_cursor') || undefined
  return { items, nextCursor }
}

app.get('/proxy/meta/collections', async (c: Context) => {
  // serve from cache if warm
  const now = Date.now()
  if (collectionsCache && collectionsCache.expiresAt > now) {
    const q = (c.req.query('q') || '').toLowerCase().trim()
    const limit = Number(c.req.query('limit') || 50)
    const filtered = q
      ? collectionsCache.data.filter((x) => (x.name ?? x.id).toLowerCase().includes(q) || x.id.toLowerCase().includes(q))
      : collectionsCache.data
    return c.json({ data: filtered.slice(0, Math.max(1, Math.min(200, limit))), fetched_at: collectionsCache.expiresAt - META_TTL_MS, ttl_ms: Math.max(0, collectionsCache.expiresAt - now) })
  }

  // build aggregation by sampling listings
  const url = new URL('/api/v1/listings', CSFLOAT_BASE)
  let cursor: string | undefined = undefined
  const counts = new Map<string, number>() // key by collection name as appears in listings
  let pages = 0
  const MAX_PAGES = 30
  const MAX_ITEMS = 2500
  let total = 0
  while (pages < MAX_PAGES && total < MAX_ITEMS) {
    const { items, nextCursor } = await fetchListingsPage(new URL(url), cursor)
    for (const it of items) {
      const col = it?.item?.collection
      if (typeof col === 'string' && col.trim()) {
        counts.set(col, (counts.get(col) ?? 0) + 1)
      }
    }
    total += items.length
    pages += 1
    if (!nextCursor || !items.length) break
    cursor = nextCursor
  }
  // Merge static catalog with dynamic counts by matching on name
  const dynamicByName = counts
  const merged: { id: string; name?: string; api_id?: string; count?: number }[] = []
  // Prefer full static list for completeness
  for (const sc of staticCollections) {
    const name = sc.name ?? sc.id
    const count = dynamicByName.get(name)
    merged.push({ id: sc.id, name, api_id: sc.api_id, count })
  }
  // Also include any dynamic names we don't have ids for (append with id=name)
  for (const [name, count] of dynamicByName.entries()) {
    if (!merged.some((m) => (m.name ?? m.id) === name)) {
      merged.push({ id: name, name, count })
    }
  }
  collectionsCache = { data: merged, expiresAt: Date.now() + META_TTL_MS }

  const q = (c.req.query('q') || '').toLowerCase().trim()
  const limit = Number(c.req.query('limit') || 50)
  const filtered = q
    ? collectionsCache.data.filter((x) => (x.name ?? x.id).toLowerCase().includes(q) || x.id.toLowerCase().includes(q))
    : collectionsCache.data
  return c.json({ data: filtered.slice(0, Math.max(1, Math.min(200, limit))), fetched_at: Date.now(), ttl_ms: META_TTL_MS })
})

serve({ fetch: app.fetch, port: PORT }, (info: { port: number }) => {
  jsonLog({ msg: 'proxy_started', port: info.port, base: CSFLOAT_BASE, hasAuth: !!API_KEY })
})
