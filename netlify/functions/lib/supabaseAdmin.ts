import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

const TOWER_PAYLOADS_BUCKET = 'tower-payloads'

let adminClient: SupabaseClient | null = null

export function isGalleryBackendConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!isGalleryBackendConfigured()) {
    throw new Error('supabase_not_configured')
  }
  if (!adminClient) {
    adminClient = createClient(
      process.env.SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
  }
  return adminClient
}

export function towerPayloadsBucket(): string {
  return TOWER_PAYLOADS_BUCKET
}

export async function verifySupabaseAccessToken(
  accessToken: string,
): Promise<User | null> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.getUser(accessToken)
  if (error || !data.user) return null
  return data.user
}

export async function ensureProfileForUser(user: User): Promise<void> {
  const sb = getSupabaseAdmin()
  const { data: existing } = await sb
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) return

  const meta = user.user_metadata as Record<string, unknown> | undefined
  const displayName =
    (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta?.name === 'string' && meta.name.trim()) ||
    (typeof meta?.user_name === 'string' && meta.user_name.trim()) ||
    user.email?.split('@')[0] ||
    'Player'
  const avatarUrl =
    typeof meta?.avatar_url === 'string' ? meta.avatar_url.trim() : null

  const { error } = await sb.from('profiles').insert({
    id: user.id,
    display_name: displayName,
    avatar_url: avatarUrl || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}
