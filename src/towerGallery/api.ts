import type { GalleryBuildCategory } from './buildCategories'
import type {
  GalleryBuildVisibility,
  GalleryListSort,
  TowerGalleryIndexEntry,
  TowerGalleryRecord,
  TowerGallerySubmitBody,
} from './types'

const API_BASE =
  (import.meta.env.VITE_TOWER_GALLERY_API as string | undefined)?.replace(/\/$/, '') ??
  '/api'

export type TowerGalleryApiError =
  | 'network'
  | 'gallery_unavailable'
  | 'invalid_title'
  | 'invalid_guild'
  | 'invalid_category'
  | 'invalid_payload'
  | 'invalid_visibility'
  | 'submissions_disabled'
  | 'auth_required'
  | 'invalid_token'
  | 'project_mismatch'
  | 'cannot_vote_own'
  | 'votes_unavailable'
  | 'not_found'
  | 'unknown'

function normalizeIndexEntry(raw: TowerGalleryIndexEntry): TowerGalleryIndexEntry {
  const upvoteCount =
    typeof raw.upvoteCount === 'number' && raw.upvoteCount >= 0
      ? raw.upvoteCount
      : 0
  return {
    ...raw,
    upvoteCount,
    ...(raw.viewerVoted === true ? { viewerVoted: true } : {}),
    ...(raw.viewerOwns === true ? { viewerOwns: true } : {}),
    visibility: raw.visibility === 'unlisted' ? 'unlisted' : 'public',
  }
}

export function towerGalleryApiAvailable(): boolean {
  return import.meta.env.VITE_TOWER_GALLERY_DISABLED !== '1'
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export type GalleryListPageResult = {
  entries: TowerGalleryIndexEntry[]
  nextCursor: string | null
}

export async function listGalleryTowersPage(
  options?: {
    limit?: number
    cursor?: string | null
    q?: string
    category?: string
    sort?: GalleryListSort
    accessToken?: string | null
    mine?: boolean
  },
): Promise<
  | { ok: true; page: GalleryListPageResult }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const params = new URLSearchParams()
    if (options?.limit != null) {
      params.set('limit', String(options.limit))
    }
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    const q = options?.q?.trim()
    if (q) {
      params.set('q', q)
    }
    const category = options?.category?.trim()
    if (category) {
      params.set('category', category)
    }
    if (options?.sort === 'top') {
      params.set('sort', 'top')
    }
    if (options?.mine) {
      params.set('mine', '1')
    }
    const headers: Record<string, string> = {}
    if (options?.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`
    }
    const qs = params.toString()
    const res = await fetch(`${API_BASE}/towers${qs ? `?${qs}` : ''}`, {
      headers,
    })
    if (res.status === 404 || res.status === 502) {
      return { ok: false, error: 'gallery_unavailable' }
    }
    if (res.status === 401) {
      return { ok: false, error: 'auth_required' }
    }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const body = await parseJsonResponse(res)
    if (
      !body ||
      typeof body !== 'object' ||
      !Array.isArray((body as { entries?: unknown }).entries)
    ) {
      return { ok: false, error: 'unknown' }
    }
    const nextCursor = (body as { nextCursor?: unknown }).nextCursor
    return {
      ok: true,
      page: {
        entries: (body as { entries: TowerGalleryIndexEntry[] }).entries.map(
          normalizeIndexEntry,
        ),
        nextCursor:
          typeof nextCursor === 'string' && nextCursor.length > 0
            ? nextCursor
            : null,
      },
    }
  } catch {
    return { ok: false, error: 'network' }
  }
}

/** Fetches every page (use sparingly; prefer {@link listGalleryTowersPage}). */
export async function listGalleryTowers(): Promise<
  | { ok: true; entries: TowerGalleryIndexEntry[] }
  | { ok: false; error: TowerGalleryApiError }
> {
  const all: TowerGalleryIndexEntry[] = []
  let cursor: string | null = null
  for (let page = 0; page < 500; page++) {
    const result = await listGalleryTowersPage({ cursor })
    if (!result.ok) {
      if (page === 0) return result
      break
    }
    all.push(...result.page.entries)
    cursor = result.page.nextCursor
    if (!cursor) break
  }
  return { ok: true, entries: all }
}

export async function getGalleryTower(
  id: string,
): Promise<
  | { ok: true; record: TowerGalleryRecord }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const res = await fetch(
      `${API_BASE}/towers/get?id=${encodeURIComponent(id)}`,
    )
    if (res.status === 404) return { ok: false, error: 'not_found' }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const body = await parseJsonResponse(res)
    if (
      !body ||
      typeof body !== 'object' ||
      typeof (body as TowerGalleryRecord).id !== 'string' ||
      !(body as TowerGalleryRecord).payload
    ) {
      return { ok: false, error: 'unknown' }
    }
    return { ok: true, record: body as TowerGalleryRecord }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function submitGalleryTower(
  body: TowerGallerySubmitBody,
  accessToken?: string | null,
): Promise<
  | { ok: true; entry: TowerGalleryIndexEntry }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
    const res = await fetch(`${API_BASE}/towers/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const parsed = await parseJsonResponse(res)
    if (res.status === 400) {
      const err = (parsed as { error?: string } | null)?.error
      if (err === 'invalid_title') return { ok: false, error: 'invalid_title' }
      if (err === 'invalid_guild') return { ok: false, error: 'invalid_guild' }
      if (err === 'invalid_category') return { ok: false, error: 'invalid_category' }
      if (err === 'invalid_payload') return { ok: false, error: 'invalid_payload' }
      if (err === 'invalid_visibility') return { ok: false, error: 'invalid_visibility' }
      return { ok: false, error: 'unknown' }
    }
    if (res.status === 401) {
      const err = (parsed as { error?: string } | null)?.error
      if (err === 'auth_required') return { ok: false, error: 'auth_required' }
      if (err === 'invalid_token') return { ok: false, error: 'invalid_token' }
      if (err === 'project_mismatch') return { ok: false, error: 'project_mismatch' }
      return { ok: false, error: 'unknown' }
    }
    if (res.status === 503) {
      const err = (parsed as { error?: string } | null)?.error
      if (err === 'submissions_disabled') {
        return { ok: false, error: 'submissions_disabled' }
      }
      return { ok: false, error: 'unknown' }
    }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const entry = (parsed as { entry?: TowerGalleryIndexEntry } | null)?.entry
    if (!entry?.id) return { ok: false, error: 'unknown' }
    return { ok: true, entry: normalizeIndexEntry(entry) }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function toggleGalleryBuildVote(
  buildId: string,
  accessToken: string,
): Promise<
  | { ok: true; upvoteCount: number; viewerVoted: boolean }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const res = await fetch(`${API_BASE}/towers/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ buildId }),
    })
    const parsed = await parseJsonResponse(res)
    if (res.status === 401) {
      return { ok: false, error: 'auth_required' }
    }
    if (res.status === 404) {
      return { ok: false, error: 'not_found' }
    }
    if (res.status === 400) {
      const err = (parsed as { error?: string } | null)?.error
      if (err === 'cannot_vote_own') {
        return { ok: false, error: 'cannot_vote_own' }
      }
      if (err === 'votes_unavailable') {
        return { ok: false, error: 'votes_unavailable' }
      }
      return { ok: false, error: 'unknown' }
    }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const upvoteCount = (parsed as { upvoteCount?: unknown }).upvoteCount
    const viewerVoted = (parsed as { viewerVoted?: unknown }).viewerVoted
    if (
      typeof upvoteCount !== 'number' ||
      !Number.isInteger(upvoteCount) ||
      upvoteCount < 0 ||
      typeof viewerVoted !== 'boolean'
    ) {
      return { ok: false, error: 'unknown' }
    }
    return { ok: true, upvoteCount, viewerVoted }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function deleteGalleryTower(
  id: string,
  accessToken: string,
): Promise<{ ok: true } | { ok: false; error: TowerGalleryApiError }> {
  try {
    const res = await fetch(`${API_BASE}/towers/delete?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (res.status === 401) return { ok: false, error: 'auth_required' }
    if (res.status === 404) return { ok: false, error: 'not_found' }
    if (res.status === 503) return { ok: false, error: 'gallery_unavailable' }
    if (!res.ok) return { ok: false, error: 'unknown' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function setGalleryTowerVisibility(
  id: string,
  visibility: GalleryBuildVisibility,
  accessToken: string,
): Promise<
  | { ok: true; entry: TowerGalleryIndexEntry }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const res = await fetch(`${API_BASE}/towers/visibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, visibility }),
    })
    const parsed = await parseJsonResponse(res)
    if (res.status === 400) {
      const err = (parsed as { error?: string } | null)?.error
      if (err === 'invalid_visibility') return { ok: false, error: 'invalid_visibility' }
      return { ok: false, error: 'unknown' }
    }
    if (res.status === 401) return { ok: false, error: 'auth_required' }
    if (res.status === 404) return { ok: false, error: 'not_found' }
    if (res.status === 503) return { ok: false, error: 'gallery_unavailable' }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const entry = (parsed as { entry?: TowerGalleryIndexEntry } | null)?.entry
    if (!entry?.id) return { ok: false, error: 'unknown' }
    return { ok: true, entry: normalizeIndexEntry(entry) }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function setGalleryTowerCategory(
  id: string,
  category: GalleryBuildCategory,
  accessToken: string,
): Promise<
  | { ok: true; entry: TowerGalleryIndexEntry }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const res = await fetch(`${API_BASE}/towers/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, category }),
    })
    const parsed = await parseJsonResponse(res)
    if (res.status === 400) {
      const err = (parsed as { error?: string } | null)?.error
      if (err === 'invalid_category') return { ok: false, error: 'invalid_category' }
      return { ok: false, error: 'unknown' }
    }
    if (res.status === 401) return { ok: false, error: 'auth_required' }
    if (res.status === 404) return { ok: false, error: 'not_found' }
    if (res.status === 503) return { ok: false, error: 'gallery_unavailable' }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const entry = (parsed as { entry?: TowerGalleryIndexEntry } | null)?.entry
    if (!entry?.id) return { ok: false, error: 'unknown' }
    return { ok: true, entry: normalizeIndexEntry(entry) }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function regenerateGalleryTowerLink(
  id: string,
  accessToken: string,
): Promise<
  | { ok: true; entry: TowerGalleryIndexEntry }
  | { ok: false; error: TowerGalleryApiError }
> {
  try {
    const res = await fetch(`${API_BASE}/towers/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id }),
    })
    if (res.status === 401) return { ok: false, error: 'auth_required' }
    if (res.status === 404) return { ok: false, error: 'not_found' }
    if (res.status === 503) return { ok: false, error: 'gallery_unavailable' }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const parsed = await parseJsonResponse(res)
    const entry = (parsed as { entry?: TowerGalleryIndexEntry } | null)?.entry
    if (!entry?.id) return { ok: false, error: 'unknown' }
    return { ok: true, entry: normalizeIndexEntry(entry) }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function resolveGuildNameById(guildId: string): Promise<string | null> {
  const id = guildId.trim()
  if (!id || id.length > 40) return null
  try {
    const res = await fetch(`${API_BASE}/guilds/resolve?id=${encodeURIComponent(id)}`)
    if (!res.ok) return null
    const parsed = await parseJsonResponse(res)
    const name = (parsed as { name?: unknown } | null)?.name
    if (typeof name !== 'string') return null
    const trimmed = name.trim()
    return trimmed || null
  } catch {
    return null
  }
}

export async function registerGuildNameById(
  guildId: string,
  guildName: string,
  accessToken: string,
): Promise<string | null> {
  const id = guildId.trim()
  const name = guildName.trim()
  if (!id || id.length > 40 || !name || name.length > 40) return null
  try {
    const res = await fetch(`${API_BASE}/guilds/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, name }),
    })
    if (!res.ok) return null
    const parsed = await parseJsonResponse(res)
    const resolved = (parsed as { name?: unknown } | null)?.name
    if (typeof resolved !== 'string') return null
    const trimmed = resolved.trim()
    return trimmed || null
  } catch {
    return null
  }
}
