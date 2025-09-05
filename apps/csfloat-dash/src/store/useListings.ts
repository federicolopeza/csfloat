import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useFilters } from './useFilters'
import { getListings } from '../lib/api/csfloat'
import type { Listing, ListingsResponse } from '../lib/models/types'

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

  const listings: Listing[] = (query.data?.pages ?? []).flatMap((p: ListingsResponse) => p.data)

  return {
    listings,
    isLoading: query.isLoading || query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    error: (query.error as Error) ?? null,
  }
}
