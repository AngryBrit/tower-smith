import { describe, expect, it } from 'vitest'
import { oauthRedirectUrl } from './oauthRedirect'

describe('oauthRedirectUrl', () => {
  it('uses origin only on localhost', () => {
    expect(
      oauthRedirectUrl({
        origin: 'http://localhost:5173',
        pathname: '/',
        search: '',
      }),
    ).toBe('http://localhost:5173')
  })

  it('keeps path and query on production', () => {
    expect(
      oauthRedirectUrl({
        origin: 'https://www.towersmith.com',
        pathname: '/',
        search: '',
      }),
    ).toBe('https://www.towersmith.com')

    expect(
      oauthRedirectUrl({
        origin: 'https://www.towersmith.com',
        pathname: '/foo',
        search: '?bar=1',
      }),
    ).toBe('https://www.towersmith.com/foo?bar=1')
  })
})
