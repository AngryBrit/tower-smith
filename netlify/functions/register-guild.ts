import type { Config } from '@netlify/functions'
import { bearerToken } from './lib/bearerAuth'
import { corsHeaders, jsonResponse } from './lib/http'
import {
  getSupabaseAdmin,
  isGalleryBackendConfigured,
  verifySupabaseAccessToken,
} from './lib/supabaseAdmin'

type RegisterGuildBody = {
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
  if (req.method !== 'POST') {
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
  const body = raw as Partial<RegisterGuildBody>
  const guildId = sanitizeGuildValue(body.id)
  const guildName = sanitizeGuildValue(body.name)
  if (!guildId || !guildName) {
    return jsonResponse(400, { error: 'invalid_guild' }, cors)
  }

  const sb = getSupabaseAdmin()
  const { data: existing, error: existingError } = await sb
    .from('guild_identities')
    .select('guild_name')
    .eq('guild_id', guildId)
    .maybeSingle()
  if (existingError) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }
  if (typeof existing?.guild_name === 'string' && existing.guild_name.trim()) {
    return jsonResponse(200, { id: guildId, name: existing.guild_name.trim() }, cors)
  }

  const { error: insertError } = await sb.from('guild_identities').insert({
    guild_id: guildId,
    guild_name: guildName,
    source: 'user',
  })
  if (insertError) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  return jsonResponse(201, { id: guildId, name: guildName }, cors)
}

export const config: Config = {
  path: '/api/guilds/register',
}
