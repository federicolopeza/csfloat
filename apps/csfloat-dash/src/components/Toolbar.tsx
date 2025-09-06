import React, { useEffect, useMemo, useState } from 'react'
import { Search, Filter, SortAsc, Zap, TrendingUp, Clock, DollarSign, Star } from 'lucide-react'
import type { SortOption } from '../lib/models/types'
import { useFilters } from '../store/useFilters'
import { useCollectionsMeta } from '../lib/api/meta'

interface ToolbarProps {
  onQuickSearch: (term: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  onToggleFilters: () => void
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'lowest_price', label: 'Lowest Price', icon: <DollarSign size={16} /> },
  { value: 'highest_price', label: 'Highest Price', icon: <TrendingUp size={16} /> },
  { value: 'most_recent', label: 'Most Recent', icon: <Clock size={16} /> },
  { value: 'expires_soon', label: 'Expires Soon', icon: <Zap size={16} /> },
  { value: 'lowest_float', label: 'Lowest Float', icon: <Star size={16} /> },
  { value: 'highest_float', label: 'Highest Float', icon: <Star size={16} /> },
  { value: 'best_deal', label: 'Best Deal', icon: <TrendingUp size={16} /> },
  { value: 'highest_discount', label: 'Highest Discount', icon: <DollarSign size={16} /> },
  { value: 'float_rank', label: 'Float Rank', icon: <Star size={16} /> },
  { value: 'num_bids', label: 'Most Bids', icon: <TrendingUp size={16} /> },
]

export default function Toolbar(props: ToolbarProps) {
  const { sortBy, onSortChange, onQuickSearch, onToggleFilters } = props
  const f = useFilters()
  const collectionsMeta = useCollectionsMeta('', 1000)
  const [searchValue, setSearchValue] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  // Local filter UI state (manual apply)
  const [minPriceUsd, setMinPriceUsd] = useState<string>(f.min_price !== undefined ? (f.min_price / 100).toString() : '')
  const [maxPriceUsd, setMaxPriceUsd] = useState<string>(f.max_price !== undefined ? (f.max_price / 100).toString() : '')
  const [minFloat, setMinFloat] = useState<string>(f.min_float !== undefined ? String(f.min_float) : '')
  const [maxFloat, setMaxFloat] = useState<string>(f.max_float !== undefined ? String(f.max_float) : '')
  const [paintSeed, setPaintSeed] = useState<string>(f.paint_seed !== undefined ? String(f.paint_seed) : '')
  const [paintIndex, setPaintIndex] = useState<string>(f.paint_index !== undefined ? String(f.paint_index) : '')
  const [collection, setCollection] = useState<string>(f.collection ?? '')
  const [stickers, setStickers] = useState<string>(f.stickers ?? '')

  useEffect(() => { setMinPriceUsd(f.min_price !== undefined ? (f.min_price / 100).toString() : '') }, [f.min_price])
  useEffect(() => { setMaxPriceUsd(f.max_price !== undefined ? (f.max_price / 100).toString() : '') }, [f.max_price])
  useEffect(() => { setMinFloat(f.min_float !== undefined ? String(f.min_float) : '') }, [f.min_float])
  useEffect(() => { setMaxFloat(f.max_float !== undefined ? String(f.max_float) : '') }, [f.max_float])
  useEffect(() => { setPaintSeed(f.paint_seed !== undefined ? String(f.paint_seed) : '') }, [f.paint_seed])
  useEffect(() => { setPaintIndex(f.paint_index !== undefined ? String(f.paint_index) : '') }, [f.paint_index])
  useEffect(() => { setCollection(f.collection ?? '') }, [f.collection])
  useEffect(() => { setStickers(f.stickers ?? '') }, [f.stickers])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  // Debounce search to reduce API calls
  useEffect(() => {
    const v = searchValue.trim()
    const t = setTimeout(() => {
      onQuickSearch(v)
    }, 400)
    return () => clearTimeout(t)
  }, [searchValue])

  const currentSort = sortOptions.find(option => option.value === sortBy)

  // Popover handling (desktop only)
  type Pop = 'price' | 'float' | 'pattern' | 'collection' | 'stickers' | null
  const [open, setOpen] = useState<Pop>(null)

  // Helpers
  const usdToCents = (usd: number) => Math.max(0, Math.round(usd * 100))
  const parseUsd = (s: string) => {
    const t = (s ?? '').trim()
    if (!t) return undefined
    const n = Number(t.replace(/\$/g, '').replace(',', '.'))
    if (!Number.isFinite(n)) return undefined
    return usdToCents(n)
  }
  const parseFloat01 = (s: string) => {
    const t = (s ?? '').trim()
    if (!t) return undefined
    const n = Number(t)
    if (!Number.isFinite(n)) return undefined
    return Math.min(1, Math.max(0, n))
  }
  const parseIntOpt = (s: string) => {
    const t = (s ?? '').trim()
    if (!t) return undefined
    const n = Number(t)
    if (!Number.isFinite(n)) return undefined
    return Math.max(0, Math.floor(n))
  }

  const applyAll = () => {
    f.patch({
      min_price: parseUsd(minPriceUsd),
      max_price: parseUsd(maxPriceUsd),
      min_float: parseFloat01(minFloat),
      max_float: parseFloat01(maxFloat),
      paint_seed: parseIntOpt(paintSeed),
      paint_index: parseIntOpt(paintIndex),
      collection: collection || undefined,
      stickers: stickers || undefined,
    })
    f.apply()
    setOpen(null)
  }

  const resetAll = () => {
    setMinPriceUsd('')
    setMaxPriceUsd('')
    setMinFloat('')
    setMaxFloat('')
    setPaintSeed('')
    setPaintIndex('')
    setCollection('')
    setStickers('')
    f.reset()
    setOpen(null)
  }

  return (
    <div className="surface-1 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            CSFloat Market
          </h1>
          <p className="text-muted-foreground mt-1">Discover and explore CS2 skins</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-info flex items-center gap-2">
            <div className="w-2 h-2 bg-info rounded-full animate-pulse"></div>
            Live Market
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" size={20} />
            <input
              type="text"
              placeholder="Search by weapon name (e.g., AK-47 | Redline)..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onQuickSearch(searchValue.trim())
                }
              }}
              className="input w-full pl-12 pr-4 py-4 text-lg"
            />
            {searchValue && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="input pl-12 pr-8 py-4 min-w-[200px] appearance-none cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface-1">
                {option.label}
              </option>
            ))}
          </select>
          <SortAsc className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop filter chips row */}
      <div className="hidden lg:flex items-center gap-2 mt-4 flex-wrap">
        {/* Price */}
        <div className="relative">
          <button onClick={() => setOpen(open === 'price' ? null : 'price')} className={`px-3 py-2 rounded-lg border ${f.min_price !== undefined || f.max_price !== undefined ? 'bg-primary text-primary-foreground border-transparent' : 'bg-surface-2 text-foreground border-border'}`}>
            <span className="inline-flex items-center gap-2"><DollarSign size={16} /> Price</span>
          </button>
          {open === 'price' && (
            <div className="absolute z-20 mt-2 w-80 card p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Min (USD)</label>
                  <input type="number" step="0.01" className="input w-full py-2" value={minPriceUsd} onChange={(e) => setMinPriceUsd(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Max (USD)</label>
                  <input type="number" step="0.01" className="input w-full py-2" value={maxPriceUsd} onChange={(e) => setMaxPriceUsd(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Float */}
        <div className="relative">
          <button onClick={() => setOpen(open === 'float' ? null : 'float')} className={`px-3 py-2 rounded-lg border ${f.min_float !== undefined || f.max_float !== undefined ? 'bg-primary text-primary-foreground border-transparent' : 'bg-surface-2 text-foreground border-border'}`}>
            <span className="inline-flex items-center gap-2"><Star size={16} /> Float</span>
          </button>
          {open === 'float' && (
            <div className="absolute z-20 mt-2 w-80 card p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Min</label>
                  <input type="number" step="0.0001" min={0} max={1} className="input w-full py-2 font-mono" value={minFloat} onChange={(e) => setMinFloat(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Max</label>
                  <input type="number" step="0.0001" min={0} max={1} className="input w-full py-2 font-mono" value={maxFloat} onChange={(e) => setMaxFloat(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pattern & Seed */}
        <div className="relative">
          <button onClick={() => setOpen(open === 'pattern' ? null : 'pattern')} className={`px-3 py-2 rounded-lg border ${f.paint_seed !== undefined || f.paint_index !== undefined ? 'bg-primary text-primary-foreground border-transparent' : 'bg-surface-2 text-foreground border-border'}`}>
            <span className="inline-flex items-center gap-2"><Filter size={16} /> Pattern</span>
          </button>
          {open === 'pattern' && (
            <div className="absolute z-20 mt-2 w-80 card p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Paint Seed</label>
                  <input inputMode="numeric" pattern="[0-9]*" className="input w-full py-2 font-mono" value={paintSeed} onChange={(e) => setPaintSeed(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Paint Index</label>
                  <input inputMode="numeric" pattern="[0-9]*" className="input w-full py-2 font-mono" value={paintIndex} onChange={(e) => setPaintIndex(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collection */}
        <div className="relative">
          <button onClick={() => setOpen(open === 'collection' ? null : 'collection')} className={`px-3 py-2 rounded-lg border ${f.collection ? 'bg-primary text-primary-foreground border-transparent' : 'bg-surface-2 text-foreground border-border'}`}>
            <span className="inline-flex items-center gap-2"><Star size={16} /> Collection</span>
          </button>
          {open === 'collection' && (
            <div className="absolute z-20 mt-2 w-96 card p-4">
              <label className="block text-xs text-muted-foreground mb-2">Select collection</label>
              {collectionsMeta.isLoading && (
                <div className="text-sm text-muted-foreground">Loading collections…</div>
              )}
              {collectionsMeta.error && (
                <div className="text-sm text-danger">Failed to load collections</div>
              )}
              {collectionsMeta.data && (
                <select
                  className="input w-full py-2"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  {collectionsMeta.data.data.map((c) => (
                    <option key={c.id} value={c.api_id || c.id}>
                      {c.name ?? c.id}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Stickers */}
        <div className="relative">
          <button onClick={() => setOpen(open === 'stickers' ? null : 'stickers')} className={`px-3 py-2 rounded-lg border ${f.stickers ? 'bg-primary text-primary-foreground border-transparent' : 'bg-surface-2 text-foreground border-border'}`}>
            <span className="inline-flex items-center gap-2"><Star size={16} /> Stickers</span>
          </button>
          {open === 'stickers' && (
            <div className="absolute z-20 mt-2 w-[28rem] card p-4">
              <label className="block text-xs text-muted-foreground mb-1">Sticker IDs</label>
              <input className="input w-full py-2 font-mono" value={stickers} onChange={(e) => setStickers(e.target.value)} placeholder="ID|POSITION,ID|POSITION" />
              {f.errors['stickers'] && (
                <p className="text-xs text-danger mt-2">{f.errors['stickers']}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={applyAll} className="btn-primary rounded-xl py-2.5 px-5 font-semibold">Apply Filters</button>
          <button onClick={resetAll} className="btn-subtle rounded-xl py-2 px-4">Reset All</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Real-time pricing</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>Advanced filtering</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-info rounded-full"></div>
          <span>Market insights</span>
        </div>
      </div>
    </div>
  )
}
