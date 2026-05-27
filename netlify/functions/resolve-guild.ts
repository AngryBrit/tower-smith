import type { Config } from '@netlify/functions'
import { corsHeaders, jsonResponse } from './lib/http'
import { getSupabaseAdmin, isGalleryBackendConfigured } from './lib/supabaseAdmin'

function sanitizeGuildId(raw: string | null): string | null {
  const trimmed = raw?.trim() ?? ''
  if (!trimmed || trimmed.length > 40) return null
  return trimmed
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }
  if (req.method !== 'GET') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }
  if (!isGalleryBackendConfigured()) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  const url = new URL(req.url)
  const guildId = sanitizeGuildId(url.searchParams.get('id'))
  if (!guildId) {
    return jsonResponse(400, { error: 'invalid_guild_id' }, cors)
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('guild_identities')
    .select('guild_name')
    .eq('guild_id', guildId)
    .maybeSingle()

  if (error) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  const guildName = typeof data?.guild_name === 'string' ? data.guild_name.trim() : ''
  return jsonResponse(200, {
    id: guildId,
    name: guildName || null,
  }, cors)
}

export const config: Config = {
  path: '/api/guilds/resolve',
}
