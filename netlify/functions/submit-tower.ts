import type { Config } from '@netlify/functions'
import { parseTowerGallerySubmitBody } from '../../src/towerGallery/validate'
import type { TowerGalleryIndexEntry, TowerGalleryRecord } from '../../src/towerGallery/types'
import { corsHeaders, jsonResponse } from './lib/http'
import { writeTowerRecord } from './lib/supabaseGallery'
import { bearerToken } from './lib/bearerAuth'
import {
  ensureProfileForUser,
  getSupabaseAdmin,
  isGalleryBackendConfigured,
  verifySupabaseAccessTokenDetailed,
} from './lib/supabaseAdmin'

function submissionsDisabled(): boolean {
  return process.env.TOWER_GALLERY_SUBMIT_DISABLED === '1'
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

  if (submissionsDisabled()) {
    return jsonResponse(503, { error: 'submissions_disabled' }, cors)
  }

  const token = bearerToken(req)
  if (!token) {
    return jsonResponse(401, { error: 'auth_required' }, cors)
  }
  const verified = await verifySupabaseAccessTokenDetailed(token)
  if (!verified.ok) {
    return jsonResponse(
      401,
      { error: verified.error },
      cors,
    )
  }
  const user = verified.user

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, cors)
  }

  const parsed = parseTowerGallerySubmitBody(raw)
  if (!parsed.ok) {
    return jsonResponse(400, { error: parsed.error }, cors)
  }

  const { title, category, guild, visibility, payload } = parsed.body
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await ensureProfileForUser(user)

  const sb = getSupabaseAdmin()
  const { data: profile } = await sb
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const displayAuthor =
    typeof profile?.display_name === 'string'
      ? profile.display_name.trim()
      : undefined
  const authorAvatarUrl =
    typeof profile?.avatar_url === 'string' ? profile.avatar_url.trim() : undefined

  const entry: TowerGalleryIndexEntry = {
    id,
    title,
    category,
    ...(guild ? { guild } : {}),
    createdAt,
    upvoteCount: 0,
    ...(displayAuthor ? { author: displayAuthor } : {}),
    ...(authorAvatarUrl ? { authorAvatarUrl } : {}),
  }

  const record: TowerGalleryRecord = { ...entry, payload }

  try {
    await writeTowerRecord(record, user, { visibility })
  } catch {
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  return jsonResponse(201, { ok: true, entry }, cors)
}

export const config: Config = {
  path: '/api/towers/submit',
}
