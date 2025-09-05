import React from 'react'
import type { SortOption } from '../lib/models/types'

interface ToolbarProps {
  onQuickSearch: (term: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  onToggleFilters: () => void
}

export default function Toolbar(props: ToolbarProps) {
  const { sortBy, onSortChange } = props
  const options: SortOption[] = [
    'lowest_price',
    'highest_price',
    'most_recent',
    'expires_soon',
    'lowest_float',
    'highest_float',
    'best_deal',
    'highest_discount',
    'float_rank',
    'num_bids',
  ]
  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <input
        type="text"
        placeholder="market_hash_name..."
        className="w-64 rounded-md bg-gray-900 border border-gray-700 px-3 py-2"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            props.onQuickSearch((e.target as HTMLInputElement).value)
          }
        }}
      />
      <select
        className="rounded-md bg-gray-900 border border-gray-700 px-3 py-2"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <button
        className="lg:hidden rounded-md bg-gray-800 px-3 py-2"
        onClick={props.onToggleFilters}
      >
        Filtros
      </button>
    </div>
  )
}
