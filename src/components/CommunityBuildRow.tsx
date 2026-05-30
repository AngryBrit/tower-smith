import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { towerGalleryApiAvailable } from '../towerGallery/api'
import { GalleryUnavailableCallout } from './GalleryUnavailableCallout'
import { useI18n } from '../i18n'

export type CommunityBuildRowProps = {
  hydrated: boolean
  onSaveAs: () => void
  onCopyShareLink: () => Promise<boolean>
  onClearWorkspace: () => void
}

export function CommunityBuildRow({
  hydrated,
  onSaveAs,
  onCopyShareLink,
  onClearWorkspace,
}: CommunityBuildRowProps) {
  const { t } = useI18n()
  const apiEnabled = towerGalleryApiAvailable()
  const clearConfirmTitleId = useId()
  const clearConfirmDescId = useId()

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [copyNotice, setCopyNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!copyNotice) return
    const timer = window.setTimeout(() => setCopyNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [copyNotice])

  const handleCopyShareLink = () => {
    void (async () => {
      const ok = await onCopyShareLink()
      setCopyNotice(t(ok ? 'sr_notice_copy_build_ok' : 'sr_notice_copy_build_fail'))
    })()
  }

  const handleConfirmClearWorkspace = () => {
    setClearConfirmOpen(false)
    onClearWorkspace()
  }

  return (
    <div className="select-research__presets-wrap community-build-row">
      <div className="community-build-row__actions select-research__presets-row">
        <span className="select-research__presets-label">{t('sr_builds_row_label')}</span>
        <button
          type="button"
          className="glow-btn select-research__presets-btn"
          disabled={!hydrated || !apiEnabled}
          onClick={onSaveAs}
        >
          {t('sr_community_publish_btn')}
        </button>
        <button
          type="button"
          className="glow-btn select-research__presets-btn"
          disabled={!hydrated}
          onClick={handleCopyShareLink}
          aria-label={t('sr_preset_share_link_aria')}
          aria-describedby={copyNotice ? 'community-copy-notice' : undefined}
        >
          {t('sr_preset_share_link')}
        </button>
        <button
          type="button"
          className="glow-btn glow-btn--danger select-research__presets-btn"
          disabled={!hydrated}
          onClick={() => setClearConfirmOpen(true)}
          aria-label={t('sr_community_clear_aria')}
        >
          {t('sr_community_clear_workspace')}
        </button>
      </div>
      {!apiEnabled ? <GalleryUnavailableCallout compact /> : null}
      {copyNotice ? (
        <p
          id="community-copy-notice"
          className="select-research__presets-notice"
          role="status"
          aria-live="polite"
        >
          {copyNotice}
        </p>
      ) : null}
      {clearConfirmOpen
        ? createPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setClearConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={clearConfirmTitleId}
                aria-describedby={clearConfirmDescId}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id={clearConfirmTitleId}
                  className="select-research__reset-confirm-title"
                >
                  {t('sr_community_clear_confirm_title')}
                </h2>
                <p id={clearConfirmDescId} className="select-research__reset-confirm-desc">
                  {t('sr_community_clear_confirm')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setClearConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={handleConfirmClearWorkspace}
                  >
                    {t('sr_community_clear_workspace')}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
