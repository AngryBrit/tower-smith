import { verifySupabaseAccessToken } from './supabaseAdmin'

function bearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization')?.trim()
  if (!auth?.toLowerCase().startsWith('bearer ')) return null
  const token = auth.slice(7).trim()
  return token.length > 0 ? token : null
}

export function parseAdminUserIds(raw: string | undefined): Set<string> {
  const set = new Set<string>()
  if (!raw?.trim()) return set
  for (const part of raw.split(',')) {
    const id = part.trim()
    if (id) set.add(id)
  }
  return set
}

export function adminUserIdsConfigured(): boolean {
  return parseAdminUserIds(process.env.TOWER_GALLERY_ADMIN_USER_IDS).size > 0
}

/** True when request has a valid Supabase session for an allowlisted admin user. */
export async function isAdminAuthorized(req: Request): Promise<boolean> {
  const adminIds = parseAdminUserIds(process.env.TOWER_GALLERY_ADMIN_USER_IDS)
  if (adminIds.size === 0) return false
  const token = bearerToken(req)
  if (!token) return false
  const user = await verifySupabaseAccessToken(token)
  if (!user) return false
  return adminIds.has(user.id)
}
