import type { Config } from '@netlify/functions'
import { corsHeaders, jsonResponse } from './lib/http'
import { isGalleryBackendConfigured } from './lib/supabaseAdmin'
import { readTowerRecord } from './lib/supabaseGallery'

const ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
  const id = url.searchParams.get('id')?.trim() ?? ''
  if (!ID_RE.test(id)) {
    return jsonResponse(400, { error: 'invalid_id' }, cors)
  }

  const record = await readTowerRecord(id)
  if (!record) {
    return jsonResponse(404, { error: 'not_found' }, cors)
  }

  return jsonResponse(200, record, {
    ...cors,
    'Cache-Control': 'public, max-age=60',
  })
}

export const config: Config = {
  path: '/api/towers/get',
}
