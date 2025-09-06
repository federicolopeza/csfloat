import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

function walkTsFiles(dir: string, out: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue
      walkTsFiles(join(dir, e.name), out)
    } else if (/(\.ts|\.tsx)$/.test(e.name)) {
      out.push(join(dir, e.name))
    }
  }
  return out
}

describe('Frontend guardrails (no demo data, no direct API from browser)', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const srcDir = join(here, '..') // .../src
  const files = walkTsFiles(srcDir)

  it('does not import demo-data anywhere in src/', () => {
    const offenders: string[] = []
    const re = /import\s+[^;]*from\s+['\"][^'\"]*demo-data[^'\"]*['\"]/g
    for (const f of files) {
      const txt = readFileSync(f, 'utf-8')
      if (re.test(txt)) offenders.push(f)
    }
    expect(offenders, `Found imports of demo-data in: \n${offenders.join('\n')}`).toEqual([])
  })

  it('never calls fetch() directly to https://csfloat.com from client code', () => {
    const offenders: string[] = []
    const re = /fetch\s*\(\s*[`'\"]https?:\/\/csfloat\.com/gi
    for (const f of files) {
      const txt = readFileSync(f, 'utf-8')
      if (re.test(txt)) offenders.push(f)
    }
    expect(offenders, `Found direct fetch() to csfloat.com in: \n${offenders.join('\n')}`).toEqual([])
  })

  it('does not set Authorization headers in browser code (must be proxy-only)', () => {
    const offenders: string[] = []
    const re = /authorization/i
    for (const f of files) {
      const txt = readFileSync(f, 'utf-8')
      if (re.test(txt)) offenders.push(f)
    }
    expect(offenders, `Found Authorization header usage in: \n${offenders.join('\n')}`).toEqual([])
  })

  it('API client uses the local proxy endpoints', () => {
    const clientPath = join(srcDir, 'lib', 'api', 'csfloat.ts')
    const txt = readFileSync(clientPath, 'utf-8')
    expect(txt.includes('/proxy/listings')).toBe(true)
  })
})
