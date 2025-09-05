import React, { useState } from 'react'
import { Search, Filter, SortAsc, Zap, TrendingUp, Clock, DollarSign, Star } from 'lucide-react'
import type { SortOption } from '../lib/models/types'

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
  const [searchValue, setSearchValue] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onQuickSearch(value)
  }

  const currentSort = sortOptions.find(option => option.value === sortBy)

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
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="input w-full pl-12 pr-4 py-4 text-lg"
            />
            {searchValue && (
              <button
                onClick={() => handleSearch('')}
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

        {/* Mobile Filter Toggle */}
        <button
          onClick={onToggleFilters}
          className="lg:hidden btn-secondary rounded-xl py-4 px-6 flex items-center gap-3 font-semibold"
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
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
