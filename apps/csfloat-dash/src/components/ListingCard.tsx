import React from 'react'
import { Eye, Star, TrendingUp, Clock, Users } from 'lucide-react'
import type { Listing } from '../lib/models/types'

function centsToUSD(cents?: number | null) {
  if (typeof cents !== 'number') return '-'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getFloatColor(floatValue?: number | null) {
  if (!floatValue) return 'text-gray-400'
  if (floatValue <= 0.07) return 'text-emerald-400'
  if (floatValue <= 0.15) return 'text-blue-400'
  if (floatValue <= 0.38) return 'text-yellow-400'
  if (floatValue <= 0.45) return 'text-orange-400'
  return 'text-red-400'
}

function getWearGradient(wearName?: string) {
  switch (wearName?.toLowerCase()) {
    case 'factory new': return 'from-emerald-500 to-green-400'
    case 'minimal wear': return 'from-blue-500 to-cyan-400'
    case 'field-tested': return 'from-yellow-500 to-amber-400'
    case 'well-worn': return 'from-orange-500 to-red-400'
    case 'battle-scarred': return 'from-red-500 to-pink-400'
    default: return 'from-gray-500 to-gray-400'
  }
}

interface ListingCardProps {
  listing: Listing
  highlightFloat?: boolean
}

export default function ListingCard({ listing, highlightFloat = false }: ListingCardProps) {
  const item = listing.item
  const isStatTrak = item.market_hash_name?.includes('StatTrak™')
  const isSouvenir = item.market_hash_name?.includes('Souvenir')
  const floatColor = getFloatColor(item.float_value)
  const wearGradient = getWearGradient(item.wear_name)
  
  return (
    <div className="group card-premium p-0 overflow-hidden hover:scale-[1.02] transition-all duration-300">
      {/* Header with price and badges */}
      <div className="relative p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-white text-sm leading-tight mb-2 group-hover:text-primary-300 transition-colors">
              {item.market_hash_name}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {isStatTrak && (
                <span className="badge-stattrak px-2 py-0.5 rounded-full text-xs font-bold">
                  ST™
                </span>
              )}
              {isSouvenir && (
                <span className="badge-souvenir px-2 py-0.5 rounded-full text-xs font-bold">
                  Souvenir
                </span>
              )}
              {highlightFloat && item.float_value && item.float_value <= 0.07 && (
                <span className="badge-float-highlight px-2 py-0.5 rounded-full text-xs font-bold">
                  Low Float
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              {centsToUSD(listing.price)}
            </div>
            {listing.watchers && listing.watchers > 0 && (
              <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
                <Users size={12} />
                <span>{listing.watchers}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Float Value */}
          <div className="glass-dark rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Float Value</div>
            <div className={`font-mono font-semibold ${floatColor}`}>
              {item.float_value?.toFixed(6) || 'N/A'}
            </div>
          </div>

          {/* Wear */}
          <div className="glass-dark rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Condition</div>
            <div className={`text-sm font-semibold bg-gradient-to-r ${wearGradient} bg-clip-text text-transparent`}>
              {item.wear_name || 'Unknown'}
            </div>
          </div>

          {/* Paint Seed */}
          <div className="glass-dark rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Paint Seed</div>
            <div className="font-mono text-sm text-white">
              {item.paint_seed || 'N/A'}
            </div>
          </div>

          {/* Paint Index */}
          <div className="glass-dark rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Pattern</div>
            <div className="font-mono text-sm text-white">
              {item.paint_index || 'N/A'}
            </div>
          </div>
        </div>

        {/* Collection */}
        {item.collection && (
          <div className="glass-dark rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-400 mb-1">Collection</div>
            <div className="text-sm text-primary-300 font-medium">
              {item.collection}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={item.inspect_link}
            target="_blank"
            rel="noreferrer"
            className="flex-1 btn-primary rounded-lg py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-glow transition-all duration-300"
          >
            <Eye size={16} />
            Inspect
          </a>
          <button className="btn-secondary rounded-lg p-2.5 hover:bg-glass-medium transition-all duration-300">
            <Star size={16} />
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}
