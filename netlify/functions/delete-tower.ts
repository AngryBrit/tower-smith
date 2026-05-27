import type { Config } from '@netlify/functions'
import { isGalleryBuildId } from '../../src/towerGallery/shareLink'
import { adminUserIdsConfigured, isAdminAuthorized } from './lib/adminAuth'
import { corsHeaders, jsonResponse } from './lib/http'
import { isGalleryBackendConfigured } from './lib/supabaseAdmin'
import { deleteTowerFromGallery } from './lib/supabaseGallery'

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }

  if (!isGalleryBackendConfigured()) {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  if (!adminUserIdsConfigured()) {
    return jsonResponse(503, { error: 'admin_not_configured' }, cors)
  }

  if (!(await isAdminAuthorized(req))) {
    return jsonResponse(401, { error: 'unauthorized' }, cors)
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')?.trim() ?? ''
  if (!isGalleryBuildId(id)) {
    return jsonResponse(400, { error: 'invalid_id' }, cors)
  }

  const removed = await deleteTowerFromGallery(id)
  if (!removed) {
    return jsonResponse(404, { error: 'not_found' }, cors)
  }

  return jsonResponse(200, { ok: true, id }, cors)
}

export const config: Config = {
  path: '/api/towers/delete',
}
