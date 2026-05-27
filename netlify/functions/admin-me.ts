import type { Config } from '@netlify/functions'
import { adminUserIdsConfigured, isAdminAuthorized } from './lib/adminAuth'
import {
  isGalleryBackendConfigured,
  verifySupabaseAccessToken,
} from './lib/supabaseAdmin'
import { corsHeaders, jsonResponse } from './lib/http'

function bearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization')?.trim()
  if (!auth?.toLowerCase().startsWith('bearer ')) return null
  const token = auth.slice(7).trim()
  return token.length > 0 ? token : null
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

  if (!adminUserIdsConfigured()) {
    return jsonResponse(503, { error: 'admin_not_configured' }, cors)
  }

  const token = bearerToken(req)
  if (!token) {
    return jsonResponse(401, { error: 'auth_required' }, cors)
  }

  const user = await verifySupabaseAccessToken(token)
  if (!user) {
    return jsonResponse(401, { error: 'invalid_token' }, cors)
  }

  const admin = await isAdminAuthorized(req)
  return jsonResponse(200, { admin, userId: user.id }, cors)
}

export const config: Config = {
  path: '/api/towers/admin/me',
}
