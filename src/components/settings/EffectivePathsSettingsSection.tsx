import { useEffect, useId, useState } from 'react'
import { deferInEffect } from '../../deferInEffect'
import { useAuth } from '../../auth/useAuth'
import { googleSheetsOAuthConfigured } from '../../effectivePaths/googleSheetsOAuth'
import { useStoredSpreadsheetRef } from '../../effectivePaths/useStoredSpreadsheetRef'
import { persistEffectivePathsIdsMasterRef } from '../../effectivePaths/syncEffectivePathsIdsMasterRef'
import { useI18n } from '../../i18n'

type EffectivePathsSettingsFieldsProps = {
  userId: string | null
}

function EffectivePathsSettingsFields({ userId }: EffectivePathsSettingsFieldsProps) {
  const { t } = useI18n()
  const inputId = useId()
  const { spreadsheetRef: savedRef } = useStoredSpreadsheetRef(userId)
  const [draft, setDraft] = useState(savedRef)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null)

  useEffect(() => {
    deferInEffect(() => setDraft(savedRef))
  }, [savedRef])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const dirty = draft.trim() !== savedRef.trim()

  const handleSave = () => {
    void (async () => {
      if (!dirty) return
      setSaving(true)
      setNotice(null)
      const result = await persistEffectivePathsIdsMasterRef(userId, draft)
      setSaving(false)
      if (!result.ok) {
        if (result.error === 'invalid_effective_paths_ids_master_ref') {
          setNotice({ message: t('app_settings_ep_ids_master_save_invalid'), error: true })
        } else {
          setNotice({ message: t('app_settings_ep_ids_master_save_failed'), error: true })
        }
        return
      }
      setNotice({ message: t('app_settings_ep_ids_master_saved') })
    })()
  }

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
        value={draft}
        placeholder={t('app_settings_ep_ids_master_placeholder')}
        autoComplete="off"
        spellCheck={false}
        disabled={saving}
        onChange={(e) => setDraft(e.target.value)}
      />
      <p className="settings-page__hint">{t('app_settings_ep_ids_master_hint')}</p>
      <button
        type="button"
        className="glow-btn glow-btn--block profile-settings__save"
        disabled={!dirty || saving}
        onClick={handleSave}
      >
        {saving ? t('app_settings_ep_ids_master_saving') : t('app_settings_ep_ids_master_save_btn')}
      </button>
      {notice ? (
        <p
          className={`profile-settings__notice${
            notice.error ? ' settings-page__hint--error' : ''
          }`}
          role="status"
        >
          {notice.message}
        </p>
      ) : null}
    </div>
  )
}

export function EffectivePathsSettingsSection() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  if (!googleSheetsOAuthConfigured()) return null

  return <EffectivePathsSettingsFields key={userId ?? 'anon'} userId={userId} />
}
