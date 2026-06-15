type LocationLike = Pick<Location, 'origin' | 'hostname' | 'pathname' | 'search' | 'href'> & {
  hash?: string
}

/** Optional override when testing on a phone against a LAN IP or tunnel (see `.env.example`). */
export function devPublicOriginOverride(): string | null {
  const raw = import.meta.env.VITE_DEV_PUBLIC_ORIGIN
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim().replace(/\/$/, '')
  return trimmed.length > 0 ? trimmed : null
}

export function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

/** RFC 1918 + link-local — typical phone-to-PC LAN dev URLs. */
export function isPrivateNetworkHost(hostname: string): boolean {
  if (isLoopbackHost(hostname)) return true
  if (hostname.endsWith('.local')) return true

  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname)
  if (!match) return false

  const octets = match.slice(1).map((part) => Number(part))
  if (octets.some((octet) => octet > 255)) return false

  const [a, b] = octets
  if (a === 10) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 169 && b === 254) return true
  return false
}

export function isLocalDevOrigin(location: LocationLike): boolean {
  return isPrivateNetworkHost(location.hostname)
}

/** Canonical HTTPS origin for OAuth redirect_uri (set in Netlify prod env). */
export function canonicalPublicAppOrigin(): string | null {
  const raw = import.meta.env.VITE_PUBLIC_APP_ORIGIN
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim().replace(/\/$/, '')
  return trimmed.length > 0 ? trimmed : null
}

/** Origin used for OAuth redirect_uri / redirectTo (not the current path). */
export function publicAppOrigin(location: LocationLike = window.location): string {
  return canonicalPublicAppOrigin() ?? devPublicOriginOverride() ?? location.origin
}

/** Full URL to return to after an OAuth redirect (preserves path, query, hash). */
export function currentAppUrl(location: LocationLike = window.location): string {
  const override = devPublicOriginOverride()
  if (!override || override === location.origin) {
    return location.href
  }

  const path = location.pathname === '/' ? '' : location.pathname
  const hash = location.hash ?? ''
  return `${override}${path}${location.search}${hash}`
}

export function resolveAppNavigationTarget(
  target: string,
  location: LocationLike = window.location,
): string {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target
  }
  const origin = publicAppOrigin(location)
  if (target.startsWith('/')) {
    return `${origin}${target}`
  }
  return `${origin}/${target}`
}
