import { verifySupabaseAccessToken } from './supabaseAdmin'
import type { User } from '@supabase/supabase-js'

export function bearerToken(req: Request): string | null {
  const header = req.headers.get('Authorization')?.trim()
  if (!header?.toLowerCase().startsWith('bearer ')) return null
  const token = header.slice(7).trim()
  return token.length > 0 ? token : null
}

export async function userFromBearer(req: Request): Promise<User | null> {
  const token = bearerToken(req)
  if (!token) return null
  return verifySupabaseAccessToken(token)
}
