import React, { useState, useEffect } from 'react'
import { X, Menu } from 'lucide-react'
import ListingsGrid from '../components/ListingsGrid'
import FiltersPanel from '../components/FiltersPanel'
import Toolbar from '../components/Toolbar'
import { useListings } from '../store/useListings'
import { useFilters } from '../store/useFilters'

export default function Home() {
  const { listings, isLoading, hasNextPage, loadMore, error } = useListings()
  const { sort_by, setSortBy, apply, setMarketHashName } = useFilters()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Close mobile filters on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileFilters(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileFilters])

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[400px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block border-r border-border sticky top-0 h-screen overflow-hidden">
          <div className="h-full surface-0">
            <FiltersPanel />
          </div>
        </aside>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 overlay"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-sm bg-background border-r border-border animate-slide-up">
              <div className="h-full surface-0">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-lg hover:bg-surface-1 transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Mobile Filters Content */}
                <div className="h-full overflow-hidden">
                  <FiltersPanel />
                </div>
              </div>
            </div>
          </div>
        )}

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
              onToggleFilters={() => setShowMobileFilters(true)}
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
                <span>© 2024 CSFloat Search Dashboard</span>
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
