import {
  decodeLabsShareQueryValue,
  isLabsShareFile,
  TOWER_SHARE_SEARCH_PARAM,
  type LabsShareFile,
} from './labsShareCodec'
import { sanitizeLevelOverrides } from './labLevelOverridesSanitize'
import {
  sanitizeWorkshopPersisted,
  type WorkshopPersistedV1,
} from './labPresetsStorage'
import type { ResearchData } from './types/research'
import { sanitizeThemeOwnedIds, type TowerThemesSnapshot } from './towerDataThemes'
import { getGalleryTower } from './towerGallery/api'
import { extractGalleryBuildIdFromText } from './towerGallery/shareLink'
import { parseTowerUnifiedCsv, towerUnifiedPrimaryBuild } from './towerUnifiedCsv'

export type ParseLabLevelsError =
  | 'empty'
  | 'share_decode_failed'
  | 'invalid_csv'
  | 'invalid_payload'

export type ParseLabLevelsResult =
  | {
      ok: true
      overrides: Record<string, number>
      workshop?: WorkshopPersistedV1
      themes?: TowerThemesSnapshot
    }
  | { ok: false; error: ParseLabLevelsError }

/** Extract `tower` query value from a pasted URL (percent-decoded). */
export function extractLabsShareEncodedFromText(text: string): string | null {
  const t = text.trim()
  const escaped = TOWER_SHARE_SEARCH_PARAM.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m =
    t.match(new RegExp(`[?&]${escaped}=([^&\\s#]+)`, 'i')) ??
    t.match(new RegExp(`^${escaped}=([^&\\s#]+)`, 'i'))
  const raw = m?.[1]?.trim()
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function packShareParse(
  data: ResearchData,
  dec: LabsShareFile,
): Extract<ParseLabLevelsResult, { ok: true }> {
  const overrides = sanitizeLevelOverrides(data, dec.o as Record<string, unknown>)
  const workshop =
    dec.w !== undefined ? sanitizeWorkshopPersisted(dec.w) : undefined
  const themes = dec.t
    ? { ownedIds: sanitizeThemeOwnedIds(dec.t.owned) }
    : undefined
  return {
    ok: true,
    overrides,
    ...(workshop !== undefined ? { workshop } : {}),
    ...(themes !== undefined ? { themes } : {}),
  }
}

/**
 * Parse a short gallery URL (`?build=…`), a page URL with `?tower=…`, a raw `u…` / `z…` share
 * payload, inline JSON `{ "v":4, … }`, or **tower CSV** (`tower_csv_v1` first line).
 */
export async function parseLabLevelsPayload(
  raw: string,
  data: ResearchData,
): Promise<ParseLabLevelsResult> {
  const text = raw.trim()
  if (!text) return { ok: false, error: 'empty' }

  const galleryBuildId = extractGalleryBuildIdFromText(text)
  if (galleryBuildId) {
    const gallery = await getGalleryTower(galleryBuildId)
    if (!gallery.ok) return { ok: false, error: 'share_decode_failed' }
    return packShareParse(data, gallery.record.payload)
  }

  const tower = parseTowerUnifiedCsv(text)
  if (tower.tag === 'invalid') return { ok: false, error: 'invalid_csv' }
  if (tower.tag === 'ok') {
    const primary = towerUnifiedPrimaryBuild(tower)
    return {
      ok: true,
      overrides: sanitizeLevelOverrides(
        data,
        primary.overrides as Record<string, unknown>,
      ),
      workshop: primary.workshop,
      ...(tower.themes ? { themes: tower.themes } : {}),
    }
  }

  if (text[0] === '{') {
    try {
      const j: unknown = JSON.parse(text)
      if (isLabsShareFile(j)) {
        return packShareParse(data, j)
      }
    } catch {
      return { ok: false, error: 'invalid_payload' }
    }
    return { ok: false, error: 'invalid_payload' }
  }

  const fromUrl = extractLabsShareEncodedFromText(text)
  if (fromUrl) {
    const dec = await decodeLabsShareQueryValue(fromUrl)
    if (!dec?.o) return { ok: false, error: 'share_decode_failed' }
    return packShareParse(data, dec)
  }

  if ((text[0] === 'u' || text[0] === 'z') && text.length >= 2) {
    const dec = await decodeLabsShareQueryValue(text)
    if (dec?.o) {
      return packShareParse(data, dec)
    }
    return { ok: false, error: 'share_decode_failed' }
  }

  if (text.includes(',')) {
    return { ok: false, error: 'invalid_csv' }
  }

  return { ok: false, error: 'invalid_payload' }
}
