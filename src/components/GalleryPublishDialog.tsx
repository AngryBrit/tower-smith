import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { GalleryBuildCategory } from '../towerGallery/buildCategories'
import { TOWER_GALLERY_MAX_TITLE_LEN } from '../towerGallery/types'
import { GalleryBuildCategorySelect } from './GalleryBuildCategoryFields'
import { useI18n } from '../i18n'

export type GalleryPublishDialogProps = {
  open: boolean
  title: string
  category: GalleryBuildCategory | ''
  submitting: boolean
  onTitleChange: (value: string) => void
  onCategoryChange: (value: GalleryBuildCategory) => void
  onClose: () => void
  onSubmit: () => void
  /** Override dialog heading (defaults to gallery submit title). */
  dialogTitleKey?: 'gallery_submit_title' | 'sr_community_publish_title'
  /** Override primary button label. */
  submitLabelKey?: 'gallery_submit_btn' | 'sr_community_publish_submit'
}

export function GalleryPublishDialog({
  open,
  title,
  category,
  submitting,
  onTitleChange,
  onCategoryChange,
  onClose,
  onSubmit,
  dialogTitleKey = 'gallery_submit_title',
  submitLabelKey = 'gallery_submit_btn',
}: GalleryPublishDialogProps) {
  const { t } = useI18n()
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const el = titleInputRef.current
    if (!el) return
    queueMicrotask(() => {
      el.focus()
      el.select()
    })
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="select-research__preset-save-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="select-research__preset-save-dialog select-research__preset-save-dialog--gallery"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-publish-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="gallery-publish-dialog-title"
          className="select-research__preset-save-title"
        >
          {t(dialogTitleKey)}
        </h2>
        <p className="select-research__preset-save-hint">{t('gallery_submit_hint')}</p>
        <form
          className="select-research__preset-save-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <label
            className="select-research__preset-save-label"
            htmlFor="gallery-publish-title-field"
          >
            {t('gallery_field_title')}
          </label>
          <input
            ref={titleInputRef}
            id="gallery-publish-title-field"
            className="select-research__preset-save-input glow-input"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            autoComplete="off"
            maxLength={TOWER_GALLERY_MAX_TITLE_LEN}
            placeholder={t('gallery_field_title_placeholder')}
          />
          <GalleryBuildCategorySelect
            id="gallery-publish-category-field"
            value={category}
            onChange={onCategoryChange}
            disabled={submitting}
            className="select-research__preset-save-label tower-gallery__field"
            inputClassName="select-research__preset-save-input glow-input"
          />
          <div className="select-research__preset-save-actions">
            <button
              type="button"
              className="glow-btn glow-btn--block"
              disabled={submitting}
              onClick={onClose}
            >
              {t('sr_cancel')}
            </button>
            <button
              type="submit"
              className="glow-btn glow-btn--block"
              disabled={
                submitting || title.trim().length < 1 || category === ''
              }
            >
              {submitting ? t('gallery_submitting') : t(submitLabelKey)}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
