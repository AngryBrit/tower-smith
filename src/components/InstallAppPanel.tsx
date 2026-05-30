import { useState } from 'react'
import { useI18n } from '../i18n'
import { usePwaInstall } from '../pwa/PwaInstallProvider'

export function InstallAppPanel() {
  const { t } = useI18n()
  const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall()
  const [busy, setBusy] = useState(false)
  const [installNotice, setInstallNotice] = useState<string | null>(null)

  if (isInstalled) {
    return (
      <div className="settings-page__field install-app-panel">
        <p className="install-app-panel__status">{t('app_install_installed')}</p>
        <p className="settings-page__hint">{t('app_install_installed_hint')}</p>
      </div>
    )
  }

  const handleInstall = () => {
    setInstallNotice(null)
    void (async () => {
      setBusy(true)
      try {
        if (isIos) return
        const accepted = await promptInstall()
        if (!accepted) {
          setInstallNotice(t('app_install_browser_hint'))
        }
      } finally {
        setBusy(false)
      }
    })()
  }

  return (
    <div className="settings-page__field install-app-panel">
      <h3 className="install-app-panel__title">{t('app_install_title')}</h3>
      <p className="settings-page__hint">{t('app_install_intro')}</p>

      <button
        type="button"
        className="glow-btn install-app-panel__btn"
        disabled={busy || isIos}
        onClick={handleInstall}
      >
        {t('app_install_button')}
      </button>

      {installNotice ? (
        <p className="settings-page__hint" role="status">
          {installNotice}
        </p>
      ) : null}

      {isIos ? (
        <p className="settings-page__hint install-app-panel__ios-hint">
          {t('app_install_ios_hint')}
        </p>
      ) : !canInstall && !installNotice ? (
        <p className="settings-page__hint">{t('app_install_browser_hint')}</p>
      ) : null}
    </div>
  )
}
