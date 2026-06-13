import { getSupabaseBrowserClient } from '../supabase/client'

/** Refresh Supabase session before account sync API calls. */
export async function refreshAccessTokenForSync(): Promise<string | null> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return null

  const { data: refreshed, error } = await sb.auth.refreshSession()
  if (!error && refreshed.session?.access_token) {
    return refreshed.session.access_token
  }

  const { data: current } = await sb.auth.getSession()
  return current.session?.access_token ?? null
}
