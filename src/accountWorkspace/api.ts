import { towerGalleryApiAvailable } from '../towerGallery/api'
import { parseAccountWorkspaceBackup } from './validate'
import type { AccountWorkspaceBackupV1 } from './types'

const API_BASE =
  (import.meta.env.VITE_TOWER_GALLERY_API as string | undefined)?.replace(/\/$/, '') ??
  '/api'

export type AccountWorkspaceApiError =
  | 'network'
  | 'sync_unavailable'
  | 'storage_unavailable'
  | 'auth_required'
  | 'invalid_token'
  | 'project_mismatch'
  | 'invalid_payload'
  | 'too_large'
  | 'unknown'

export function accountWorkspaceSyncAvailable(): boolean {
  return towerGalleryApiAvailable()
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

function errorFromStatus(status: number, body: unknown): AccountWorkspaceApiError {
  const code =
    body && typeof body === 'object' && 'error' in body
      ? String((body as { error?: unknown }).error)
      : ''
  if (code === 'auth_required') return 'auth_required'
  if (code === 'invalid_token') return 'invalid_token'
  if (code === 'project_mismatch') return 'project_mismatch'
  if (code === 'invalid_payload') return 'invalid_payload'
  if (code === 'too_large') return 'too_large'
  if (code === 'sync_unavailable') return 'sync_unavailable'
  if (code === 'storage_unavailable') return 'storage_unavailable'
  if (status === 401) return 'auth_required'
  if (status === 503) return 'sync_unavailable'
  return 'unknown'
}

export async function fetchAccountWorkspace(
  accessToken: string,
): Promise<
  | { ok: true; backup: AccountWorkspaceBackupV1 | null }
  | { ok: false; error: AccountWorkspaceApiError }
> {
  if (!accountWorkspaceSyncAvailable()) {
    return { ok: false, error: 'sync_unavailable' }
  }
  try {
    const res = await fetch(`${API_BASE}/account/workspace`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    const body = await parseJsonResponse(res)
    if (!res.ok) {
      return { ok: false, error: errorFromStatus(res.status, body) }
    }
    if (!body || typeof body !== 'object') {
      return { ok: false, error: 'unknown' }
    }
    const record = body as { backup?: unknown }
    if (record.backup == null) {
      return { ok: true, backup: null }
    }
    const parsed = parseAccountWorkspaceBackup(record.backup)
    if (!parsed) {
      return { ok: false, error: 'invalid_payload' }
    }
    return { ok: true, backup: parsed }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function saveAccountWorkspace(
  accessToken: string,
  backup: AccountWorkspaceBackupV1,
): Promise<{ ok: true } | { ok: false; error: AccountWorkspaceApiError }> {
  if (!accountWorkspaceSyncAvailable()) {
    return { ok: false, error: 'sync_unavailable' }
  }
  try {
    const res = await fetch(`${API_BASE}/account/workspace`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ backup }),
      cache: 'no-store',
    })
    const body = await parseJsonResponse(res)
    if (!res.ok) {
      return { ok: false, error: errorFromStatus(res.status, body) }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}
