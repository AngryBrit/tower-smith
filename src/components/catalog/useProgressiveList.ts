import { useEffect, useRef, useState } from 'react'
import { deferInEffect } from '../../deferInEffect'

export type UseProgressiveListOptions = {
  /** Items per batch when the sentinel enters view. */
  batchSize?: number
  /** When false, all items render immediately (e.g. active search with few matches). */
  enabled?: boolean
  /** First paint count before intersection (default batchSize). */
  initialCount?: number
}

/**
 * Renders a growing prefix of `items` and loads more when `sentinelRef` intersects.
 */
export function useProgressiveList<T>(
  items: readonly T[],
  {
    batchSize = 36,
    enabled = true,
    initialCount,
  }: UseProgressiveListOptions = {},
) {
  const firstBatch = initialCount ?? batchSize
  const [visibleCount, setVisibleCount] = useState(() =>
    enabled ? Math.min(firstBatch, items.length) : items.length,
  )
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    deferInEffect(() =>
      setVisibleCount(enabled ? Math.min(firstBatch, items.length) : items.length),
    )
  }, [enabled, firstBatch, items])

  useEffect(() => {
    if (!enabled || visibleCount >= items.length) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setVisibleCount((count) => Math.min(count + batchSize, items.length))
      },
      { root: null, rootMargin: '480px 0px', threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [batchSize, enabled, items.length, visibleCount])

  return {
    visibleItems: items.slice(0, visibleCount),
    sentinelRef,
    hasMore: enabled && visibleCount < items.length,
  }
}
