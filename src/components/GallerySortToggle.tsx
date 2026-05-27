import type { GalleryListSort } from '../towerGallery/types'
import { useI18n } from '../i18n'

export type GallerySortToggleProps = {
  value: GalleryListSort
  onChange: (sort: GalleryListSort) => void
  disabled?: boolean
  name: string
  className?: string
}

export function GallerySortToggle({
  value,
  onChange,
  disabled = false,
  name,
  className = 'gallery-sort-toggle',
}: GallerySortToggleProps) {
  const { t } = useI18n()

  return (
    <div
      className={className}
      role="radiogroup"
      aria-label={t('gallery_sort_label')}
    >
      <label className={`${className}__option`}>
        <input
          type="radio"
          name={name}
          value="newest"
          checked={value === 'newest'}
          disabled={disabled}
          onChange={() => onChange('newest')}
        />
        <span>{t('gallery_sort_newest')}</span>
      </label>
      <label className={`${className}__option`}>
        <input
          type="radio"
          name={name}
          value="top"
          checked={value === 'top'}
          disabled={disabled}
          onChange={() => onChange('top')}
        />
        <span>{t('gallery_sort_top')}</span>
      </label>
    </div>
  )
}
