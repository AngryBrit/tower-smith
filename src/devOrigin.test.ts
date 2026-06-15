import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  currentAppUrl,
  isLocalDevOrigin,
  isPrivateNetworkHost,
  publicAppOrigin,
  resolveAppNavigationTarget,
} from './devOrigin'

describe('devOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('treats LAN IPs as local dev hosts', () => {
    expect(isPrivateNetworkHost('192.168.1.42')).toBe(true)
    expect(isPrivateNetworkHost('10.0.0.5')).toBe(true)
    expect(isLocalDevOrigin({ hostname: '192.168.1.42', origin: 'http://192.168.1.42:8888', href: '', pathname: '/', search: '' })).toBe(true)
  })

  it('uses VITE_DEV_PUBLIC_ORIGIN when set', () => {
    vi.stubEnv('VITE_DEV_PUBLIC_ORIGIN', 'http://192.168.1.42:8888')
    expect(
      publicAppOrigin({
        origin: 'http://localhost:8888',
        hostname: 'localhost',
        href: 'http://localhost:8888/lab',
        pathname: '/lab',
        search: '',
      }),
    ).toBe('http://192.168.1.42:8888')
    expect(
      currentAppUrl({
        origin: 'http://localhost:8888',
        hostname: 'localhost',
        href: 'http://localhost:8888/lab?x=1',
        pathname: '/lab',
        search: '?x=1',
      }),
    ).toBe('http://192.168.1.42:8888/lab?x=1')
  })

  it('resolves relative return paths against public origin', () => {
    expect(
      resolveAppNavigationTarget('/lab', {
        origin: 'http://192.168.1.42:8888',
        hostname: '192.168.1.42',
        href: '',
        pathname: '/',
        search: '',
      }),
    ).toBe('http://192.168.1.42:8888/lab')
  })
})
