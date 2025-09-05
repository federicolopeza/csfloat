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
    <div className="min-h-screen bg-gradient-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[400px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block border-r border-white/10 sticky top-0 h-screen overflow-hidden">
          <div className="h-full glass">
            <FiltersPanel />
          </div>
        </aside>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-sm bg-dark-950 border-r border-white/10 animate-slide-up">
              <div className="h-full glass-dark">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
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
          <footer className="mt-auto p-6 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>© 2024 CSFloat Search Dashboard</span>
                <span>•</span>
                <span>Powered by CSFloat API</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://docs.csfloat.com" target="_blank" rel="noreferrer" className="hover:text-primary-400 transition-colors">
                  API Docs
                </a>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
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
