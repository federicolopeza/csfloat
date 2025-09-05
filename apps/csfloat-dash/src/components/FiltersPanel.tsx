import React, { useMemo, useState } from 'react'
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
    <div className="glass-dark rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary-400">{icon}</div>
          <span className="font-semibold text-white">{title}</span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        active 
          ? 'bg-gradient-primary text-white shadow-glow' 
          : 'bg-glass-light hover:bg-glass-medium text-gray-300 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export default function FiltersPanel() {
  const f = useFilters()
  const [market, setMarket] = useState(f.market_hash_name ?? '')
  const [minPrice, setMinPrice] = useState<string>(f.min_price?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState<string>(f.max_price?.toString() ?? '')
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

  const priceRanges = [
    { label: '< $10', min: 0, max: 1000 },
    { label: '$10 - $50', min: 1000, max: 5000 },
    { label: '$50 - $250', min: 5000, max: 25000 },
    { label: '$250 - $1000', min: 25000, max: 100000 },
    { label: '> $1000', min: 100000, max: 999999999 },
  ]

  const parseIntOpt = (v: string) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return undefined
    return Math.max(0, Math.floor(n))
  }

  const parseFloat01 = (v: string) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return undefined
    return Math.min(1, Math.max(0, n))
  }

  const handleApply = () => {
    f.patch({
      market_hash_name: market || undefined,
      min_price: parseIntOpt(minPrice),
      max_price: parseIntOpt(maxPrice),
      min_float: parseFloat01(minFloat),
      max_float: parseFloat01(maxFloat),
      paint_seed: parseIntOpt(paintSeed),
      paint_index: parseIntOpt(paintIndex),
      collection: collection || undefined,
      stickers: stickers || undefined,
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
    f.reset()
  }

  const hasActiveFilters = market || minPrice || maxPrice || minFloat || maxFloat || paintSeed || paintIndex || collection || stickers

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Filters</h2>
            <p className="text-sm text-gray-400">Refine your search</p>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-primary-300">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="e.g., AK-47 | Redline"
                className="input-premium w-full pl-10 pr-4 py-3"
              />
            </div>
            <p className="text-xs text-gray-500">Search by exact weapon name</p>
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" icon={<DollarSign size={18} />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Min Price (cents)</label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  className="input-premium w-full py-2.5"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Max Price (cents)</label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="∞"
                  className="input-premium w-full py-2.5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <QuickFilterChip
                  key={range.label}
                  label={range.label}
                  onClick={() => {
                    setMinPrice(String(range.min))
                    setMaxPrice(String(range.max))
                  }}
                />
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Float Value */}
        <FilterSection title="Float Value" icon={<Sparkles size={18} />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Min Float</label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  placeholder="0.0000"
                  className="input-premium w-full py-2.5 font-mono"
                  value={minFloat}
                  onChange={(e) => setMinFloat(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Max Float</label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  placeholder="1.0000"
                  className="input-premium w-full py-2.5 font-mono"
                  value={maxFloat}
                  onChange={(e) => setMaxFloat(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Quick wear presets:</p>
              <div className="grid grid-cols-2 gap-2">
                {wearOptions.map((wear) => (
                  <button
                    key={wear.key}
                    onClick={() => {
                      setMinFloat(String(wear.min))
                      setMaxFloat(String(wear.max))
                    }}
                    className="p-2 rounded-lg bg-glass-light hover:bg-glass-medium transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-white">{wear.key}</div>
                    <div className="text-xs text-gray-400">{wear.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Pattern & Seed */}
        <FilterSection title="Pattern & Seed" icon={<Palette size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Paint Seed</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g., 420"
                className="input-premium w-full py-2.5 font-mono"
                value={paintSeed}
                onChange={(e) => setPaintSeed(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Paint Index</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g., 179"
                className="input-premium w-full py-2.5 font-mono"
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
              className="input-premium w-full py-2.5"
            />
            <p className="text-xs text-gray-500">Enter collection ID</p>
          </div>
        </FilterSection>

        {/* Stickers */}
        <FilterSection title="Stickers" icon={<Tag size={18} />} defaultExpanded={false}>
          <div className="space-y-3">
            <input
              placeholder="ID|POSITION,ID|POSITION"
              className="input-premium w-full py-2.5 font-mono"
              value={stickers}
              onChange={(e) => setStickers(e.target.value)}
            />
            {f.errors['stickers'] && (
              <p className="text-xs text-red-400 flex items-center gap-2">
                <Target size={12} />
                {f.errors['stickers']}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Format: StickerID|Position (0-3), separate multiple with commas
            </p>
          </div>
        </FilterSection>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-white/10 space-y-3">
        <button 
          onClick={handleApply}
          className="w-full btn-primary rounded-xl py-4 font-semibold text-lg hover:shadow-glow transition-all duration-300"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="w-full btn-secondary rounded-xl py-3 font-medium flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Reset All
        </button>
        {hasActiveFilters && (
          <p className="text-center text-xs text-gray-500">
            {Object.keys(f.errors).length > 0 ? 'Fix errors above to apply' : 'Filters ready to apply'}
          </p>
        )}
      </div>
    </div>
  )
}
