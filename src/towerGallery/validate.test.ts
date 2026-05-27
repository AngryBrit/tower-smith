import { describe, expect, it } from 'vitest'
import { parseTowerGallerySubmitBody, validateLabsSharePayload } from './validate'

describe('towerGallery validate', () => {
  it('accepts minimal v4 payload', () => {
    const payload = { v: 4 as const, o: { '0-0': 1, '1-2': 3 } }
    expect(validateLabsSharePayload(payload)).toBe(true)
    const parsed = parseTowerGallerySubmitBody({
      title: 'Test build',
      category: 'turtle',
      author: 'Player',
      guild: 'BestGuild',
      payload,
    })
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.body.title).toBe('Test build')
      expect(parsed.body.category).toBe('turtle')
      expect(parsed.body.author).toBe('Player')
      expect(parsed.body.guild).toBe('BestGuild')
    }
  })

  it('rejects missing category', () => {
    const parsed = parseTowerGallerySubmitBody({
      title: 'Test build',
      payload: { v: 4, o: {} },
    })
    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.error).toBe('invalid_category')
    }
  })

  it('rejects invalid lab keys', () => {
    expect(validateLabsSharePayload({ v: 4, o: { bad: 1 } })).toBe(false)
  })

  it('rejects empty title', () => {
    const parsed = parseTowerGallerySubmitBody({
      title: '   ',
      payload: { v: 4, o: {} },
    })
    expect(parsed.ok).toBe(false)
  })
})
