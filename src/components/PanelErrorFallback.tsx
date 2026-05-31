import { useCallback, useState } from 'react'
import { buildPanelErrorReport } from '../panelErrorReport'
import type { MainPanel } from '../mainPanelStorage'
import { useI18n } from '../i18n'
import { BugBusterTrigger } from './BugBusterTrigger'

export type PanelErrorFallbackProps = {
  panelId: MainPanel
  panelLabel: string
  error: Error
  componentStack?: string | null
  onReload: () => void
}

export function PanelErrorFallback({
  panelId,
  panelLabel,
  error,
  componentStack,
  onReload,
}: PanelErrorFallbackProps) {
  const { t, fmt } = useI18n()
  const [copyNotice, setCopyNotice] = useState<string | null>(null)

  const handleCopy = useCallback(() => {
    const text = buildPanelErrorReport({
      panelId,
      panelLabel,
      error,
      componentStack,
    })
    void navigator.clipboard.writeText(text).then(
      () => {
        setCopyNotice(t('panel_error_copied'))
        window.setTimeout(() => setCopyNotice(null), 3000)
      },
      () => setCopyNotice(t('panel_error_copy_fail')),
    )
  }, [componentStack, error, panelId, panelLabel, t])

  return (
    <div className="panel-error-fallback" role="alert">
      <h2 className="panel-error-fallback__title">{t('panel_error_title')}</h2>
      <p className="panel-error-fallback__desc">
        {fmt.panelErrorDesc(panelLabel)}
      </p>
      <details className="panel-error-fallback__details">
        <summary>{t('panel_error_details_label')}</summary>
        <pre className="panel-error-fallback__message">{error.message}</pre>
      </details>
      <div className="panel-error-fallback__actions">
        <button type="button" className="glow-btn" onClick={onReload}>
          {t('panel_error_reload')}
        </button>
        <button type="button" className="glow-btn" onClick={handleCopy}>
          {t('panel_error_copy')}
        </button>
        <BugBusterTrigger
          className="glow-btn"
          labelKey="panel_error_report"
          initial={{
            category: 'crash',
            panelId,
            panelLabel,
            error,
            componentStack,
          }}
        />
      </div>
      {copyNotice ? (
        <p className="panel-error-fallback__notice" role="status">
          {copyNotice}
        </p>
      ) : null}
    </div>
  )
}
