import { afterEach, describe, expect, it, vi } from 'vitest'
import { shouldUsePickerOAuthRedirectFlow } from './googleDrivePickerEnvironment'

describe('shouldUsePickerOAuthRedirectFlow', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses JS Picker on localhost desktop', () => {
    expect(
      shouldUsePickerOAuthRedirectFlow({
        origin: 'http://localhost:8888',
        hostname: 'localhost',
        pathname: '/',
        search: '',
        href: 'http://localhost:8888/',
      }),
    ).toBe(false)
  })

  it('uses redirect flow on production', () => {
    expect(
      shouldUsePickerOAuthRedirectFlow({
        origin: 'https://www.towersmith.com',
        hostname: 'www.towersmith.com',
        pathname: '/',
        search: '',
        href: 'https://www.towersmith.com/',
      }),
    ).toBe(true)
  })

  it('uses redirect flow on LAN dev from a phone user agent', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 5,
    })
    expect(
      shouldUsePickerOAuthRedirectFlow({
        origin: 'http://192.168.1.42:8888',
        hostname: '192.168.1.42',
        pathname: '/',
        search: '',
        href: 'http://192.168.1.42:8888/',
      }),
    ).toBe(true)
  })
})
