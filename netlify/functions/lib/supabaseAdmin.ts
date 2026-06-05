import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { jwtProjectRef } from './jwtProjectRef'

const TOWER_PAYLOADS_BUCKET = 'tower-payloads'

export type AccessTokenVerification =
  | { ok: true; user: User }
  | { ok: false; error: 'invalid_token' | 'project_mismatch' }

export function galleryBackendProjectRef(): string | null {
  return jwtProjectRef(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '')
}

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

export async function verifySupabaseAccessTokenDetailed(
  accessToken: string,
): Promise<AccessTokenVerification> {
  const tokenRef = jwtProjectRef(accessToken)
  const backendRef = galleryBackendProjectRef()
  if (tokenRef && backendRef && tokenRef !== backendRef) {
    return { ok: false, error: 'project_mismatch' }
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.getUser(accessToken)
  if (error || !data.user) return { ok: false, error: 'invalid_token' }
  return { ok: true, user: data.user }
}

export async function verifySupabaseAccessToken(
  accessToken: string,
): Promise<User | null> {
  const verified = await verifySupabaseAccessTokenDetailed(accessToken)
  return verified.ok ? verified.user : null
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
    (typeof meta?.avatar_url === 'string' && meta.avatar_url.trim()) ||
    (typeof meta?.picture === 'string' && meta.picture.trim()) ||
    (typeof meta?.photo_url === 'string' && meta.photo_url.trim()) ||
    null

  const { error } = await sb.from('profiles').insert({
    id: user.id,
    display_name: displayName,
    avatar_url: avatarUrl || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}
