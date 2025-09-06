import { useEffect, useMemo } from 'react'
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { useFilters } from './useFilters'
import { getListings } from '../lib/api/csfloat'
import type { Listing, ListingsResponse } from '../lib/models/types'
import { matchesTokens, parseSmartSearch } from '../lib/search/smartSearch'

export function useListings() {
  const f = useFilters()
  const baseParams = useMemo(() => {
    const p = { ...f.getParams() }
    delete (p as any).cursor
    return p
  }, [
    f.appliedAt,
    f.limit,
    f.sort_by,
    f.category,
    f.def_index,
    f.min_float,
    f.max_float,
    f.rarity,
    f.paint_seed,
    f.paint_index,
    f.user_id,
    f.collection,
    f.min_price,
    f.max_price,
    f.market_hash_name,
    f.type,
    f.stickers,
  ])

  const query = useInfiniteQuery<ListingsResponse, Error, ListingsResponse, readonly [string, typeof baseParams], string | undefined>({
    queryKey: ['listings', baseParams],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const res = await getListings({ ...baseParams, cursor: pageParam })
      return res
    },
    getNextPageParam: (lastPage: ListingsResponse) => lastPage.cursor ?? undefined,
    initialPageParam: undefined,
  })

  const pages = (query.data as InfiniteData<ListingsResponse> | undefined)?.pages ?? []
  const listingsRaw: Listing[] = pages.flatMap((p: ListingsResponse) => p.data ?? [])

  // Client-side relaxed search: if q present, filter by tokens over market_hash_name
  const tokens = useMemo(() => {
    const term = f.q ?? ''
    if (!term) return [] as string[]
    const parsed = parseSmartSearch(term)
    return parsed.tokens
  }, [f.q])

  const listings: Listing[] = useMemo(() => {
    if (!tokens.length) return listingsRaw
    return listingsRaw.filter((l) => matchesTokens(l.item.market_hash_name, tokens))
  }, [listingsRaw, tokens])

  // Auto-fetch more pages to satisfy relaxed search when results are few
  useEffect(() => {
    const MIN_MATCHES = 40
    if (tokens.length && listings.length < MIN_MATCHES && query.hasNextPage && !query.isFetchingNextPage) {
      // keep fetching until we either reach threshold or run out of pages
      query.fetchNextPage()
    }
  }, [tokens.length, listings.length, query.hasNextPage, query.isFetchingNextPage])

  return {
    listings,
    isLoading: query.isLoading || query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    error: (query.error as Error) ?? null,
  }
}
