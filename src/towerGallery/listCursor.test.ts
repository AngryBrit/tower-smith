import { describe, expect, it } from 'vitest'
import { decodeGalleryListCursor, encodeGalleryListCursor } from './listCursor'

describe('gallery list cursor', () => {
  it('round-trips newest createdAt and id', () => {
    const cursor = {
      sort: 'newest' as const,
      createdAt: '2026-05-26T12:00:00.000Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const encoded = encodeGalleryListCursor(cursor)
    expect(decodeGalleryListCursor(encoded, 'newest')).toEqual(cursor)
  })

  it('round-trips top sort cursor', () => {
    const cursor = {
      sort: 'top' as const,
      upvoteCount: 12,
      createdAt: '2026-05-26T12:00:00.000Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const encoded = encodeGalleryListCursor(cursor)
    expect(decodeGalleryListCursor(encoded, 'top')).toEqual(cursor)
  })

  it('rejects sort mismatch', () => {
    const encoded = encodeGalleryListCursor({
      sort: 'newest',
      createdAt: '2026-05-26T12:00:00.000Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(decodeGalleryListCursor(encoded, 'top')).toBeNull()
  })

  it('returns null for invalid cursor', () => {
    expect(decodeGalleryListCursor('not-valid')).toBeNull()
  })
})
