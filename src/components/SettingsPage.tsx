import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { useModulesCatalogVisible } from '../modulesCatalogVisibility'
import { useAssistModuleCatalogVisible } from '../assistModuleCatalogVisibility'
import { useRelicWorkshopBonusLinesVisible } from '../relicWorkshopBonusLinesVisibility'
import { useSubmodulesCatalogVisible } from '../submodulesCatalogVisibility'
import { useI18n, type AppLocale } from '../i18n'
import { InstallAppPanel } from './InstallAppPanel'

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const [budgetPanelsVisible, setBudgetPanelsVisible] = useBudgetPanelsVisible()
  const [modulesCatalogVisible, setModulesCatalogVisible] = useModulesCatalogVisible()
  const [submodulesCatalogVisible, setSubmodulesCatalogVisible] =
    useSubmodulesCatalogVisible()
  const [assistModuleCatalogVisible, setAssistModuleCatalogVisible] =
    useAssistModuleCatalogVisible()
  const [relicWorkshopBonusLinesVisible, setRelicWorkshopBonusLinesVisible] =
    useRelicWorkshopBonusLinesVisible()

  return (
    <div className="settings-page" role="region" aria-label={t('app_settings_title')}>
      <InstallAppPanel />
      <hr className="settings-page__divider" aria-hidden />

      <div className="settings-page__field">
        <label className="settings-page__label" htmlFor="settings-locale-select">
          {t('app_settings_language_label')}
        </label>
        <select
          id="settings-locale-select"
          className="select-research__header-locale-select settings-page__locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as AppLocale)}
          aria-label={t('sr_locale_aria')}
        >
          <option value="en">{t('sr_locale_option_en')}</option>
          <option value="es">{t('sr_locale_option_es')}</option>
          <option value="de">{t('sr_locale_option_de')}</option>
        </select>
      </div>

      <div className="settings-page__field">
        <label className="glow-btn glow-btn--toggle settings-page__toggle">
          <input
            type="checkbox"
            checked={budgetPanelsVisible}
            onChange={(e) => setBudgetPanelsVisible(e.target.checked)}
          />
          {t('app_settings_budget_panels_label')}
        </label>
        <p className="settings-page__hint">{t('app_settings_budget_panels_hint')}</p>
      </div>

      <div className="settings-page__field">
        <label className="glow-btn glow-btn--toggle settings-page__toggle">
          <input
            type="checkbox"
            checked={modulesCatalogVisible}
            onChange={(e) => setModulesCatalogVisible(e.target.checked)}
          />
          {t('app_settings_modules_catalog_label')}
        </label>
        <p className="settings-page__hint">{t('app_settings_modules_catalog_hint')}</p>
      </div>

      <div className="settings-page__field">
        <label className="glow-btn glow-btn--toggle settings-page__toggle">
          <input
            type="checkbox"
            checked={submodulesCatalogVisible}
            onChange={(e) => setSubmodulesCatalogVisible(e.target.checked)}
          />
          {t('app_settings_submodules_catalog_label')}
        </label>
        <p className="settings-page__hint">{t('app_settings_submodules_catalog_hint')}</p>
      </div>

      <div className="settings-page__field">
        <label className="glow-btn glow-btn--toggle settings-page__toggle">
          <input
            type="checkbox"
            checked={assistModuleCatalogVisible}
            onChange={(e) => setAssistModuleCatalogVisible(e.target.checked)}
          />
          {t('app_settings_assist_wiki_label')}
        </label>
        <p className="settings-page__hint">{t('app_settings_assist_wiki_hint')}</p>
      </div>

      <div className="settings-page__field">
        <label className="glow-btn glow-btn--toggle settings-page__toggle">
          <input
            type="checkbox"
            checked={relicWorkshopBonusLinesVisible}
            onChange={(e) => setRelicWorkshopBonusLinesVisible(e.target.checked)}
          />
          {t('app_settings_relic_workshop_bonus_label')}
        </label>
        <p className="settings-page__hint">{t('app_settings_relic_workshop_bonus_hint')}</p>
      </div>
    </div>
  )
}
