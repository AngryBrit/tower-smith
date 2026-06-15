import { isLocalDevOrigin, publicAppOrigin } from '../devOrigin'

const PICKER_OAUTH_CALLBACK_PATH = '/oauth/google-drive-picker'

function isMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return true
  // iPadOS 13+ “desktop” Safari reports as Mac with touch.
  return navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent)
}

/**
 * Use Google one-pick OAuth redirect instead of the JS Picker overlay.
 * Production JS Picker often never renders (API key referrers, modal stacking); redirect is reliable.
 */
export function shouldUsePickerOAuthRedirectFlow(
  location: Pick<Location, 'origin' | 'hostname' | 'pathname' | 'search' | 'href'> = window.location,
): boolean {
  if (isMobileUserAgent()) return true
  return !isLocalDevOrigin(location)
}

/** @deprecated Use {@link shouldUsePickerOAuthRedirectFlow} */
export function isMobilePickerRedirectPreferred(): boolean {
  return shouldUsePickerOAuthRedirectFlow()
}

export function googlePickerOAuthCallbackPath(): string {
  return PICKER_OAUTH_CALLBACK_PATH
}

export function googlePickerOAuthRedirectUri(origin?: string): string {
  const base = origin ?? publicAppOrigin()
  return `${base}${PICKER_OAUTH_CALLBACK_PATH}`
}

export function isGooglePickerOAuthCallbackPath(pathname: string): boolean {
  return pathname === PICKER_OAUTH_CALLBACK_PATH
}
