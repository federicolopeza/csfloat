import React, { useEffect, useMemo, useState } from 'react'
import { 
  Search, 
  DollarSign, 
  Sparkles, 
  Palette, 
  Tag, 
  RotateCcw, 
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  Star,
  Target
} from 'lucide-react'
import { useFilters } from '../store/useFilters'

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
}

function FilterSection({ title, icon, children, defaultExpanded = true }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="surface-1 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 animate-slide-up">
          {children}
        </div>
      )}
    </div>
  )
}

function QuickFilterChip({ 
  label, 
  onClick, 
  active = false 
}: { 
  label: string
  onClick: () => void
  active?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-foreground border border-border'
      }`}
    >
      {label}
    </button>
  )
}

export default function FiltersPanel() {
  const f = useFilters()
  const [market, setMarket] = useState(f.market_hash_name ?? '')
  // Show prices in USD (decimals) in the UI; store converts to cents when applying
  const [minPrice, setMinPrice] = useState<string>(
    f.min_price !== undefined ? (f.min_price / 100).toString() : ''
  )
  const [maxPrice, setMaxPrice] = useState<string>(
    f.max_price !== undefined ? (f.max_price / 100).toString() : ''
  )
  const [minFloat, setMinFloat] = useState<string>(
    f.min_float !== undefined ? String(f.min_float) : ''
  )
  const [maxFloat, setMaxFloat] = useState<string>(
    f.max_float !== undefined ? String(f.max_float) : ''
  )
  const [paintSeed, setPaintSeed] = useState<string>(
    f.paint_seed !== undefined ? String(f.paint_seed) : ''
  )
  const [paintIndex, setPaintIndex] = useState<string>(
    f.paint_index !== undefined ? String(f.paint_index) : ''
  )
  const [collection, setCollection] = useState<string>(f.collection ?? '')
  const [stickers, setStickers] = useState<string>(f.stickers ?? '')
  // New filters
  const [category, setCategory] = useState<number | undefined>(f.category)
  const [typeVal, setTypeVal] = useState<"buy_now" | "auction" | ''>(f.type ?? '')
  const [rarity, setRarity] = useState<string>(f.rarity ?? '')
  const [defIndexInput, setDefIndexInput] = useState<string>(
    Array.isArray(f.def_index)
      ? f.def_index.join(',')
      : f.def_index !== undefined
      ? String(f.def_index)
      : ''
  )
  const [userId, setUserId] = useState<string>(f.user_id ?? '')
  const [imageOnly, setImageOnly] = useState<boolean>(!!f.has_image_only)

  // Keep local market input in sync with global store when it changes from Toolbar
  useEffect(() => {
    setMarket(f.market_hash_name ?? '')
  }, [f.market_hash_name])

  // Keep local USD price inputs in sync with store cents values
  useEffect(() => {
    setMinPrice(f.min_price !== undefined ? (f.min_price / 100).toString() : '')
  }, [f.min_price])
  useEffect(() => {
    setMaxPrice(f.max_price !== undefined ? (f.max_price / 100).toString() : '')
  }, [f.max_price])
  // Sync new filters
  useEffect(() => { setCategory(f.category) }, [f.category])
  useEffect(() => { setTypeVal(f.type ?? '') }, [f.type])
  useEffect(() => { setRarity(f.rarity ?? '') }, [f.rarity])
  useEffect(() => {
    const di = Array.isArray(f.def_index)
      ? f.def_index.join(',')
      : f.def_index !== undefined
      ? String(f.def_index)
      : ''
    setDefIndexInput(di)
  }, [f.def_index])
  useEffect(() => { setUserId(f.user_id ?? '') }, [f.user_id])
  useEffect(() => { setImageOnly(!!f.has_image_only) }, [f.has_image_only])

  const wearOptions = useMemo(
    () => [
      { key: 'FN', label: 'Factory New', min: 0.0, max: 0.07, color: 'emerald' },
      { key: 'MW', label: 'Minimal Wear', min: 0.07, max: 0.15, color: 'blue' },
      { key: 'FT', label: 'Field-Tested', min: 0.15, max: 0.38, color: 'yellow' },
      { key: 'WW', label: 'Well-Worn', min: 0.38, max: 0.45, color: 'orange' },
      { key: 'BS', label: 'Battle-Scarred', min: 0.45, max: 1.0, color: 'red' },
    ],
    []
  )

  const isWearActive = (wear: { min: number; max: number }) =>
    (minFloat?.trim() || '') === String(wear.min) && (maxFloat?.trim() || '') === String(wear.max)

  // Rarity options (API expects an integer code). Nota: estos códigos pueden variar por API.
  // Si detectamos divergencias, los ajustamos rápidamente.
  const rarityOptions = useMemo(
    () => [
      { value: '', label: 'Cualquiera' },
      { value: '1', label: 'Consumer' },
      { value: '2', label: 'Industrial' },
      { value: '3', label: 'Mil-Spec' },
      { value: '4', label: 'Restricted' },
      { value: '5', label: 'Classified' },
      { value: '6', label: 'Covert' },
      { value: '7', label: 'Contraband' },
    ],
    []
  )

  // Presets expressed in USD
  const priceRangesUsd = [
    { label: '< $10', min: 0, max: 10 },
    { label: '$10 - $50', min: 10, max: 50 },
    { label: '$50 - $250', min: 50, max: 250 },
    { label: '$250 - $1000', min: 250, max: 1000 },
    { label: '> $1000', min: 1000, max: 9999999 },
  ]

  const usdToCents = (usd: number) => Math.max(0, Math.round(usd * 100))

  const isPriceRangeActive = (range: { min: number; max: number }) => {
    const toCents = (s: string) => {
      const t = (s ?? '').trim()
      if (t === '') return undefined
      const n = Number(t)
      return Number.isFinite(n) ? usdToCents(n) : undefined
    }
    const minC = toCents(minPrice)
    const maxC = toCents(maxPrice)
    return (
      minC !== undefined && maxC !== undefined &&
      minC === usdToCents(range.min) && maxC === usdToCents(range.max)
    )
  }

  const parseUsdToCentsOpt = (v: string) => {
    const s = (v ?? '').trim()
    if (s === '') return undefined
    // Normalize comma decimal and strip $
    const normalized = s.replace(/\$/g, '').replace(',', '.')
    const n = Number(normalized)
    if (!Number.isFinite(n)) return undefined
    return Math.max(0, Math.round(n * 100))
  }

  // Integer parser for paint_seed and paint_index
  const parseIntOpt = (v: string) => {
    const s = (v ?? '').trim()
    if (s === '') return undefined
    const n = Number(s)
    if (!Number.isFinite(n)) return undefined
    return Math.max(0, Math.floor(n))
  }

  const parseFloat01 = (v: string) => {
    const s = (v ?? '').trim()
    if (s === '') return undefined
    const n = Number(s)
    if (!Number.isFinite(n)) return undefined
    return Math.min(1, Math.max(0, n))
  }

  const handleApply = () => {
    // Parse def_index from input → number | number[] | undefined
    const parseDefIndex = (v: string): number | number[] | undefined => {
      const s = (v ?? '').trim()
      if (!s) return undefined
      const parts = s.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean)
      const nums = parts.map((p) => Number(p)).filter((n) => Number.isFinite(n) && n >= 0)
      if (nums.length === 0) return undefined
      if (nums.length === 1) return Math.floor(nums[0]!)
      return Array.from(new Set(nums.map((n) => Math.floor(n))))
    }

    f.patch({
      market_hash_name: market || undefined,
      min_price: parseUsdToCentsOpt(minPrice),
      max_price: parseUsdToCentsOpt(maxPrice),
      min_float: parseFloat01(minFloat),
      max_float: parseFloat01(maxFloat),
      paint_seed: parseIntOpt(paintSeed),
      paint_index: parseIntOpt(paintIndex),
      collection: collection || undefined,
      stickers: stickers || undefined,
      // new
      category: category,
      type: typeVal || undefined,
      rarity: (rarity ?? '').trim() || undefined,
      def_index: parseDefIndex(defIndexInput),
      user_id: (userId ?? '').trim() || undefined,
      has_image_only: imageOnly || undefined,
    })
    f.apply()
  }

  const handleReset = () => {
    setMarket('')
    setMinPrice('')
    setMaxPrice('')
    setMinFloat('')
    setMaxFloat('')
    setPaintSeed('')
    setPaintIndex('')
    setCollection('')
    setStickers('')
    setCategory(undefined)
    setTypeVal('')
    setRarity('')
    setDefIndexInput('')
    setUserId('')
    setImageOnly(false)
    f.reset()
  }

  const hasActiveFilters = market || minPrice || maxPrice || minFloat || maxFloat || paintSeed || paintIndex || collection || stickers || category !== undefined || typeVal || rarity || defIndexInput || userId || imageOnly

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Filters</h2>
            <p className="text-sm text-muted-foreground">Refine your search</p>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Zap size={12} />
            <span>Active filters applied</span>
          </div>
        )}
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Search */}
        <FilterSection title="Search" icon={<Search size={18} />}>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="e.g., AK-47 | Redline"
                className="input w-full pl-10 pr-4 py-3"
              />
            </div>
            <p className="text-xs text-muted-foreground">Search by exact weapon name</p>
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category" icon={<Filter size={18} />}>
          <div className="flex flex-wrap gap-2">
            <QuickFilterChip label="Any" active={category === undefined} onClick={() => setCategory(undefined)} />
            <QuickFilterChip label="Normal" active={category === 1} onClick={() => setCategory(1)} />
            <QuickFilterChip label="StatTrak™" active={category === 2} onClick={() => setCategory(2)} />
            <QuickFilterChip label="Souvenir" active={category === 3} onClick={() => setCategory(3)} />
          </div>
        </FilterSection>

        {/* Listing Type */}
        <FilterSection title="Listing Type" icon={<Filter size={18} />}>
          <div className="flex flex-wrap gap-2">
            <QuickFilterChip label="Any" active={!typeVal} onClick={() => setTypeVal('')} />
            <QuickFilterChip label="Buy Now" active={typeVal === 'buy_now'} onClick={() => setTypeVal('buy_now')} />
            <QuickFilterChip label="Auction" active={typeVal === 'auction'} onClick={() => setTypeVal('auction')} />
          </div>
        </FilterSection>

        {/* Rarity */}
        <FilterSection title="Rarity" icon={<Star size={18} />}>
          <div className="space-y-2">
            <select
              className="input w-full py-2"
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
            >
              {rarityOptions.map((o) => (
                <option key={o.value || 'any'} value={o.value} className="bg-surface-1">
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">El valor se envía como código numérico esperado por la API.</p>
          </div>
        </FilterSection>

        {/* Weapon (def_index) */}
        <FilterSection title="Weapon (def_index)" icon={<Filter size={18} />}>
          <div className="space-y-2">
            <input
              className="input w-full py-2 font-mono"
              placeholder="e.g., 7 o 7,9,16"
              value={defIndexInput}
              onChange={(e) => setDefIndexInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Puede ser uno o varios valores separados por coma o espacio.</p>
          </div>
        </FilterSection>

        {/* Seller (SteamID64) */}
        <FilterSection title="Seller" icon={<Tag size={18} />} defaultExpanded={false}>
          <div className="space-y-2">
            <input
              className="input w-full py-2 font-mono"
              placeholder="SteamID64"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Filtra por vendedor exacto (user_id).</p>
          </div>
        </FilterSection>

        {/* Media */}
        <FilterSection title="Media" icon={<Star size={18} />} defaultExpanded={false}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={imageOnly}
                onChange={(e) => setImageOnly(e.target.checked)}
              />
              <span>Mostrar solo items con imagen</span>
            </label>
            <p className="text-xs text-muted-foreground">Filtro del lado del cliente: icon_url o screenshot disponible.</p>
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" icon={<DollarSign size={18} />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Min Price (USD)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  className="input w-full py-2.5"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Max Price (USD)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="∞"
                  className="input w-full py-2.5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {priceRangesUsd.map((range) => {
                const active = isPriceRangeActive(range)
                return (
                  <QuickFilterChip
                    key={range.label}
                    label={range.label}
                    active={active}
                    onClick={() => {
                      if (active) {
                        setMinPrice('')
                        setMaxPrice('')
                        f.patch({ min_price: undefined, max_price: undefined })
                        f.apply()
                      } else {
                        setMinPrice(String(range.min))
                        setMaxPrice(String(range.max))
                        f.patch({ min_price: usdToCents(range.min), max_price: usdToCents(range.max) })
                        f.apply()
                      }
                    }}
                  />
                )
              })}
            </div>
          </div>
        </FilterSection>

        {/* Float Value */}
        <FilterSection title="Float Value" icon={<Sparkles size={18} />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Min Float</label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  placeholder="0.0000"
                  className="input w-full py-2.5 font-mono"
                  value={minFloat}
                  onChange={(e) => setMinFloat(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Max Float</label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  placeholder="1.0000"
                  className="input w-full py-2.5 font-mono"
                  value={maxFloat}
                  onChange={(e) => setMaxFloat(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick wear presets:</p>
              <div className="grid grid-cols-2 gap-2">
                {wearOptions.map((wear) => {
                  const active = isWearActive(wear)
                  return (
                    <button
                      key={wear.key}
                      onClick={() => {
                        if (active) {
                          setMinFloat('')
                          setMaxFloat('')
                          f.patch({ min_float: undefined, max_float: undefined })
                          f.apply()
                        } else {
                          setMinFloat(String(wear.min))
                          setMaxFloat(String(wear.max))
                          f.patch({ min_float: wear.min, max_float: wear.max })
                          f.apply()
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors text-left border ${
                        active
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-surface-2 hover:bg-surface-3 text-foreground border-border'
                      }`}
                    >
                      <div className="text-sm font-medium">{wear.key}</div>
                      <div className="text-xs text-muted-foreground">{wear.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Pattern & Seed */}
        <FilterSection title="Pattern & Seed" icon={<Palette size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Paint Seed</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g., 420"
                className="input w-full py-2.5 font-mono"
                value={paintSeed}
                onChange={(e) => setPaintSeed(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Paint Index</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g., 179"
                className="input w-full py-2.5 font-mono"
                value={paintIndex}
                onChange={(e) => setPaintIndex(e.target.value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Collection */}
        <FilterSection title="Collection" icon={<Star size={18} />}>
          <div className="space-y-3">
            <input
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="e.g., set_bravo_ii"
              className="input w-full py-2.5"
            />
            <p className="text-xs text-muted-foreground">Enter collection ID</p>
          </div>
        </FilterSection>

        {/* Stickers */}
        <FilterSection title="Stickers" icon={<Tag size={18} />} defaultExpanded={false}>
          <div className="space-y-3">
            <input
              placeholder="ID|POSITION,ID|POSITION"
              className="input w-full py-2.5 font-mono"
              value={stickers}
              onChange={(e) => setStickers(e.target.value)}
            />
            {f.errors['stickers'] && (
              <p className="text-xs text-danger flex items-center gap-2">
                <Target size={12} />
                {f.errors['stickers']}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Format: StickerID|Position (0-3), separate multiple with commas
            </p>
          </div>
        </FilterSection>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-border space-y-3">
        <button 
          onClick={handleApply}
          className="w-full btn-primary rounded-xl py-4 font-semibold text-lg transition-all duration-200"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="w-full btn-subtle rounded-xl py-3 font-medium flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Reset All
        </button>
        {hasActiveFilters && (
          <p className="text-center text-xs text-muted-foreground">
            {Object.keys(f.errors).length > 0 ? 'Fix errors above to apply' : 'Filters ready to apply'}
          </p>
        )}
      </div>
    </div>
  )
}
