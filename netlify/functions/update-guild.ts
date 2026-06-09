import type { Config } from '@netlify/functions'
import { bearerToken } from './lib/bearerAuth'
import { corsHeaders, jsonResponse } from './lib/http'
import {
  getSupabaseAdmin,
  isGalleryBackendConfigured,
  verifySupabaseAccessToken,
} from './lib/supabaseAdmin'

type UpdateGuildBody = {
  id: string
  name: string
}

function sanitizeGuildValue(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 40) return null
  return trimmed
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }
  if (req.method !== 'PATCH') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }
  if (!isGalleryBackendConfigured()) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  const token = bearerToken(req)
  if (!token) return jsonResponse(401, { error: 'auth_required' }, cors)
  const user = await verifySupabaseAccessToken(token)
  if (!user) return jsonResponse(401, { error: 'invalid_token' }, cors)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, cors)
  }
  const body = raw as Partial<UpdateGuildBody>
  const guildId = sanitizeGuildValue(body.id)
  const guildName = sanitizeGuildValue(body.name)
  if (!guildId || !guildName) {
    return jsonResponse(400, { error: 'invalid_guild' }, cors)
  }

  const sb = getSupabaseAdmin()
  const { data: profile, error: profileError } = await sb
    .from('profiles')
    .select('guild_id')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }
  const profileGuildId =
    typeof profile?.guild_id === 'string' ? profile.guild_id.trim() : ''
  if (!profileGuildId || profileGuildId !== guildId) {
    return jsonResponse(403, { error: 'forbidden' }, cors)
  }

  const { data: existing, error: existingError } = await sb
    .from('guild_identities')
    .select('guild_name, source')
    .eq('guild_id', guildId)
    .maybeSingle()
  if (existingError) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }
  if (!existing) {
    return jsonResponse(404, { error: 'not_found' }, cors)
  }
  if (existing.source !== 'user') {
    return jsonResponse(403, { error: 'forbidden' }, cors)
  }

  const previousName =
    typeof existing.guild_name === 'string' ? existing.guild_name.trim() : ''
  if (previousName === guildName) {
    return jsonResponse(200, { id: guildId, name: guildName }, cors)
  }

  const { error: updateError } = await sb
    .from('guild_identities')
    .update({ guild_name: guildName, updated_at: new Date().toISOString() })
    .eq('guild_id', guildId)
    .eq('source', 'user')
  if (updateError) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  if (previousName) {
    const { error: buildsError } = await sb
      .from('builds')
      .update({ guild: guildName })
      .eq('guild', previousName)
    if (buildsError) {
      console.warn('[guild] builds backfill failed:', buildsError.message)
    }
  }

  return jsonResponse(200, { id: guildId, name: guildName }, cors)
}

export const config: Config = {
  path: '/api/guilds/update',
}
