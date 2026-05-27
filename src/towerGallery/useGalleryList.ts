import { useCallback, useEffect, useState } from 'react'
import {
  listGalleryTowersPage,
  type TowerGalleryApiError,
} from './api'
import { TOWER_GALLERY_LIST_PAGE_DEFAULT } from './types'
import type { GalleryListSort, TowerGalleryIndexEntry } from './types'

type UseGalleryListOptions = {
  enabled: boolean
  refreshToken?: number
  pageSize?: number
  /** Title search (server-side when Supabase is enabled). */
  searchQuery?: string
  /** Build category filter (server-side). */
  categoryFilter?: string
  sort?: GalleryListSort
  accessToken?: string | null
}

export function useGalleryList({
  enabled,
  refreshToken = 0,
  pageSize = TOWER_GALLERY_LIST_PAGE_DEFAULT,
  searchQuery = '',
  categoryFilter = '',
  sort = 'newest',
  accessToken = null,
}: UseGalleryListOptions) {
  const q = searchQuery.trim()
  const category = categoryFilter.trim()
  const [entries, setEntries] = useState<TowerGalleryIndexEntry[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<TowerGalleryApiError | null>(null)

  const loadFirstPage = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      setError('gallery_unavailable')
      return
    }
    setLoading(true)
    setError(null)
    const result = await listGalleryTowersPage({
      limit: pageSize,
      sort,
      ...(q ? { q } : {}),
      ...(category ? { category } : {}),
      ...(accessToken ? { accessToken } : {}),
    })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      setEntries([])
      setNextCursor(null)
      return
    }
    setEntries(result.page.entries)
    setNextCursor(result.page.nextCursor)
  }, [enabled, pageSize, sort, q, category, accessToken])

  const loadMore = useCallback(async () => {
    if (!enabled || !nextCursor || loadingMore) return
    setLoadingMore(true)
    const result = await listGalleryTowersPage({
      limit: pageSize,
      cursor: nextCursor,
      sort,
      ...(q ? { q } : {}),
      ...(category ? { category } : {}),
      ...(accessToken ? { accessToken } : {}),
    })
    setLoadingMore(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setEntries((prev) => [...prev, ...result.page.entries])
    setNextCursor(result.page.nextCursor)
  }, [enabled, loadingMore, nextCursor, pageSize, sort, q, category, accessToken])

  const patchEntryVote = useCallback(
    (buildId: string, upvoteCount: number, viewerVoted: boolean) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === buildId
            ? { ...entry, upvoteCount, viewerVoted: viewerVoted || undefined }
            : entry,
        ),
      )
    },
    [],
  )

  useEffect(() => {
    void loadFirstPage()
  }, [loadFirstPage, refreshToken])

  return {
    entries,
    loading,
    loadingMore,
    error,
    hasMore: nextCursor != null,
    loadFirstPage,
    loadMore,
    patchEntryVote,
  }
}
