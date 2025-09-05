import React from 'react'
import { AlertTriangle, RefreshCw, ChevronDown, Sparkles, TrendingUp } from 'lucide-react'
import type { Listing } from '../lib/models/types'
import ListingCard from './ListingCard'

interface Props {
  listings: Listing[]
  isLoading: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  error?: Error | null
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-4 shimmer">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-4 bg-surface-2 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-surface-3 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-surface-2 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="surface-2 rounded-lg p-3">
                <div className="h-2 bg-surface-3 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-surface-2 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-surface-2 rounded"></div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="card p-8 text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary rounded-lg py-2.5 px-6 font-semibold flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="card p-12 text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">No skins found</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          We couldn't find any skins matching your current filters. Try adjusting your search criteria or removing some filters to see more results.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-sm">
          <span className="badge badge-subtle">Try different float range</span>
          <span className="badge badge-subtle">Adjust price limits</span>
          <span className="badge badge-subtle">Change weapon type</span>
        </div>
      </div>
    </div>
  )
}

function ResultsHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground">Search Results</h2>
        <span className="badge badge-primary">
          {count.toLocaleString()} items
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp size={16} />
        <span>Live market data</span>
      </div>
    </div>
  )
}

export default function ListingsGrid(props: Props) {
  const { listings, isLoading, hasNextPage, onLoadMore, error } = props

  if (error) {
    return <ErrorState error={error} />
  }

  if (isLoading && listings.length === 0) {
    return (
      <div className="animate-fade-in">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!isLoading && listings.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="animate-fade-in">
      <ResultsHeader count={listings.length} />
      
      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>

      {/* Load More Section */}
      <div className="flex flex-col items-center gap-4">
        {isLoading && listings.length > 0 && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Loading more results...</span>
          </div>
        )}
        
        {!isLoading && hasNextPage && (
          <button
            onClick={onLoadMore}
            className="group btn-primary rounded-xl py-4 px-8 font-semibold text-lg flex items-center gap-3 transition-all duration-200"
          >
            <span>Load More Skins</span>
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" />
          </button>
        )}
        
        {!isLoading && !hasNextPage && listings.length > 0 && (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted-foreground font-medium">You've reached the end of the results</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters to find more skins</p>
          </div>
        )}
      </div>
    </div>
  )
}
