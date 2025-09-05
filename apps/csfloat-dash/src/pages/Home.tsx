import React, { useState } from 'react'
import ListingsGrid from '../components/ListingsGrid'
import FiltersPanel from '../components/FiltersPanel'
import Toolbar from '../components/Toolbar'
import { useListings } from '../store/useListings'
import { useFilters } from '../store/useFilters'

export default function Home() {
  const { listings, isLoading, hasNextPage, loadMore, error } = useListings()
  const { sort_by, setSortBy, apply, setMarketHashName } = useFilters()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[320px_1fr]">
      <aside className="hidden lg:block border-r border-gray-800 p-4 sticky top-0 h-screen overflow-y-auto">
        <FiltersPanel />
      </aside>
      <main className="p-4">
        <Toolbar
          sortBy={sort_by!}
          onSortChange={(s) => {
            setSortBy(s)
            apply()
          }}
          onQuickSearch={(term) => {
            setMarketHashName(term)
            apply()
          }}
          onToggleFilters={() => setShowFilters((v: boolean) => !v)}
        />
        {showFilters ? (
          <div className="lg:hidden mb-4 rounded-md border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                className="rounded-md bg-gray-800 px-3 py-1 text-sm"
                onClick={() => setShowFilters(false)}
              >
                Cerrar
              </button>
            </div>
            <FiltersPanel />
          </div>
        ) : null}
        <ListingsGrid
          listings={listings}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          error={error}
        />
      </main>
    </div>
  )
}
