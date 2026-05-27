import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth, type AuthProvider } from '../auth/AuthProvider'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

export type AuthSignInDialogProps = {
  open: boolean
  onClose: () => void
  titleKey?: StringId
  hintKey?: StringId
}

export function AuthSignInDialog({
  open,
  onClose,
  titleKey = 'auth_sign_in',
  hintKey = 'auth_required_publish',
}: AuthSignInDialogProps) {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const handleSignIn = (provider: AuthProvider) => {
    void (async () => {
      setBusy(true)
      try {
        await signIn(provider)
      } catch {
        setBusy(false)
      }
    })()
  }

  return createPortal(
    <div
      className="select-research__preset-save-backdrop"
      role="presentation"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="select-research__preset-save-dialog auth-sign-in-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-sign-in-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="auth-sign-in-dialog-title"
          className="select-research__preset-save-title"
        >
          {t(titleKey)}
        </h2>
        <p className="select-research__preset-save-hint">{t(hintKey)}</p>
        <div className="auth-sign-in-dialog__actions">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy}
            onClick={() => handleSignIn('google')}
          >
            {t('auth_sign_in_google')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy}
            onClick={() => handleSignIn('discord')}
          >
            {t('auth_sign_in_discord')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy}
            onClick={onClose}
          >
            {t('sr_cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
