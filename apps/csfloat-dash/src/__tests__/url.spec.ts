import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Listing, Item, Seller } from '../lib/models/types'
import { getCsfloatPublicUrl } from '../lib/utils/url'

function mkItem(overrides: Partial<Item> = {}): Item {
  return {
    id: overrides.id,
    float_value: overrides.float_value ?? 0.123456,
    paint_seed: overrides.paint_seed ?? 123,
    paint_index: overrides.paint_index ?? 44,
    def_index: overrides.def_index ?? 1234,
    market_hash_name: overrides.market_hash_name ?? 'AK-47 | Redline (Field-Tested)',
    wear_name: overrides.wear_name ?? 'Field-Tested',
    collection: overrides.collection,
    inspect_link: overrides.inspect_link ?? 'steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S12345A1234567890D1234567890',
    stickers: overrides.stickers,
  }
}

function mkSeller(overrides: Partial<Seller> = {}): Seller {
  return {
    steam_id: overrides.steam_id ?? '123456',
    username: overrides.username ?? 'seller',
    statistics: overrides.statistics,
  }
}

function mkListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: overrides.id ?? 'listing-1',
    price: overrides.price ?? 10000,
    state: overrides.state ?? 'active',
    type: overrides.type ?? 'buy_now',
    created_at: overrides.created_at ?? new Date().toISOString(),
    seller: overrides.seller ?? mkSeller(),
    item: overrides.item ?? mkItem(),
    watchers: overrides.watchers ?? 0,
    min_offer_price: overrides.min_offer_price,
    max_offer_discount: overrides.max_offer_discount,
  }
}

describe('getCsfloatPublicUrl', () => {
  it('devuelve permalink /item/<listing.id>', () => {
    const listing = mkListing({ id: 'LISTING-123', item: mkItem({ id: 'ITEM123' }) })
    const url = getCsfloatPublicUrl(listing)
    expect(url).toBe('https://csfloat.com/item/LISTING-123')
  })
})

describe('resolveCsfloatPublicUrl', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('devuelve /item/<listing.id> directamente sin consultar detalle', async () => {
    const { resolveCsfloatPublicUrlWith } = await import('../lib/utils/url')
    const listing = mkListing({ id: 'LISTING-123', item: mkItem({ id: undefined }) })
    let called = 0
    const url = await resolveCsfloatPublicUrlWith(listing, async (_id: string) => {
      called++
      return mkListing({ item: mkItem({ id: 'DETAIL-ID-999' }) })
    })
    expect(url).toBe('https://csfloat.com/item/LISTING-123')
    expect(called).toBe(0)
  })
})
