import { isLocalDevOrigin } from '../devOrigin'

type LocationLike = Pick<Location, 'origin' | 'pathname' | 'search' | 'hostname'>

/**
 * URL Supabase should send the browser to after OAuth.
 * Must exactly match an entry in Supabase → Auth → URL Configuration → Redirect URLs.
 */
export function oauthRedirectUrl(location: LocationLike = window.location): string {
  const { origin, pathname, search, hostname } = location

  // Local dev (localhost or LAN IP): use origin only (matches `http://host:port` or `http://host:port/**`).
  if (isLocalDevOrigin({ origin, pathname, search, hostname, href: '' })) {
    return origin
  }

  const path = pathname === '/' ? '' : pathname
  return `${origin}${path}${search}`
}
