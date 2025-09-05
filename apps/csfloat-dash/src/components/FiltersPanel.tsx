import React, { useState } from 'react'
import { useFilters } from '../store/useFilters'

export default function FiltersPanel() {
  const f = useFilters()
  const [market, setMarket] = useState(f.market_hash_name ?? '')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Filtros</h2>
      <div className="space-y-2">
        <label className="text-sm text-gray-400">market_hash_name</label>
        <input
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-md bg-blue-600 px-3 py-2"
          onClick={() => {
            f.setMarketHashName(market)
            f.apply()
          }}
        >
          Aplicar
        </button>
        <button
          className="rounded-md bg-gray-800 px-3 py-2"
          onClick={() => f.reset()}
        >
          Reset
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Más controles serán añadidos (type, category, price, float, stickers...).
      </p>
    </div>
  )
}
