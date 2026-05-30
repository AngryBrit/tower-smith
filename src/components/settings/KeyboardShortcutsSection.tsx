import { useI18n } from '../../i18n'

const SHORTCUT_KEYS = [
  'settings_shortcut_search',
  'settings_shortcut_undo',
  'settings_shortcut_escape',
  'settings_shortcut_tab_1',
  'settings_shortcut_tab_2',
  'settings_shortcut_tab_3',
  'settings_shortcut_tab_4',
  'settings_shortcut_tab_5',
  'settings_shortcut_tab_6',
  'settings_shortcut_tab_7',
  'settings_shortcut_tab_8',
] as const

export function KeyboardShortcutsSection() {
  const { t } = useI18n()

  return (
    <div className="settings-page__field settings-page__shortcuts">
      <h3 className="settings-page__shortcuts-title">{t('settings_shortcuts_title')}</h3>
      <p className="settings-page__hint">{t('settings_shortcuts_intro')}</p>
      <dl className="settings-page__shortcut-list">
        {SHORTCUT_KEYS.map((key) => (
          <div key={key} className="settings-page__shortcut-row">
            <dt>{t(`${key}_key`)}</dt>
            <dd>{t(`${key}_desc`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
