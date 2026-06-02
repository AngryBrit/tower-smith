import { useCallback, useEffect } from 'react'
import { useLabHydration } from '../lab/labHydrationContext'
import { useI18n } from '../i18n'
import { ImportNoticeBlock } from './ImportNoticeBlock'

/** Import / share-link toast anchored to the top of the main panel card. */
export function LabImportNoticeBanner() {
  const { t } = useI18n()
  const { importNotice, setImportNotice } = useLabHydration()

  const dismiss = useCallback(() => {
    setImportNotice(null)
  }, [setImportNotice])

  useEffect(() => {
    if (!importNotice) return
    const id = window.setTimeout(dismiss, 5000)
    return () => window.clearTimeout(id)
  }, [dismiss, importNotice])

  if (!importNotice) return null

  return (
    <div
      className={`app-import-notice-banner app-import-notice-banner--${importNotice.variant}`}
      role={importNotice.variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className="app-import-notice-banner__body">
        <ImportNoticeBlock
          message={importNotice.message}
          variant={importNotice.variant}
          className="app-import-notice-banner__message"
        />
      </div>
      <button
        type="button"
        className="app-import-notice-banner__dismiss"
        onClick={dismiss}
        aria-label={t('sr_close')}
      >
        <span aria-hidden>×</span>
      </button>
    </div>
  )
}
