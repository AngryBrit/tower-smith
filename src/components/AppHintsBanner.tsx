import { useCallback, useState } from 'react'
import { APP_VERSION, CHANGELOG_URL } from '../appVersion'
import {
  readFirstRunHintDismissed,
  shouldShowWhatsNewBanner,
  writeFirstRunHintDismissed,
  writeWhatsNewSeenVersion,
} from '../appHintsStorage'
import { getWhatsNewForVersion } from '../whatsNew'
import { useI18n } from '../i18n'

type AppHintsBannerProps = {
  onImportSave: () => void
  onBrowseBuilds: () => void
}

export function AppHintsBanner({ onImportSave, onBrowseBuilds }: AppHintsBannerProps) {
  const { t } = useI18n()
  const [firstRunVisible, setFirstRunVisible] = useState(() => !readFirstRunHintDismissed())
  const [whatsNewVisible, setWhatsNewVisible] = useState(
    () => readFirstRunHintDismissed() && shouldShowWhatsNewBanner(),
  )

  const whatsNew = getWhatsNewForVersion(APP_VERSION)

  const dismissFirstRun = useCallback(() => {
    writeFirstRunHintDismissed()
    setFirstRunVisible(false)
    if (shouldShowWhatsNewBanner()) {
      setWhatsNewVisible(true)
    }
  }, [])

  const dismissWhatsNew = useCallback(() => {
    writeWhatsNewSeenVersion()
    setWhatsNewVisible(false)
  }, [])

  if (!firstRunVisible && !(whatsNewVisible && whatsNew)) {
    return null
  }

  if (firstRunVisible) {
    return (
      <aside
        className="app-hints-banner app-hints-banner--first-run"
        role="region"
        aria-labelledby="app-first-run-hint-title"
      >
        <div className="app-hints-banner__head">
          <h2 id="app-first-run-hint-title" className="app-hints-banner__title">
            {t('app_first_run_title')}
          </h2>
          <button
            type="button"
            className="app-hints-banner__dismiss-icon"
            onClick={dismissFirstRun}
            aria-label={t('app_first_run_dismiss')}
          >
            ×
          </button>
        </div>
        <p className="app-hints-banner__body">{t('app_first_run_body')}</p>
        <div className="app-hints-banner__actions">
          <button type="button" className="glow-btn" onClick={onImportSave}>
            {t('app_first_run_import')}
          </button>
          <button type="button" className="glow-btn" onClick={onBrowseBuilds}>
            {t('app_first_run_gallery')}
          </button>
          <button type="button" className="glow-btn" onClick={dismissFirstRun}>
            {t('app_first_run_dismiss')}
          </button>
        </div>
      </aside>
    )
  }

  if (!whatsNew || !whatsNewVisible) {
    return null
  }

  return (
    <aside
      className="app-hints-banner app-hints-banner--whats-new"
      role="region"
      aria-labelledby="app-whats-new-title"
    >
      <div className="app-hints-banner__head">
        <h2 id="app-whats-new-title" className="app-hints-banner__title">
          {t(whatsNew.headline)}
        </h2>
        <button
          type="button"
          className="app-hints-banner__dismiss-icon"
          onClick={dismissWhatsNew}
          aria-label={t('whats_new_dismiss')}
        >
          ×
        </button>
      </div>
      {whatsNew.bodyItems ? (
        <ul className="app-hints-banner__body-list">
          {whatsNew.bodyItems.map((itemId) => (
            <li key={itemId}>{t(itemId)}</li>
          ))}
        </ul>
      ) : whatsNew.body ? (
        <p className="app-hints-banner__body">{t(whatsNew.body)}</p>
      ) : null}
      <div className="app-hints-banner__actions">
        <a
          href={CHANGELOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="glow-btn app-hints-banner__link"
        >
          {t('whats_new_changelog')}
        </a>
        <button type="button" className="glow-btn" onClick={dismissWhatsNew}>
          {t('whats_new_dismiss')}
        </button>
      </div>
    </aside>
  )
}
