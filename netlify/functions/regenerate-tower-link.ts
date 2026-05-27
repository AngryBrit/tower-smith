import type { Config } from '@netlify/functions'
import { isGalleryBuildId } from '../../src/towerGallery/shareLink'
import { userFromBearer } from './lib/bearerAuth'
import { corsHeaders, jsonResponse } from './lib/http'
import { isGalleryBackendConfigured } from './lib/supabaseAdmin'
import { regenerateTowerLink } from './lib/supabaseGallery'

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

  const user = await userFromBearer(req)
  if (!user) {
    return jsonResponse(401, { error: 'auth_required' }, cors)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, cors)
  }
  const id = typeof (raw as { id?: unknown }).id === 'string' ? (raw as { id: string }).id.trim() : ''
  if (!isGalleryBuildId(id)) {
    return jsonResponse(400, { error: 'invalid_id' }, cors)
  }

  const entry = await regenerateTowerLink(id, user)
  if (!entry) {
    return jsonResponse(404, { error: 'not_found' }, cors)
  }
  return jsonResponse(200, { ok: true, entry }, cors)
}

export const config: Config = {
  path: '/api/towers/regenerate',
}
