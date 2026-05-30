import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { useModulesCatalogVisible } from '../modulesCatalogVisibility'
import { useAssistModuleCatalogVisible } from '../assistModuleCatalogVisibility'
import { useRelicWorkshopBonusLinesVisible } from '../relicWorkshopBonusLinesVisibility'
import { useSubmodulesCatalogVisible } from '../submodulesCatalogVisibility'
import { useState } from 'react'
import { useColorScheme } from '../colorSchemeContext'
import type { ColorSchemePreference } from '../colorSchemePreference'
import { useI18n, type AppLocale } from '../i18n'
import { InstallAppPanel } from './InstallAppPanel'
import { KeyboardShortcutsSection } from './settings/KeyboardShortcutsSection'
import { WikiDataStampNotice } from './settings/WikiDataStampNotice'

type SettingsPageProps = {
  onRefreshResearch?: () => void | Promise<void>
  researchRefreshing?: boolean
}

export function SettingsPage({
  onRefreshResearch,
  researchRefreshing = false,
}: SettingsPageProps) {
  const { t, locale, setLocale } = useI18n()
  const { preference: colorScheme, setPreference: setColorScheme } = useColorScheme()
  const [refreshError, setRefreshError] = useState<string | null>(null)
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

      <KeyboardShortcutsSection />
      <hr className="settings-page__divider" aria-hidden />

      {onRefreshResearch ? (
        <div className="settings-page__field">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={researchRefreshing}
            onClick={() => {
              setRefreshError(null)
              void Promise.resolve(onRefreshResearch()).catch((e: unknown) => {
                setRefreshError(e instanceof Error ? e.message : String(e))
              })
            }}
          >
            {researchRefreshing
              ? t('app_settings_refresh_research_busy')
              : t('app_settings_refresh_research_label')}
          </button>
          <p className="settings-page__hint">{t('app_settings_refresh_research_hint')}</p>
          {refreshError ? (
            <p className="settings-page__hint settings-page__hint--error" role="alert">
              {refreshError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="settings-page__field">
        <label className="settings-page__label" htmlFor="settings-color-scheme-select">
          {t('app_settings_color_scheme_label')}
        </label>
        <select
          id="settings-color-scheme-select"
          className="select-research__header-locale-select settings-page__locale-select"
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value as ColorSchemePreference)}
          aria-label={t('app_settings_color_scheme_aria')}
        >
          <option value="dark">{t('app_settings_color_scheme_dark')}</option>
          <option value="light">{t('app_settings_color_scheme_light')}</option>
          <option value="high-contrast">{t('app_settings_color_scheme_high_contrast')}</option>
        </select>
        <p className="settings-page__hint">{t('app_settings_color_scheme_hint')}</p>
      </div>

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

      <WikiDataStampNotice />
    </div>
  )
}
