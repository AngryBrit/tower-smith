import { describe, expect, it } from 'vitest'
import { safeAppReturnPath } from './epMobileOAuthReturn'

describe('safeAppReturnPath', () => {
  it('returns site root when preferred path is the OAuth callback', () => {
    expect(
      safeAppReturnPath('https://www.towersmith.com/oauth/google-drive-picker?code=abc'),
    ).toBe('https://www.towersmith.com/')
  })

  it('strips OAuth query params from a normal return URL', () => {
    expect(safeAppReturnPath('https://www.towersmith.com/?code=abc&state=xyz')).toBe(
      'https://www.towersmith.com/',
    )
  })

  it('keeps a normal lab return URL', () => {
    expect(safeAppReturnPath('https://www.towersmith.com/?panel=lab')).toBe(
      'https://www.towersmith.com/?panel=lab',
    )
  })
})
