import { useState } from 'react'
import { useAuth, type AuthProvider } from '../auth/AuthProvider'
import { supabaseBrowserConfigured } from '../supabase/client'
import { useI18n } from '../i18n'

export function AuthButton() {
  const { t } = useI18n()
  const { configured, loading, user, displayName, avatarUrl, signIn, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (!supabaseBrowserConfigured() || !configured) {
    return null
  }

  const handleSignIn = (provider: AuthProvider) => {
    void (async () => {
      setBusy(true)
      try {
        await signIn(provider)
      } finally {
        setBusy(false)
        setMenuOpen(false)
      }
    })()
  }

  const handleSignOut = () => {
    void (async () => {
      setBusy(true)
      try {
        await signOut()
      } finally {
        setBusy(false)
        setMenuOpen(false)
      }
    })()
  }

  if (loading) {
    return (
      <span className="auth-button auth-button--loading" aria-live="polite">
        {t('auth_loading')}
      </span>
    )
  }

  if (user) {
    return (
      <div className="auth-button auth-button--signed-in">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="auth-button__avatar"
            width={28}
            height={28}
          />
        ) : null}
        <span className="auth-button__label">
          {displayName ?? user.email ?? t('auth_signed_in')}
        </span>
        <button
          type="button"
          className="glow-btn auth-button__sign-out"
          disabled={busy}
          onClick={handleSignOut}
        >
          {t('auth_sign_out')}
        </button>
      </div>
    )
  }

  return (
    <div className="auth-button">
      <button
        type="button"
        className="glow-btn glow-btn--block auth-button__toggle"
        disabled={busy}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((o) => !o)}
      >
        {t('auth_sign_in')}
      </button>
      {menuOpen ? (
        <div className="auth-button__menu" role="menu">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            role="menuitem"
            disabled={busy}
            onClick={() => handleSignIn('google')}
          >
            {t('auth_sign_in_google')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--block"
            role="menuitem"
            disabled={busy}
            onClick={() => handleSignIn('discord')}
          >
            {t('auth_sign_in_discord')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
