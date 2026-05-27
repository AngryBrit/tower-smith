type LocationLike = Pick<Location, 'origin' | 'pathname' | 'search'>

/**
 * URL Supabase should send the browser to after OAuth.
 * Must exactly match an entry in Supabase → Auth → URL Configuration → Redirect URLs.
 */
export function oauthRedirectUrl(location: LocationLike = window.location): string {
  const { origin, pathname, search } = location

  // Local dev: use origin only (matches `http://localhost:5173` or `http://localhost:5173/**`).
  if (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  ) {
    return origin
  }

  const path = pathname === '/' ? '' : pathname
  return `${origin}${path}${search}`
}
