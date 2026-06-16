import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

const RISC_CONFIG_URL = 'https://accounts.google.com/.well-known/risc-configuration'

export const RISC_EVENT_TYPES = [
  'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked',
  'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked',
  'https://schemas.openid.net/secevent/oauth/event-type/token-revoked',
  'https://schemas.openid.net/secevent/risc/event-type/account-disabled',
  'https://schemas.openid.net/secevent/risc/event-type/account-enabled',
  'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required',
  'https://schemas.openid.net/secevent/risc/event-type/verification',
] as const

export type RiscSecurityToken = JWTPayload & {
  jti?: string
  events?: Record<string, unknown>
}

type RiscDiscovery = {
  issuer: string
  jwks_uri: string
}

let discoveryCache: RiscDiscovery | null = null
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null

async function riscDiscovery(): Promise<RiscDiscovery> {
  if (discoveryCache) return discoveryCache
  const response = await fetch(RISC_CONFIG_URL)
  if (!response.ok) {
    throw new Error('risc_discovery_failed')
  }
  const json = (await response.json()) as RiscDiscovery
  if (!json.issuer || !json.jwks_uri) {
    throw new Error('risc_discovery_invalid')
  }
  discoveryCache = json
  return json
}

async function riscJwks(): Promise<ReturnType<typeof createRemoteJWKSet>> {
  if (jwksCache) return jwksCache
  const { jwks_uri: jwksUri } = await riscDiscovery()
  jwksCache = createRemoteJWKSet(new URL(jwksUri))
  return jwksCache
}

export function parseGoogleRiscClientIds(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
}

export async function verifyRiscSecurityToken(
  token: string,
  clientIds: readonly string[],
): Promise<RiscSecurityToken> {
  if (clientIds.length === 0) {
    throw new Error('risc_not_configured')
  }

  const { issuer } = await riscDiscovery()
  const jwks = await riscJwks()
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: [...clientIds],
    algorithms: ['RS256'],
    clockTolerance: Number.MAX_SAFE_INTEGER,
  })

  return payload as RiscSecurityToken
}

export function riscEventTypes(token: RiscSecurityToken): string[] {
  if (!token.events || typeof token.events !== 'object') return []
  return Object.keys(token.events)
}
