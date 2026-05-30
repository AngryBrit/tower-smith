import { describe, expect, it } from 'vitest'
import { formatWikiDataAlignedAt, wikiDataAlignedAtDate } from './wikiDataStamp'

describe('wikiDataStamp', () => {
  it('formats aligned date for locale', () => {
    const d = wikiDataAlignedAtDate()
    expect(d).not.toBeNull()
    const formatted = formatWikiDataAlignedAt('en-US')
    expect(formatted).toMatch(/2026/)
  })
})
