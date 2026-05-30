import {
  GALLERY_SETUP_DOCS_URL,
  getGalleryUnavailableReason,
  type GalleryUnavailableReason,
} from '../towerGallery/gallerySetup'
import type { TowerGalleryApiError } from '../towerGallery/api'
import { towerGalleryApiAvailable } from '../towerGallery/api'
import { useI18n } from '../i18n'

type GalleryUnavailableCalloutProps = {
  error?: TowerGalleryApiError | null
  reason?: GalleryUnavailableReason
  /** Shorter copy for inline rows (e.g. BUILD publish). */
  compact?: boolean
  className?: string
}

export function GalleryUnavailableCallout({
  error = null,
  reason: reasonProp,
  compact = false,
  className,
}: GalleryUnavailableCalloutProps) {
  const { t } = useI18n()
  const reason =
    reasonProp ??
    getGalleryUnavailableReason(
      towerGalleryApiAvailable() ? error : 'gallery_unavailable',
    )

  const rootClass = [
    'gallery-unavailable-callout',
    compact ? 'gallery-unavailable-callout--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (compact) {
    return (
      <p className={rootClass} role="status">
        {t('gallery_publish_unavailable_hint')}{' '}
        <a
          href={GALLERY_SETUP_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gallery-unavailable-callout__link"
        >
          {t('gallery_unavailable_setup_link')}
        </a>
      </p>
    )
  }

  const bodyKey =
    reason === 'disabled'
      ? 'gallery_unavailable_disabled_body'
      : reason === 'local_dev'
        ? 'gallery_unavailable_local_body'
        : 'gallery_unavailable_production_body'

  return (
    <aside className={rootClass} role="status" aria-labelledby="gallery-unavailable-title">
      <h3 id="gallery-unavailable-title" className="gallery-unavailable-callout__title">
        {t('gallery_unavailable_title')}
      </h3>
      <p className="gallery-unavailable-callout__body">{t(bodyKey)}</p>
      {reason === 'local_dev' ? (
        <p className="gallery-unavailable-callout__cmd">
          <code>npm run dev:netlify</code>
          <span className="gallery-unavailable-callout__cmd-hint">
            {t('gallery_unavailable_local_cmd_hint')}
          </span>
        </p>
      ) : null}
      <p className="gallery-unavailable-callout__actions">
        <a
          href={GALLERY_SETUP_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gallery-unavailable-callout__link glow-btn"
        >
          {t('gallery_unavailable_setup_link')}
        </a>
      </p>
    </aside>
  )
}
