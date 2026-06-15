const PICKER_OAUTH_CALLBACK_PATH = '/oauth/google-drive-picker'

/** Google Picker JS UI is unreliable on mobile browsers — use redirect one-pick instead. */
export function isMobilePickerRedirectPreferred(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function googlePickerOAuthCallbackPath(): string {
  return PICKER_OAUTH_CALLBACK_PATH
}

export function googlePickerOAuthRedirectUri(origin: string = window.location.origin): string {
  return `${origin}${PICKER_OAUTH_CALLBACK_PATH}`
}

export function isGooglePickerOAuthCallbackPath(pathname: string): boolean {
  return pathname === PICKER_OAUTH_CALLBACK_PATH
}
