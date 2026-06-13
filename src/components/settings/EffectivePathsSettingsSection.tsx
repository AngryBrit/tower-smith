import { useId, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import {
  readStoredSpreadsheetRef,
  writeStoredSpreadsheetRef,
} from '../../effectivePaths/effectivePathsStorage'
import { googleSheetsOAuthConfigured } from '../../effectivePaths/googleSheetsOAuth'
import { useI18n } from '../../i18n'

type EffectivePathsSettingsFieldsProps = {
  userId: string | null
}

function EffectivePathsSettingsFields({ userId }: EffectivePathsSettingsFieldsProps) {
  const { t } = useI18n()
  const inputId = useId()
  const [spreadsheetRef, setSpreadsheetRef] = useState(() => readStoredSpreadsheetRef(userId))

  return (
    <div className="settings-page__field">
      <p className="settings-page__label settings-page__shortcuts-title">
        {t('app_settings_ep_section_title')}
      </p>
      <label className="settings-page__label" htmlFor={inputId}>
        {t('app_settings_ep_ids_master_label')}
      </label>
      <input
        id={inputId}
        className="glow-input settings-page__text-input"
        type="text"
        value={spreadsheetRef}
        placeholder={t('app_settings_ep_ids_master_placeholder')}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          const next = e.target.value
          setSpreadsheetRef(next)
          writeStoredSpreadsheetRef(next, userId)
        }}
      />
      <p className="settings-page__hint">{t('app_settings_ep_ids_master_hint')}</p>
    </div>
  )
}

export function EffectivePathsSettingsSection() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  if (!googleSheetsOAuthConfigured()) return null

  return <EffectivePathsSettingsFields key={userId ?? 'anon'} userId={userId} />
}
