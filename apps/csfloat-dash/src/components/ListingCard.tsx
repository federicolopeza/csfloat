import React from 'react'
import type { Listing } from '../lib/models/types'

function centsToUSD(cents?: number | null) {
  if (typeof cents !== 'number') return '-'
  return `$${(cents / 100).toFixed(2)}`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const it = listing.item
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{it.market_hash_name}</h3>
        <span className="text-emerald-400 font-semibold">{centsToUSD(listing.price)}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-gray-300">
        <div>float: {it.float_value?.toFixed(6)}</div>
        <div>seed: {it.paint_seed}</div>
        <div>index: {it.paint_index}</div>
        <div>wear: {it.wear_name}</div>
        <div>collection: {it.collection || '-'}</div>
        <div>watchers: {listing.watchers ?? 0}</div>
      </div>
      <div className="mt-3">
        <a
          className="text-blue-400 hover:underline"
          href={it.inspect_link}
          target="_blank"
          rel="noreferrer"
        >
          Inspeccionar
        </a>
      </div>
    </div>
  )
}
