import { useEffect, useId, useRef, useState } from 'react'
import {
  GALLERY_BUILD_CATEGORIES,
  GALLERY_BUILD_CATEGORY_I18N,
  type GalleryBuildCategory,
} from '../towerGallery/buildCategories'
import { useI18n } from '../i18n'

export type GalleryCategoryDropdownProps = {
  value: GalleryBuildCategory | ''
  disabled?: boolean
  /** When true, includes an “All categories” option with value `''`. */
  allowAll?: boolean
  onChange: (value: GalleryBuildCategory | '') => void
  rootClassName?: string
}

export function GalleryCategoryDropdown({
  value,
  disabled = false,
  allowAll = false,
  onChange,
  rootClassName,
}: GalleryCategoryDropdownProps) {
  const { t } = useI18n()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const label =
    value === ''
      ? t('gallery_category_filter_all')
      : t(GALLERY_BUILD_CATEGORY_I18N[value].name)
  const description =
    value === ''
      ? t('gallery_category_filter_all')
      : t(GALLERY_BUILD_CATEGORY_I18N[value].desc)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const select = (next: GalleryBuildCategory | '') => {
    setOpen(false)
    if (next !== value) onChange(next)
  }

  const ariaKey = allowAll ? 'gallery_category_filter_select_aria' : 'gallery_category_select_aria'

  return (
    <div
      ref={rootRef}
      className={['tower-gallery__category-select', rootClassName].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="gallery-build-category-badge tower-gallery__entry-category tower-gallery__category-trigger"
        disabled={disabled}
        title={description}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={t(ariaKey).replace('{{value}}', label)}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="tower-gallery__category-label">{label}</span>
        <span className="tower-gallery__category-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id={listboxId}
          className="tower-gallery__category-menu"
          role="listbox"
          aria-label={t(ariaKey).replace('{{value}}', label)}
        >
          {allowAll ? (
            <li role="presentation">
              <button
                type="button"
                className="tower-gallery__category-option"
                role="option"
                aria-selected={value === ''}
                onClick={() => select('')}
              >
                {t('gallery_category_filter_all')}
              </button>
            </li>
          ) : null}
          {GALLERY_BUILD_CATEGORIES.map((category) => {
            const keys = GALLERY_BUILD_CATEGORY_I18N[category]
            const optionLabel = t(keys.name)
            const optionDesc = t(keys.desc)
            return (
              <li key={category} role="presentation">
                <button
                  type="button"
                  className="tower-gallery__category-option"
                  role="option"
                  title={optionDesc}
                  aria-selected={value === category}
                  onClick={() => select(category)}
                >
                  {optionLabel}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export type GalleryCategorySelectProps = {
  value: GalleryBuildCategory
  disabled?: boolean
  onChange: (category: GalleryBuildCategory) => void
}

export function GalleryCategorySelect({
  value,
  disabled = false,
  onChange,
}: GalleryCategorySelectProps) {
  return (
    <GalleryCategoryDropdown
      value={value}
      disabled={disabled}
      onChange={(next) => {
        if (next !== '') onChange(next)
      }}
    />
  )
}
