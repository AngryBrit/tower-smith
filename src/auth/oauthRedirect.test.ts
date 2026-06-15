import { describe, expect, it } from 'vitest'
import { oauthRedirectUrl } from './oauthRedirect'

describe('oauthRedirectUrl', () => {
  it('uses origin only on localhost and LAN dev hosts', () => {
    expect(
      oauthRedirectUrl({
        origin: 'http://localhost:5173',
        hostname: 'localhost',
        pathname: '/',
        search: '',
      }),
    ).toBe('http://localhost:5173')

    expect(
      oauthRedirectUrl({
        origin: 'http://192.168.1.42:8888',
        hostname: '192.168.1.42',
        pathname: '/lab',
        search: '?x=1',
      }),
    ).toBe('http://192.168.1.42:8888')
  })

  it('keeps path and query on production', () => {
    expect(
      oauthRedirectUrl({
        origin: 'https://www.towersmith.com',
        hostname: 'www.towersmith.com',
        pathname: '/',
        search: '',
      }),
    ).toBe('https://www.towersmith.com')

    expect(
      oauthRedirectUrl({
        origin: 'https://www.towersmith.com',
        hostname: 'www.towersmith.com',
        pathname: '/foo',
        search: '?bar=1',
      }),
    ).toBe('https://www.towersmith.com/foo?bar=1')
  })
})
