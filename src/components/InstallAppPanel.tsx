import { useState } from 'react'
import { useI18n } from '../i18n'
import { usePwaInstall } from '../pwa/usePwaInstall'

export function InstallAppPanel() {
  const { t } = useI18n()
  const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall()
  const [busy, setBusy] = useState(false)

  if (isInstalled) {
    return (
      <div className="settings-page__field install-app-panel">
        <p className="install-app-panel__status">{t('app_install_installed')}</p>
        <p className="settings-page__hint">{t('app_install_installed_hint')}</p>
      </div>
    )
  }

  const handleInstall = () => {
    void (async () => {
      setBusy(true)
      try {
        await promptInstall()
      } finally {
        setBusy(false)
      }
    })()
  }

  return (
    <div className="settings-page__field install-app-panel">
      <h3 className="install-app-panel__title">{t('app_install_title')}</h3>
      <p className="settings-page__hint">{t('app_install_intro')}</p>

      {canInstall ? (
        <button
          type="button"
          className="glow-btn install-app-panel__btn"
          disabled={busy}
          onClick={handleInstall}
        >
          {t('app_install_button')}
        </button>
      ) : null}

      {isIos ? (
        <p className="settings-page__hint install-app-panel__ios-hint">
          {t('app_install_ios_hint')}
        </p>
      ) : !canInstall ? (
        <p className="settings-page__hint">{t('app_install_browser_hint')}</p>
      ) : null}
    </div>
  )
}
