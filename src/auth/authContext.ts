import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type OAuthProvider = 'google' | 'discord' | 'twitch'

export type AuthContextValue = {
  configured: boolean
  loading: boolean
  profileLoading: boolean
  session: Session | null
  user: User | null
  displayName: string | null
  guild: string | null
  guildId: string | null
  avatarUrl: string | null
  signIn: (provider: OAuthProvider) => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string | null>
  refreshProfile: () => Promise<void>
  prefillProfileFromImport: (hints: { displayName?: string | null; guild?: string | null }) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function displayNameFromUser(user: User | null): string | null {
  if (!user) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fromMeta =
    (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta?.name === 'string' && meta.name.trim()) ||
    (typeof meta?.user_name === 'string' && meta.user_name.trim())
  if (fromMeta) return fromMeta
  return user.email?.split('@')[0] ?? null
}

export function avatarUrlFromUser(user: User | null): string | null {
  if (!user) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fromMeta =
    (typeof meta?.avatar_url === 'string' && meta.avatar_url.trim()) ||
    (typeof meta?.picture === 'string' && meta.picture.trim()) ||
    (typeof meta?.photo_url === 'string' && meta.photo_url.trim()) ||
    ''
  return fromMeta || null
}
