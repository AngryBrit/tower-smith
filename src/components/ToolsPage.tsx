import { useCallback, useEffect, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { SelectResearchHandle } from '../lab/labToolsTypes'
import { performFullAppReset } from '../fullResetStorage'
import { supabaseBrowserConfigured } from '../supabase/client'
import { useI18n } from '../i18n'

type ToolsPageProps = {
  labToolsRef: RefObject<SelectResearchHandle | null>
}

function toolsOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

export function ToolsPage({ labToolsRef }: ToolsPageProps) {
  const { t } = useI18n()
  const showBackupInTools = !supabaseBrowserConfigured()
  const [fullResetConfirmOpen, setFullResetConfirmOpen] = useState(false)

  const openFullResetConfirm = useCallback(() => {
    setFullResetConfirmOpen(true)
  }, [])

  const performFullReset = useCallback(() => {
    setFullResetConfirmOpen(false)
    performFullAppReset()
  }, [])

  useEffect(() => {
    if (!fullResetConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setFullResetConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullResetConfirmOpen])

  return (
    <div className="tools-page" role="region" aria-label={t('app_tools_title')}>
      {showBackupInTools ? (
        <>
          <div className="tools-page__actions">
            <button
              type="button"
              className="glow-btn glow-btn--block"
              onClick={() => labToolsRef.current?.openLabDataPanel()}
            >
              {t('auth_tower_backup')}
            </button>
          </div>
          <hr className="tools-page__divider" aria-hidden />
        </>
      ) : null}
      <div className="tools-page__danger">
        <button
          type="button"
          className="glow-btn glow-btn--danger glow-btn--block"
          onClick={openFullResetConfirm}
          aria-label={t('app_tools_full_reset_aria')}
        >
          {t('app_tools_full_reset')}
        </button>
        <p className="tools-page__hint">{t('app_tools_full_reset_hint')}</p>
      </div>

      {fullResetConfirmOpen
        ? toolsOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setFullResetConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="full-reset-confirm-title"
                aria-describedby="full-reset-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="full-reset-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('app_tools_full_reset_confirm_title')}
                </h2>
                <p
                  id="full-reset-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {t('app_tools_full_reset_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setFullResetConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performFullReset}
                  >
                    {t('app_tools_full_reset_confirm_btn')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}
