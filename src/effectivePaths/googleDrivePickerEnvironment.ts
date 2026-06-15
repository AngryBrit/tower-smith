import { publicAppOrigin } from '../devOrigin'

const PICKER_OAUTH_CALLBACK_PATH = '/oauth/google-drive-picker'

/**
 * Primary flow is GIS OAuth + inline JS Picker on all platforms.
 * One-pick redirect is only used when the JS Picker fails (see effectivePathsJsPickerFallback).
 */
export function shouldUsePickerOAuthRedirectFlow(): boolean {
  return false
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
