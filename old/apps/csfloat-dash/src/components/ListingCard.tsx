import React from 'react'
import { Eye, ExternalLink, Star, TrendingUp, Clock, Users } from 'lucide-react'
import type { Listing } from '../lib/models/types'
import { getCsfloatPublicUrl, resolveCsfloatPublicUrl } from '../lib/utils/url'
import { getItemImageUrl } from '../lib/utils/images'

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
  const csfloatUrl = getCsfloatPublicUrl(listing)
  const [resolving, setResolving] = React.useState(false)
  const [imgError, setImgError] = React.useState(false)
  const [imgLoaded, setImgLoaded] = React.useState(false)
  const imgUrl = getItemImageUrl(item)

  const handleOpenCsfloat = async () => {
    try {
      setResolving(true)
      const url = await resolveCsfloatPublicUrl(listing)
      if (url) {
        window.open(url, '_blank', 'noopener')
        return
      }
      // Fallback: si no se pudo resolver, intentar con lo que tengamos
      const fallback = getCsfloatPublicUrl(listing)
      if (fallback) window.open(fallback, '_blank', 'noopener')
    } finally {
      setResolving(false)
    }
  }
  
  return (
    <div className="group card p-0 overflow-hidden transition-all duration-200">
      {/* Image */}
      <div className="relative bg-background/40 border-b border-border">
        <div className="w-full h-40 overflow-hidden flex items-center justify-center">
          {imgUrl && !imgError ? (
            <img
              src={imgUrl}
              alt={item.market_hash_name}
              className={`max-h-full w-auto object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </div>
      {/* Header with price and badges */}
      <div className="relative p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
              {item.market_hash_name}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {isStatTrak && (
                <span className="badge badge-stattrak">
                  ST™
                </span>
              )}
              {isSouvenir && (
                <span className="badge badge-souvenir">
                  Souvenir
                </span>
              )}
              {highlightFloat && item.float_value && item.float_value <= 0.07 && (
                <span className="badge badge-float-highlight">
                  Low Float
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {centsToUSD(listing.price)}
            </div>
            {listing.watchers && listing.watchers > 0 && (
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
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
          <div className="surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Float Value</div>
            <div className={`font-mono font-semibold ${floatColor}`}>
              {item.float_value?.toFixed(6) || 'N/A'}
            </div>
          </div>

          {/* Wear */}
          <div className="surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Condition</div>
            <div className="text-sm font-semibold text-foreground">
              {item.wear_name || 'Unknown'}
            </div>
          </div>

          {/* Paint Seed */}
          <div className="surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Paint Seed</div>
            <div className="font-mono text-sm text-foreground">
              {item.paint_seed || 'N/A'}
            </div>
          </div>

          {/* Paint Index */}
          <div className="surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Pattern</div>
            <div className="font-mono text-sm text-foreground">
              {item.paint_index || 'N/A'}
            </div>
          </div>
        </div>

        {/* Collection */}
        {item.collection && (
          <div className="surface-2 rounded-lg p-3 mb-4">
            <div className="text-xs text-muted-foreground mb-1">Collection</div>
            <div className="text-sm text-primary font-medium">
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
            className="flex-1 btn-primary rounded-lg py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Eye size={16} />
            Inspect
          </a>
          {/* Preferimos el permalink inmediato si ya está disponible */}
          {csfloatUrl && csfloatUrl.includes('/item/') ? (
            <a
              href={csfloatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-secondary rounded-lg py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ExternalLink size={16} />
              View on CSFloat
            </a>
          ) : (
            <button
              onClick={handleOpenCsfloat}
              className={`flex-1 btn-secondary rounded-lg py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${resolving ? 'opacity-60 cursor-wait' : ''}`}
              disabled={resolving}
              aria-busy={resolving}
              title={resolving ? 'Resolviendo enlace…' : 'Abrir en CSFloat'}
            >
              <ExternalLink size={16} />
              {resolving ? 'Resolviendo…' : 'View on CSFloat'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
