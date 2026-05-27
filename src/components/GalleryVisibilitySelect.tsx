import { useEffect, useId, useRef, useState } from 'react'
import type { GalleryBuildVisibility } from '../towerGallery/types'
import { useI18n } from '../i18n'

export type GalleryVisibilitySelectProps = {
  value: GalleryBuildVisibility
  disabled?: boolean
  onChange: (visibility: GalleryBuildVisibility) => void
}

export function GalleryVisibilitySelect({
  value,
  disabled = false,
  onChange,
}: GalleryVisibilitySelectProps) {
  const { t } = useI18n()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const visibility = value === 'unlisted' ? 'unlisted' : 'public'
  const label =
    visibility === 'unlisted'
      ? t('gallery_visibility_private')
      : t('gallery_visibility_public')

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

  const select = (next: GalleryBuildVisibility) => {
    setOpen(false)
    if (next !== visibility) onChange(next)
  }

  return (
    <div ref={rootRef} className="tower-gallery__visibility-select">
      <button
        type="button"
        className={
          visibility === 'unlisted'
            ? 'tower-gallery__visibility-badge tower-gallery__visibility-badge--private tower-gallery__visibility-trigger'
            : 'tower-gallery__visibility-badge tower-gallery__visibility-badge--public tower-gallery__visibility-trigger'
        }
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={t('gallery_visibility_select_aria').replace('{{value}}', label)}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{label}</span>
        <span className="tower-gallery__visibility-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id={listboxId}
          className="tower-gallery__visibility-menu"
          role="listbox"
          aria-label={t('gallery_visibility_select_aria').replace('{{value}}', label)}
        >
          <li role="presentation">
            <button
              type="button"
              className="tower-gallery__visibility-option"
              role="option"
              aria-selected={visibility === 'public'}
              onClick={() => select('public')}
            >
              {t('gallery_visibility_public')}
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              className="tower-gallery__visibility-option"
              role="option"
              aria-selected={visibility === 'unlisted'}
              onClick={() => select('unlisted')}
            >
              {t('gallery_visibility_private')}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
