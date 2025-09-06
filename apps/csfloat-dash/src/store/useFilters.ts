import { create } from 'zustand'
import { z } from 'zod'
import type { ListingsParams, SortOption } from '../lib/models/types'
import { parseSmartSearch } from '../lib/search/smartSearch'

const stickersRegex = /^\s*\d+\|\d+(\s*,\s*\d+\|\d+)*\s*$/

const schema = z.object({
  limit: z.number().int().positive().max(50).default(50),
  min_float: z.number().min(0).max(1).optional(),
  max_float: z.number().min(0).max(1).optional(),
  min_price: z.number().int().min(0).optional(),
  max_price: z.number().int().min(0).optional(),
  paint_seed: z.number().int().min(0).optional(),
  paint_index: z.number().int().min(0).optional(),
  category: z.number().int().min(0).max(3).optional(),
  def_index: z.union([z.number().int(), z.array(z.number().int())]).optional(),
  sort_by: z.custom<SortOption>(),
  type: z.union([z.literal('buy_now'), z.literal('auction')]).optional(),
  user_id: z.string().optional(),
  market_hash_name: z.string().optional(),
  collection: z.string().optional(),
  rarity: z.string().optional(),
  stickers: z
    .string()
    .regex(stickersRegex, { message: 'Formato inválido. Use ID|POS[,ID|POS]' })
    .optional(),
  q: z.string().optional(),
})

type FiltersState = ListingsParams & {
  appliedAt: number
  errors: Record<string, string>
  setSortBy: (s: SortOption) => void
  setMarketHashName: (v: string) => void
  setLimit: (n: number) => void
  patch: (p: Partial<ListingsParams>) => void
  reset: () => void
  apply: () => void
  getParams: () => ListingsParams
}

type FiltersData = ListingsParams & { appliedAt: number; errors: Record<string, string> }

const initialData: FiltersData = {
  limit: 50,
  sort_by: 'most_recent',
  appliedAt: 0,
  errors: {},
}

export const useFilters = create<FiltersState>((set, get) => ({
  ...initialData,
  setSortBy: (s) => set({ sort_by: s }),
  setMarketHashName: (v) => {
    const term = (v ?? '').trim()
    const parsed = parseSmartSearch(term)
    const patch: Partial<FiltersState> = {}
    if (parsed.exactName) {
      patch.market_hash_name = term || undefined
      patch.q = undefined
    } else {
      patch.market_hash_name = undefined
      patch.q = parsed.q || undefined
    }
    // Apply derived numeric/category filters from smart search if present
    if (parsed.derived.min_float !== undefined) patch.min_float = parsed.derived.min_float
    if (parsed.derived.max_float !== undefined) patch.max_float = parsed.derived.max_float
    if (parsed.derived.category !== undefined) patch.category = parsed.derived.category
    set(patch as Partial<FiltersState>)
  },
  setLimit: (n) => set({ limit: Math.min(50, Math.max(1, Math.floor(n))) }),
  patch: (p) => set(p as Partial<FiltersState>),
  reset: () => set((state) => ({ ...state, ...initialData, appliedAt: Date.now() })),
  apply: () => {
    const state = get()
    const { success, error, data } = schema.safeParse(state)
    if (!success) {
      const errs: Record<string, string> = {}
      error.errors.forEach((e) => {
        const path = e.path.join('.') || 'root'
        errs[path] = e.message
      })
      set({ errors: errs })
      return
    }
    set({ errors: {}, ...data, appliedAt: Date.now() })
  },
  getParams: () => {
    const s = get()
    const {
      cursor,
      limit,
      sort_by,
      category,
      def_index,
      min_float,
      max_float,
      rarity,
      paint_seed,
      paint_index,
      user_id,
      collection,
      min_price,
      max_price,
      market_hash_name,
      type,
      stickers,
      q,
    } = s
    return {
      cursor,
      limit,
      sort_by,
      category,
      def_index,
      min_float,
      max_float,
      rarity,
      paint_seed,
      paint_index,
      user_id,
      collection,
      min_price,
      max_price,
      market_hash_name,
      type,
      stickers,
      q,
    }
  },
}))
