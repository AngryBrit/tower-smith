import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../supabase/client'

const REFRESH_LEEWAY_MS = 60_000

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(sb: SupabaseClient): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const { data, error } = await sb.auth.refreshSession()
      if (error || !data.session?.access_token) return null
      return data.session.access_token
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export type ResolveAccessTokenOptions = {
  /** Re-fetch session from Supabase and refresh even if the cached token looks valid. */
  forceRefresh?: boolean
}

export async function resolveAccessToken(
  options?: ResolveAccessTokenOptions,
): Promise<string | null> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return null

  if (options?.forceRefresh) {
    if (refreshInFlight) await refreshInFlight
    return refreshAccessToken(sb)
  }

  const { data } = await sb.auth.getSession()
  const session = data.session
  if (!session?.access_token) return null

  const expiresAt = session.expires_at
  const needsRefresh =
    expiresAt == null || expiresAt * 1000 < Date.now() + REFRESH_LEEWAY_MS

  if (!needsRefresh) return session.access_token
  return refreshAccessToken(sb)
}
