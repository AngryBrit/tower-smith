import { useCallback, useEffect, useState } from 'react'
import { deferInEffect } from '../deferInEffect'
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
  paginationMode?: 'append' | 'paged'
  /** Title or author display name search (server-side when Supabase is enabled). */
  searchQuery?: string
  /** Build category filter (server-side). */
  categoryFilter?: string
  sort?: GalleryListSort
  accessToken?: string | null
  /** Only builds owned by the signed-in user (requires access token). */
  mineOnly?: boolean
}

export function useGalleryList({
  enabled,
  refreshToken = 0,
  pageSize = TOWER_GALLERY_LIST_PAGE_DEFAULT,
  paginationMode = 'append',
  searchQuery = '',
  categoryFilter = '',
  sort = 'newest',
  accessToken = null,
  mineOnly = false,
}: UseGalleryListOptions) {
  const q = searchQuery.trim()
  const category = categoryFilter.trim()
  const [entries, setEntries] = useState<TowerGalleryIndexEntry[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [cursorByPage, setCursorByPage] = useState<Record<number, string | null>>({
    1: null,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<TowerGalleryApiError | null>(null)

  const fetchPage = useCallback(
    async (cursor: string | null, mode: 'replace' | 'append') => {
      const result = await listGalleryTowersPage({
        limit: pageSize,
        sort,
        ...(cursor ? { cursor } : {}),
        ...(q ? { q } : {}),
        ...(category ? { category } : {}),
        ...(accessToken ? { accessToken } : {}),
        ...(mineOnly ? { mine: true } : {}),
      })
      if (!result.ok) {
        setError(result.error)
        if (mode === 'replace') {
          setEntries([])
          setNextCursor(null)
        }
        return false
      }
      if (mode === 'append') {
        setEntries((prev) => [...prev, ...result.page.entries])
      } else {
        setEntries(result.page.entries)
      }
      setNextCursor(result.page.nextCursor)
      return true
    },
    [accessToken, category, mineOnly, pageSize, q, sort],
  )

  const loadFirstPage = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      setError(null)
      setEntries([])
      setNextCursor(null)
      return
    }
    setLoading(true)
    setError(null)
    setPage(1)
    setCursorByPage({ 1: null })
    const ok = await fetchPage(null, 'replace')
    setLoading(false)
    if (!ok) return
  }, [enabled, fetchPage])

  const loadMore = useCallback(async () => {
    if (!enabled || !nextCursor || loadingMore) return
    setLoadingMore(true)
    if (paginationMode === 'paged') {
      const nextPage = page + 1
      const ok = await fetchPage(nextCursor, 'replace')
      if (ok) {
        setPage(nextPage)
        setCursorByPage((prev) => ({ ...prev, [nextPage]: nextCursor }))
      }
      setLoadingMore(false)
      return
    }
    const ok = await fetchPage(nextCursor, 'append')
    setLoadingMore(false)
    if (!ok) return
  }, [enabled, nextCursor, loadingMore, paginationMode, page, fetchPage])

  const loadPrevPage = useCallback(async () => {
    if (!enabled || paginationMode !== 'paged' || loadingMore || page <= 1) return
    const prevPage = page - 1
    const prevCursor = cursorByPage[prevPage] ?? null
    setLoadingMore(true)
    const ok = await fetchPage(prevCursor, 'replace')
    setLoadingMore(false)
    if (!ok) return
    setPage(prevPage)
  }, [enabled, paginationMode, loadingMore, page, cursorByPage, fetchPage])

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

  const patchEntry = useCallback(
    (buildId: string, patch: Partial<TowerGalleryIndexEntry>) => {
      setEntries((prev) =>
        prev.map((entry) => (entry.id === buildId ? { ...entry, ...patch } : entry)),
      )
    },
    [],
  )

  useEffect(() => {
    deferInEffect(() => void loadFirstPage())
  }, [loadFirstPage, refreshToken])

  return {
    entries,
    loading,
    loadingMore,
    error,
    hasMore: nextCursor != null,
    currentPage: page,
    hasPrev: paginationMode === 'paged' ? page > 1 : false,
    hasNext: nextCursor != null,
    loadFirstPage,
    loadMore,
    loadPrevPage,
    patchEntryVote,
    patchEntry,
  }
}
