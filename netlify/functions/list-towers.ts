import type { Config } from '@netlify/functions'
import {
  TOWER_GALLERY_LIST_PAGE_DEFAULT,
  TOWER_GALLERY_LIST_PAGE_MAX,
} from '../../src/towerGallery/types'
import { userFromBearer } from './lib/bearerAuth'
import { corsHeaders, jsonResponse } from './lib/http'
import { isGalleryBackendConfigured } from './lib/supabaseAdmin'
import { listGalleryEntriesPaginated } from './lib/supabaseGallery'

function parseLimit(raw: string | null): number {
  if (!raw) return TOWER_GALLERY_LIST_PAGE_DEFAULT
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return TOWER_GALLERY_LIST_PAGE_DEFAULT
  return Math.min(n, TOWER_GALLERY_LIST_PAGE_MAX)
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
  const limit = parseLimit(url.searchParams.get('limit'))
  const cursor = url.searchParams.get('cursor')?.trim() || null
  const q = url.searchParams.get('q')?.trim() || null
  const category = url.searchParams.get('category')?.trim() || null
  const sort = url.searchParams.get('sort')?.trim() || null
  const mine = url.searchParams.get('mine') === '1'
  const viewer = await userFromBearer(req)

  if (mine && !viewer) {
    return jsonResponse(401, { error: 'auth_required' }, cors)
  }

  let page
  try {
    page = await listGalleryEntriesPaginated(
      limit,
      cursor,
      q,
      category,
      sort,
      viewer?.id ?? null,
      mine,
    )
  } catch (err) {
    console.error('[gallery] list-towers failed:', err)
    return jsonResponse(503, { error: 'gallery_unavailable' }, cors)
  }

  return jsonResponse(
    200,
    {
      entries: page.entries,
      nextCursor: page.nextCursor,
    },
    {
      ...cors,
      'Cache-Control': viewer ? 'private, no-store' : 'public, max-age=15',
      Vary: 'Authorization',
    },
  )
}

export const config: Config = {
  path: '/api/towers',
}
