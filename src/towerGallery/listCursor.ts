import type { GalleryListSort } from './types'

/** Keyset cursor for gallery list pagination. */

export type GalleryNewestCursor = {
  sort: 'newest'
  createdAt: string
  id: string
}

export type GalleryTopCursor = {
  sort: 'top'
  upvoteCount: number
  createdAt: string
  id: string
}

export type GalleryListCursor = GalleryNewestCursor | GalleryTopCursor

function encodePayload(payload: string): string {
  return btoa(payload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function decodePayload(raw: string): string | null {
  try {
    const padded = raw.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    return atob(padded + pad)
  } catch {
    return null
  }
}

export function encodeGalleryListCursor(cursor: GalleryListCursor): string {
  if (cursor.sort === 'newest') {
    return encodePayload(`n|${cursor.createdAt}|${cursor.id}`)
  }
  return encodePayload(`t|${cursor.upvoteCount}|${cursor.createdAt}|${cursor.id}`)
}

export function decodeGalleryListCursor(
  raw: string | null,
  expectedSort?: GalleryListSort,
): GalleryListCursor | null {
  if (!raw?.trim()) return null
  const decoded = decodePayload(raw.trim())
  if (!decoded) return null
  const parts = decoded.split('|')
  if (parts[0] === 'n' && parts.length === 3) {
    const createdAt = parts[1]
    const id = parts[2]
    if (!createdAt || !id) return null
    if (expectedSort && expectedSort !== 'newest') return null
    return { sort: 'newest', createdAt, id }
  }
  if (parts[0] === 't' && parts.length === 4) {
    const upvoteCount = Number(parts[1])
    const createdAt = parts[2]
    const id = parts[3]
    if (!Number.isInteger(upvoteCount) || upvoteCount < 0 || !createdAt || !id) {
      return null
    }
    if (expectedSort && expectedSort !== 'top') return null
    return { sort: 'top', upvoteCount, createdAt, id }
  }
  // Legacy cursor: createdAt|id (newest only)
  const sep = decoded.lastIndexOf('|')
  if (sep < 1) return null
  const createdAt = decoded.slice(0, sep)
  const id = decoded.slice(sep + 1)
  if (!createdAt || !id) return null
  if (expectedSort && expectedSort !== 'newest') return null
  return { sort: 'newest', createdAt, id }
}
