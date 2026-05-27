import type { WorkshopPersistedV1 } from './labPresetsStorage'
import type { TowerThemesSnapshot } from './towerDataThemes'

/** Query param name for encoded share payloads (`?tower=…`). */
export const TOWER_SHARE_SEARCH_PARAM = 'tower'

export function readShareEncodedFromUrlSearchParams(
  params: URLSearchParams,
): string | null {
  return params.get(TOWER_SHARE_SEARCH_PARAM)
}

/** Remove share params from a URL after applying an imported link. */
export function clearShareEncodedFromUrl(url: URL): void {
  url.searchParams.delete(TOWER_SHARE_SEARCH_PARAM)
}

export type LabsShareFile = {
  v: 4
  o: Record<string, number>
  w?: unknown
  /** Optional saved build name for display when the link is opened. */
  n?: string
  /** Owned theme catalog IDs. */
  t?: { owned: string[] }
}

/**
 * Builds share URLs for the current share payload.
 * - **clean**: `origin` + `pathname` + `?tower=…` only (drops hash and other query params).
 * - **full**: current `href` with `tower` set (keeps other params and hash).
 */
export function buildLabsShareUrls(
  encoded: string,
  pageHref: string,
): { clean: string; full: string } {
  const full = new URL(pageHref)
  full.searchParams.set(TOWER_SHARE_SEARCH_PARAM, encoded)
  const clean = new URL(full.origin + full.pathname)
  clean.searchParams.set(TOWER_SHARE_SEARCH_PARAM, encoded)
  return { clean: clean.toString(), full: full.toString() }
}

/** Build share JSON (v4) for export, gallery submit, or clipboard. */
export function buildLabsShareFile(
  levelOverrides: Record<string, number>,
  workshop?: WorkshopPersistedV1,
  buildName?: string,
  themes?: TowerThemesSnapshot,
): LabsShareFile {
  const trimmedName = buildName?.trim()
  const includeName = trimmedName != null && trimmedName.length > 0
  const includeThemes = themes != null && themes.ownedIds.length > 0
  const includeWorkshop = workshop != null

  return {
    v: 4,
    o: levelOverrides,
    ...(includeWorkshop ? { w: workshop } : {}),
    ...(includeName ? { n: trimmedName } : {}),
    ...(includeThemes ? { t: { owned: themes.ownedIds } } : {}),
  }
}

export function isLabsShareFile(x: unknown): x is LabsShareFile {
  if (!x || typeof x !== 'object') return false
  const v = (x as { v?: unknown }).v
  const o = (x as { o?: unknown }).o
  if (v !== 4) return false
  if (o === null || typeof o !== 'object' || Array.isArray(o)) return false
  if ('w' in x) {
    const w = (x as { w?: unknown }).w
    if (w !== undefined && (w === null || typeof w !== 'object' || Array.isArray(w))) {
      return false
    }
  }
  if ('n' in x) {
    const n = (x as { n?: unknown }).n
    if (n !== undefined && typeof n !== 'string') return false
  }
  if ('t' in x) {
    const t = (x as { t?: unknown }).t
    if (t !== undefined && (t === null || typeof t !== 'object' || Array.isArray(t))) {
      return false
    }
  }
  return true
}

/** Satisfies `Blob` constructor typing for `Uint8Array` views on shared buffers. */
function uint8ToBlobPart(u8: Uint8Array): BlobPart {
  return u8.buffer.slice(
    u8.byteOffset,
    u8.byteOffset + u8.byteLength,
  ) as ArrayBuffer
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/**
 * Encodes lab overrides for use in `?tower=`. Uses raw DEFLATE when supported,
 * otherwise base64url JSON with an `u` prefix.
 */
export async function encodeLabsShareQueryValue(
  levelOverrides: Record<string, number>,
  workshop?: WorkshopPersistedV1,
  buildName?: string,
  themes?: TowerThemesSnapshot,
): Promise<string> {
  const file = buildLabsShareFile(levelOverrides, workshop, buildName, themes)
  const json = JSON.stringify(file)
  const bytes = new TextEncoder().encode(json)

  if (typeof CompressionStream === 'undefined') {
    return `u${toBase64Url(bytes)}`
  }

  const stream = new Blob([uint8ToBlobPart(bytes)])
    .stream()
    .pipeThrough(new CompressionStream('deflate'))
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer())
  const zBody = `z${toBase64Url(compressed)}`
  const uBody = `u${toBase64Url(bytes)}`
  return zBody.length < uBody.length ? zBody : uBody
}

export async function decodeLabsShareQueryValue(
  encoded: string,
): Promise<LabsShareFile | null> {
  const trimmed = encoded.trim()
  if (!trimmed) return null
  const mode = trimmed[0]
  const body = trimmed.slice(1)
  if (!body || (mode !== 'u' && mode !== 'z')) return null

  try {
    const rawBytes = fromBase64Url(body)
    let json: string
    if (mode === 'u') {
      json = new TextDecoder().decode(rawBytes)
    } else {
      if (typeof DecompressionStream === 'undefined') return null
      const stream = new Blob([uint8ToBlobPart(rawBytes)])
        .stream()
        .pipeThrough(new DecompressionStream('deflate'))
      json = await new Response(stream).text()
    }
    const parsed: unknown = JSON.parse(json)
    if (!isLabsShareFile(parsed)) return null
    return parsed
  } catch {
    return null
  }
}
