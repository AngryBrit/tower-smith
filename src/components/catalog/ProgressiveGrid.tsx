import { Fragment, type ReactNode, type Ref } from 'react'
import { useProgressiveList, type UseProgressiveListOptions } from './useProgressiveList'

type ProgressiveGridProps<T> = {
  items: readonly T[]
  className?: string
  renderItem: (item: T, index: number) => ReactNode
  getKey: (item: T, index: number) => string
  progressive?: UseProgressiveListOptions
}

export function ProgressiveGrid<T>({
  items,
  className,
  renderItem,
  getKey,
  progressive,
}: ProgressiveGridProps<T>) {
  const { visibleItems, sentinelRef, hasMore } = useProgressiveList(items, progressive)

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <Fragment key={getKey(item, index)}>{renderItem(item, index)}</Fragment>
      ))}
      {hasMore ? (
        <div
          ref={sentinelRef as Ref<HTMLDivElement>}
          className="catalog-progressive-grid__sentinel"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
