import { describe, expect, it } from 'vitest'
import { PLAYER_INFO_MAX_BYTES, validatePlayerInfoSize } from './playerInfoLimits'

describe('playerInfoLimits', () => {
  it('allows typical save sizes', () => {
    expect(validatePlayerInfoSize(70_000)).toBeNull()
    expect(PLAYER_INFO_MAX_BYTES).toBe(200 * 1024)
  })

  it('rejects empty and oversized', () => {
    expect(validatePlayerInfoSize(0)).toBe('empty')
    expect(validatePlayerInfoSize(PLAYER_INFO_MAX_BYTES + 1)).toBe('too_large')
  })
})
