import { describe, expect, it } from 'vitest'
import { parseGoogleRiscClientIds, riscEventTypes } from '../../netlify/functions/lib/riscSecurityToken'

describe('parseGoogleRiscClientIds', () => {
  it('parses comma-separated OAuth client IDs', () => {
    expect(parseGoogleRiscClientIds('a.apps.googleusercontent.com, b.apps.googleusercontent.com')).toEqual([
      'a.apps.googleusercontent.com',
      'b.apps.googleusercontent.com',
    ])
  })

  it('returns empty array when unset', () => {
    expect(parseGoogleRiscClientIds(undefined)).toEqual([])
    expect(parseGoogleRiscClientIds('  ,  ')).toEqual([])
  })
})

describe('riscEventTypes', () => {
  it('lists event type keys from the token payload', () => {
    expect(
      riscEventTypes({
        events: {
          'https://schemas.openid.net/secevent/risc/event-type/verification': { state: 'ok' },
        },
      }),
    ).toEqual(['https://schemas.openid.net/secevent/risc/event-type/verification'])
  })
})
