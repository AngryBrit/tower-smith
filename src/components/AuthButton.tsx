import { useState } from 'react'
import { useAuth, type AuthProvider } from '../auth/AuthProvider'
import { supabaseBrowserConfigured } from '../supabase/client'
import { useI18n } from '../i18n'

export type AuthButtonProps = {
  /** Footer opens menu upward; nav opens downward and uses compact styling. */
  placement?: 'footer' | 'nav'
  onOpenSettings?: () => void
  onOpenMyBuilds?: () => void
}

export function AuthButton({
  placement = 'footer',
  onOpenSettings,
  onOpenMyBuilds,
}: AuthButtonProps) {
  const { t } = useI18n()
  const { configured, loading, user, displayName, avatarUrl, signIn, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isNav = placement === 'nav'
  const rootClass = isNav ? 'auth-button auth-button--nav' : 'auth-button'

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
      <span
        className={`${rootClass} auth-button--loading`}
        aria-live="polite"
      >
        {t('auth_loading')}
      </span>
    )
  }

  if (user) {
    const signedInLabel = displayName ?? user.email ?? t('auth_signed_in')
    const initial = signedInLabel.trim().charAt(0).toUpperCase() || '?'
    return (
      <div className={`${rootClass} auth-button--signed-in`}>
        <button
          type="button"
          className="auth-button__avatar-toggle"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label={signedInLabel}
          disabled={busy}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="auth-button__avatar"
              width={28}
              height={28}
            />
          ) : (
            <span className="auth-button__avatar-fallback" aria-hidden="true">
              {initial}
            </span>
          )}
        </button>
        {menuOpen ? (
          <div
            className={
              isNav
                ? 'auth-button__menu auth-button__menu--down'
                : 'auth-button__menu'
            }
            role="menu"
          >
            <span className="auth-button__menu-label" title={signedInLabel} role="presentation">
              {signedInLabel}
            </span>
            {onOpenMyBuilds ? (
              <button
                type="button"
                className="glow-btn glow-btn--block"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  onOpenMyBuilds()
                  setMenuOpen(false)
                }}
              >
                {t('auth_my_builds')}
              </button>
            ) : null}
            {onOpenSettings ? (
              <button
                type="button"
                className="glow-btn glow-btn--block"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  onOpenSettings()
                  setMenuOpen(false)
                }}
              >
                {t('app_nav_settings')}
              </button>
            ) : null}
            <button
              type="button"
              className="glow-btn glow-btn--block"
              role="menuitem"
              disabled={busy}
              onClick={handleSignOut}
            >
              {t('auth_sign_out')}
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <button
        type="button"
        className={
          isNav
            ? 'glow-btn auth-button__toggle auth-button__toggle--nav'
            : 'glow-btn glow-btn--block auth-button__toggle'
        }
        disabled={busy}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((o) => !o)}
      >
        {t('auth_sign_in')}
      </button>
      {menuOpen ? (
        <div
          className={
            isNav
              ? 'auth-button__menu auth-button__menu--down'
              : 'auth-button__menu'
          }
          role="menu"
        >
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
          <button
            type="button"
            className="glow-btn glow-btn--block"
            role="menuitem"
            disabled={busy}
            onClick={() => handleSignIn('twitch')}
          >
            {t('auth_sign_in_twitch')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
