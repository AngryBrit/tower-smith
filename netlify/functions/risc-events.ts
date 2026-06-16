import type { Config } from '@netlify/functions'
import {
  parseGoogleRiscClientIds,
  riscEventTypes,
  verifyRiscSecurityToken,
} from './lib/riscSecurityToken'

function clientIdsFromEnv(): string[] {
  return parseGoogleRiscClientIds(process.env.GOOGLE_RISC_OAUTH_CLIENT_IDS)
}

function isConfigured(): boolean {
  return clientIdsFromEnv().length > 0
}

/** TowerSmith stores Google drive.file tokens only in browser sessionStorage (no server refresh tokens). */
function handleRiscEvents(eventTypes: string[], jti: string | undefined): void {
  console.info('google_risc_event', {
    jti: jti ?? null,
    eventTypes,
  })
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  if (!isConfigured()) {
    return new Response('RISC receiver not configured', { status: 503 })
  }

  const rawBody = (await req.text()).trim()
  if (!rawBody) {
    return new Response('Missing security event token', { status: 400 })
  }

  try {
    const token = await verifyRiscSecurityToken(rawBody, clientIdsFromEnv())
    handleRiscEvents(riscEventTypes(token), typeof token.jti === 'string' ? token.jti : undefined)
    return new Response(null, { status: 202 })
  } catch (err) {
    console.warn('google_risc_reject', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return new Response('Invalid security event token', { status: 400 })
  }
}

export const config: Config = {
  path: '/api/risc/events',
}
