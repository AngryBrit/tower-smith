const API_BASE =
  (import.meta.env.VITE_TOWER_GALLERY_API as string | undefined)?.replace(/\/$/, '') ??
  '/api'

export type GalleryAdminApiError =
  | 'network'
  | 'unauthorized'
  | 'auth_required'
  | 'admin_not_configured'
  | 'not_found'
  | 'gallery_unavailable'
  | 'unknown'

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function fetchGalleryAdminStatus(
  accessToken: string | null,
): Promise<
  | { ok: true; admin: boolean; userId: string }
  | { ok: false; error: GalleryAdminApiError }
> {
  if (!accessToken) {
    return { ok: false, error: 'auth_required' }
  }
  try {
    const res = await fetch(`${API_BASE}/towers/admin/me`, {
      headers: authHeaders(accessToken),
    })
    const body = await parseJsonResponse(res)
    if (res.status === 401) {
      const err = (body as { error?: string } | null)?.error
      if (err === 'auth_required' || err === 'invalid_token') {
        return { ok: false, error: 'auth_required' }
      }
      return { ok: false, error: 'unauthorized' }
    }
    if (res.status === 503) {
      const err = (body as { error?: string } | null)?.error
      if (err === 'admin_not_configured') {
        return { ok: false, error: 'admin_not_configured' }
      }
      if (err === 'gallery_unavailable') {
        return { ok: false, error: 'gallery_unavailable' }
      }
      return { ok: false, error: 'unknown' }
    }
    if (!res.ok) return { ok: false, error: 'unknown' }
    const admin = (body as { admin?: unknown }).admin === true
    const userId = (body as { userId?: unknown }).userId
    if (typeof userId !== 'string' || !userId) {
      return { ok: false, error: 'unknown' }
    }
    return { ok: true, admin, userId }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function deleteGalleryTowerAsAdmin(
  id: string,
  accessToken: string,
): Promise<{ ok: true } | { ok: false; error: GalleryAdminApiError }> {
  try {
    const res = await fetch(
      `${API_BASE}/towers/delete?id=${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: authHeaders(accessToken),
      },
    )
    if (res.status === 401) return { ok: false, error: 'unauthorized' }
    if (res.status === 404) return { ok: false, error: 'not_found' }
    if (res.status === 503) {
      const body = await parseJsonResponse(res)
      const err = (body as { error?: string } | null)?.error
      if (err === 'admin_not_configured') {
        return { ok: false, error: 'admin_not_configured' }
      }
      return { ok: false, error: 'unknown' }
    }
    if (!res.ok) return { ok: false, error: 'unknown' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}
