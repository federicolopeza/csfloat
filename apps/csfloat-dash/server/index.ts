import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import type { Context, Next } from 'hono'

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
  if (xf) return xf.split(',')[0].trim()
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
  return c.newResponse(body, res.status, outHeaders)
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
  return c.newResponse(body, res.status, outHeaders)
})

serve({ fetch: app.fetch, port: PORT }, (info: { port: number }) => {
  jsonLog({ msg: 'proxy_started', port: info.port, base: CSFLOAT_BASE, hasAuth: !!API_KEY })
})
