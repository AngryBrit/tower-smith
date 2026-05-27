import type { Config } from '@netlify/functions'
import { userFromBearer } from './lib/bearerAuth'
import { corsHeaders, jsonResponse } from './lib/http'
import { isGalleryBackendConfigured } from './lib/supabaseAdmin'
import { toggleBuildVote } from './lib/supabaseGallery'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

  const buildId =
    raw &&
    typeof raw === 'object' &&
    typeof (raw as { buildId?: unknown }).buildId === 'string'
      ? (raw as { buildId: string }).buildId.trim()
      : ''

  if (!UUID_RE.test(buildId)) {
    return jsonResponse(400, { error: 'invalid_build_id' }, cors)
  }

  let result
  try {
    result = await toggleBuildVote(buildId, user)
  } catch {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : 400
    return jsonResponse(status, { error: result.error }, cors)
  }

  return jsonResponse(
    200,
    {
      upvoteCount: result.upvoteCount,
      viewerVoted: result.viewerVoted,
    },
    cors,
  )
}

export const config: Config = {
  path: '/api/towers/vote',
}
