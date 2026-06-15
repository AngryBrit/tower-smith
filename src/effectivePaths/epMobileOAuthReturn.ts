import { publicAppOrigin } from '../devOrigin'
import { isGooglePickerOAuthCallbackPath } from './googleDrivePickerEnvironment'

const OAUTH_QUERY_PARAMS = ['code', 'state', 'error', 'scope', 'authuser', 'prompt', 'picked_file_ids']

/** Never send the user back to the OAuth callback URL (that causes a redirect loop). */
export function safeAppReturnPath(preferred?: string | null): string {
  if (preferred) {
    try {
      const url = new URL(preferred)
      if (isGooglePickerOAuthCallbackPath(url.pathname)) {
        return `${url.origin}/`
      }
      for (const key of OAUTH_QUERY_PARAMS) {
        url.searchParams.delete(key)
      }
      return url.toString()
    } catch {
      /* ignore malformed URLs */
    }
  }
  return `${publicAppOrigin()}/`
}

/** When VITE_PUBLIC_APP_ORIGIN is set, start OAuth from that host so sessionStorage matches the callback. */
export function redirectToCanonicalOriginIfNeeded(): boolean {
  if (typeof window === 'undefined') return false
  const canonical = publicAppOrigin()
  if (window.location.origin === canonical) return false
  window.location.assign(
    `${canonical}${window.location.pathname}${window.location.search}${window.location.hash}`,
  )
  return true
}
