import type { Config } from '@netlify/functions'
import { parseAccountWorkspaceBackup } from '../../src/accountWorkspace/validate'
import { corsHeaders, jsonResponse } from './lib/http'
import { bearerToken } from './lib/bearerAuth'
import {
  ensureProfileForUser,
  isGalleryBackendConfigured,
  verifySupabaseAccessTokenDetailed,
} from './lib/supabaseAdmin'
import {
  mapAccountWorkspaceStorageError,
  readAccountWorkspaceBackup,
  writeAccountWorkspaceBackup,
} from './lib/supabaseAccountWorkspace'

async function ensureProfileSafe(user: Parameters<typeof ensureProfileForUser>[0]): Promise<void> {
  try {
    await ensureProfileForUser(user)
  } catch {
    /* profile row may already exist from a concurrent sign-up */
  }
}

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'GET' && req.method !== 'PUT') {
    return jsonResponse(405, { error: 'method_not_allowed' }, cors)
  }

  if (!isGalleryBackendConfigured()) {
    return jsonResponse(503, { error: 'sync_unavailable' }, cors)
  }

  const token = bearerToken(req)
  if (!token) {
    return jsonResponse(401, { error: 'auth_required' }, cors)
  }

  const verified = await verifySupabaseAccessTokenDetailed(token)
  if (!verified.ok) {
    return jsonResponse(401, { error: verified.error }, cors)
  }

  await ensureProfileSafe(verified.user)

  if (req.method === 'GET') {
    try {
      const backup = await readAccountWorkspaceBackup(verified.user.id)
      return jsonResponse(200, { ok: true, backup }, cors)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      return jsonResponse(503, { error: mapAccountWorkspaceStorageError(msg) }, cors)
    }
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonResponse(400, { error: 'invalid_payload' }, cors)
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return jsonResponse(400, { error: 'invalid_payload' }, cors)
  }

  const backup = parseAccountWorkspaceBackup((raw as { backup?: unknown }).backup)
  if (!backup) {
    return jsonResponse(400, { error: 'invalid_payload' }, cors)
  }

  try {
    await writeAccountWorkspaceBackup(verified.user.id, backup)
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'too_large') {
      return jsonResponse(413, { error: 'too_large' }, cors)
    }
    return jsonResponse(503, { error: mapAccountWorkspaceStorageError(msg) }, cors)
  }

  return jsonResponse(200, { ok: true }, cors)
}

export const config: Config = {
  path: '/api/account/workspace',
}
