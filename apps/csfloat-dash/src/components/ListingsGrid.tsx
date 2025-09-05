import React from 'react'
import type { Listing } from '../lib/models/types'
import ListingCard from './ListingCard'

interface Props {
  listings: Listing[]
  isLoading: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  error?: Error | null
}

export default function ListingsGrid(props: Props) {
  const { listings, isLoading, hasNextPage, onLoadMore, error } = props

  if (error) {
    return (
      <div className="p-6 rounded-md border border-red-800 bg-red-950 text-red-200">
        Error: {error.message}
      </div>
    )
  }

  if (!isLoading && listings.length === 0) {
    return (
      <div className="p-6 rounded-md border border-gray-800 bg-gray-900">
        No se encontraron resultados. Ajustá tus filtros e intentá nuevamente.
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />)
        )}
      </div>
      <div className="mt-4 flex justify-center">
        {isLoading ? (
          <div className="text-gray-400">Cargando...</div>
        ) : hasNextPage ? (
          <button className="rounded-md bg-gray-800 px-4 py-2" onClick={onLoadMore}>
            Cargar más
          </button>
        ) : listings.length > 0 ? (
          <div className="text-gray-500 text-sm">No hay más resultados.</div>
        ) : null}
      </div>
    </div>
  )
}
