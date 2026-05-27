import { isLabsShareFile, type LabsShareFile } from '../labsShareCodec'
import { sanitizeGalleryBuildCategory } from './buildCategories'
import {
  TOWER_GALLERY_MAX_AUTHOR_LEN,
  TOWER_GALLERY_MAX_GUILD_LEN,
  TOWER_GALLERY_MAX_PAYLOAD_BYTES,
  TOWER_GALLERY_MAX_TITLE_LEN,
  type GalleryBuildVisibility,
  type TowerGallerySubmitBody,
} from './types'

const LAB_KEY_RE = /^\d+-\d+$/

export function sanitizeGalleryTitle(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const t = raw.trim()
  if (t.length < 1 || t.length > TOWER_GALLERY_MAX_TITLE_LEN) return null
  return t
}

export function sanitizeGalleryAuthor(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw !== 'string') return undefined
  const a = raw.trim()
  if (a.length < 1 || a.length > TOWER_GALLERY_MAX_AUTHOR_LEN) return undefined
  return a
}

export function sanitizeGalleryGuild(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw !== 'string') return undefined
  const g = raw.trim()
  if (g.length < 1 || g.length > TOWER_GALLERY_MAX_GUILD_LEN) return undefined
  return g
}

export function sanitizeGalleryVisibility(raw: unknown): GalleryBuildVisibility {
  return raw === 'unlisted' ? 'unlisted' : 'public'
}

export function validateLabsSharePayload(payload: unknown): payload is LabsShareFile {
  if (!isLabsShareFile(payload)) return false
  const o = payload.o
  let count = 0
  for (const [key, val] of Object.entries(o)) {
    if (!LAB_KEY_RE.test(key)) return false
    if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) return false
    count++
    if (count > 8000) return false
  }
  if (payload.t) {
    const owned = payload.t.owned
    if (!Array.isArray(owned) || owned.length > 500) return false
    for (const id of owned) {
      if (typeof id !== 'string' || id.length > 120) return false
    }
  }
  if (payload.n !== undefined) {
    if (typeof payload.n !== 'string' || payload.n.length > 120) return false
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload)).byteLength
  if (bytes > TOWER_GALLERY_MAX_PAYLOAD_BYTES) return false
  return true
}

export function parseTowerGallerySubmitBody(
  raw: unknown,
): { ok: true; body: TowerGallerySubmitBody } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'invalid_body' }
  }
  const title = sanitizeGalleryTitle((raw as { title?: unknown }).title)
  if (!title) return { ok: false, error: 'invalid_title' }
  const category = sanitizeGalleryBuildCategory((raw as { category?: unknown }).category)
  if (!category) return { ok: false, error: 'invalid_category' }
  const visibility = sanitizeGalleryVisibility((raw as { visibility?: unknown }).visibility)
  const author = sanitizeGalleryAuthor((raw as { author?: unknown }).author)
  const guildRaw = (raw as { guild?: unknown }).guild
  const guild = sanitizeGalleryGuild(guildRaw)
  if (guildRaw !== undefined && guild === undefined) {
    return { ok: false, error: 'invalid_guild' }
  }
  const payload = (raw as { payload?: unknown }).payload
  if (!validateLabsSharePayload(payload)) {
    return { ok: false, error: 'invalid_payload' }
  }
  return {
    ok: true,
    body: {
      title,
      category,
      visibility,
      ...(author ? { author } : {}),
      ...(guild ? { guild } : {}),
      payload,
    },
  }
}
