import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { deferInEffect } from '../deferInEffect'
import { supabaseBrowserConfigured } from '../supabase/client'
import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_GUILD_MAX,
  removeUserAvatar,
  updateUserDisplayName,
  updateUserGuildId,
  uploadUserAvatar,
  type ProfileError,
} from '../profile/profileApi'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

function profileErrorId(error: ProfileError): StringId {
  switch (error) {
    case 'invalid_display_name':
      return 'profile_error_invalid_display_name'
    case 'display_name_taken':
      return 'profile_error_display_name_taken'
    case 'invalid_guild':
      return 'profile_error_invalid_guild'
    case 'invalid_avatar_type':
      return 'profile_error_invalid_avatar_type'
    case 'avatar_too_large':
      return 'profile_error_avatar_too_large'
    case 'network':
      return 'profile_error_network'
    case 'not_configured':
      return 'gallery_error_unavailable'
    default:
      return 'profile_error_unknown'
  }
}

export function ProfileSettings() {
  const { t } = useI18n()
  const { user, displayName, guildId, avatarUrl, refreshProfile } = useAuth()
  const nameInputId = useId()
  const guildInputId = useId()
  const avatarInputId = useId()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [nameDraft, setNameDraft] = useState('')
  const [guildDraft, setGuildDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingGuild, setSavingGuild] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    deferInEffect(() => setNameDraft(displayName ?? ''))
  }, [displayName])

  useEffect(() => {
    deferInEffect(() => setGuildDraft(guildId ?? ''))
  }, [guildId])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  if (!supabaseBrowserConfigured() || !user) {
    return null
  }

  const nameDirty = nameDraft.trim() !== (displayName ?? '').trim()
  const guildDirty = guildDraft.trim() !== (guildId ?? '').trim()
  const avatarInitial = (displayName ?? user.email ?? '?').trim().charAt(0).toUpperCase()

  const handleSaveGuild = () => {
    void (async () => {
      if (!guildDirty) return
      setSavingGuild(true)
      setNotice(null)
      const result = await updateUserGuildId(user.id, guildDraft)
      setSavingGuild(false)
      if (!result.ok) {
        setNotice(t(profileErrorId(result.error)))
        return
      }
      await refreshProfile()
      setNotice(t('profile_notice_guild_saved'))
    })()
  }

  const handleSaveName = () => {
    void (async () => {
      if (!nameDirty) return
      setSavingName(true)
      setNotice(null)
      const result = await updateUserDisplayName(user.id, nameDraft)
      setSavingName(false)
      if (!result.ok) {
        setNotice(t(profileErrorId(result.error)))
        return
      }
      await refreshProfile()
      setNotice(t('profile_notice_name_saved'))
    })()
  }

  const handleAvatarChange = (file: File | null) => {
    if (!file) return
    void (async () => {
      setUploadingAvatar(true)
      setNotice(null)
      const result = await uploadUserAvatar(user.id, file)
      setUploadingAvatar(false)
      if (!result.ok) {
        setNotice(t(profileErrorId(result.error)))
        return
      }
      await refreshProfile()
      setNotice(t('profile_notice_avatar_saved'))
    })()
  }

  const handleRemoveAvatar = () => {
    void (async () => {
      setUploadingAvatar(true)
      setNotice(null)
      const result = await removeUserAvatar(user.id)
      setUploadingAvatar(false)
      if (!result.ok) {
        setNotice(t(profileErrorId(result.error)))
        return
      }
      await refreshProfile()
      setNotice(t('profile_notice_avatar_removed'))
    })()
  }

  return (
    <section className="profile-settings" aria-labelledby="profile-settings-title">
      <h3 id="profile-settings-title" className="profile-settings__title">
        {t('profile_settings_title')}
      </h3>
      <p className="profile-settings__intro">{t('profile_settings_intro')}</p>

      <div className="profile-settings__avatar-row">
        <div className="profile-settings__avatar-preview" aria-hidden>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="profile-settings__avatar-image"
              width={64}
              height={64}
            />
          ) : (
            <span className="profile-settings__avatar-placeholder">{avatarInitial}</span>
          )}
        </div>
        <div className="profile-settings__avatar-actions">
          <label className="glow-btn profile-settings__avatar-upload" htmlFor={avatarInputId}>
            {uploadingAvatar ? t('profile_avatar_uploading') : t('profile_avatar_upload_btn')}
          </label>
          <input
            ref={avatarInputRef}
            id={avatarInputId}
            type="file"
            className="visually-hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploadingAvatar}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              handleAvatarChange(file)
              e.target.value = ''
            }}
          />
          {avatarUrl ? (
            <button
              type="button"
              className="glow-btn glow-btn--danger profile-settings__avatar-remove"
              disabled={uploadingAvatar}
              onClick={handleRemoveAvatar}
            >
              {t('profile_avatar_remove_btn')}
            </button>
          ) : null}
          <p className="profile-settings__hint">{t('profile_avatar_hint')}</p>
        </div>
      </div>

      <div className="profile-settings__field">
        <label className="profile-settings__label" htmlFor={nameInputId}>
          {t('profile_display_name_label')}
        </label>
        <input
          id={nameInputId}
          type="text"
          className="glow-input profile-settings__input"
          value={nameDraft}
          maxLength={PROFILE_DISPLAY_NAME_MAX}
          autoComplete="nickname"
          disabled={savingName}
          onChange={(e) => setNameDraft(e.target.value)}
        />
        <p className="profile-settings__hint">{t('profile_display_name_hint')}</p>
        <button
          type="button"
          className="glow-btn glow-btn--block profile-settings__save"
          disabled={!nameDirty || savingName || nameDraft.trim().length < 1}
          onClick={handleSaveName}
        >
          {savingName ? t('profile_display_name_saving') : t('profile_display_name_save_btn')}
        </button>
      </div>

      <div className="profile-settings__field">
        <label className="profile-settings__label" htmlFor={guildInputId}>
          {t('profile_guild_label')}
        </label>
        <input
          id={guildInputId}
          type="text"
          className="glow-input profile-settings__input"
          value={guildDraft}
          maxLength={PROFILE_GUILD_MAX}
          autoComplete="organization"
          disabled={savingGuild}
          onChange={(e) => setGuildDraft(e.target.value)}
        />
        <p className="profile-settings__hint">{t('profile_guild_hint')}</p>
        <button
          type="button"
          className="glow-btn glow-btn--block profile-settings__save"
          disabled={!guildDirty || savingGuild}
          onClick={handleSaveGuild}
        >
          {savingGuild ? t('profile_guild_saving') : t('profile_guild_save_btn')}
        </button>
      </div>

      {notice ? (
        <p className="profile-settings__notice" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  )
}
