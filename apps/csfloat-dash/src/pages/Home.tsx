import React from 'react'
import ListingsGrid from '../components/ListingsGrid'
import Toolbar from '../components/Toolbar'
import { useListings } from '../store/useListings'
import { useFilters } from '../store/useFilters'

export default function Home() {
  const { listings, isLoading, hasNextPage, loadMore, error } = useListings()
  const { sort_by, setSortBy, apply, setMarketHashName } = useFilters()

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen">
        {/* Main Content */}
        <main className="flex flex-col min-h-screen">
          {/* Toolbar */}
          <div className="p-6 pb-0">
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
              onToggleFilters={() => { /* filters are in toolbar now (desktop only) */ }}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <ListingsGrid
              listings={listings}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              onLoadMore={loadMore}
              error={error}
            />
          </div>

          {/* Footer */}
          <footer className="mt-auto p-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>© 2025 CSFloat Search Dashboard</span>
                <span>•</span>
                <span>Powered by CSFloat API</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://docs.csfloat.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  API Docs
                </a>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  Live Data
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
