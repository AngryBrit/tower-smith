import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { fetchUserProfile } from '../profile/profileApi'
import { getSupabaseBrowserClient, supabaseBrowserConfigured } from '../supabase/client'
import { oauthRedirectUrl } from './oauthRedirect'

export type AuthProvider = 'google' | 'discord' | 'twitch'

type AuthContextValue = {
  configured: boolean
  loading: boolean
  profileLoading: boolean
  session: Session | null
  user: User | null
  displayName: string | null
  guild: string | null
  avatarUrl: string | null
  signIn: (provider: AuthProvider) => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string | null>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function displayNameFromUser(user: User | null): string | null {
  if (!user) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fromMeta =
    (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta?.name === 'string' && meta.name.trim()) ||
    (typeof meta?.user_name === 'string' && meta.user_name.trim())
  if (fromMeta) return fromMeta
  return user.email?.split('@')[0] ?? null
}

function avatarUrlFromUser(user: User | null): string | null {
  if (!user) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const fromMeta =
    (typeof meta?.avatar_url === 'string' && meta.avatar_url.trim()) ||
    (typeof meta?.picture === 'string' && meta.picture.trim()) ||
    (typeof meta?.photo_url === 'string' && meta.photo_url.trim()) ||
    ''
  return fromMeta || null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = supabaseBrowserConfigured()
  const [loading, setLoading] = useState(configured)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null)
  const [profileGuild, setProfileGuild] = useState<string | null>(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId || !configured) {
      setProfileDisplayName(null)
      setProfileGuild(null)
      setProfileAvatarUrl(null)
      setProfileResolved(false)
      return
    }

    setProfileLoading(true)
    try {
      const profile = await fetchUserProfile(userId)
      setProfileDisplayName(profile?.displayName ?? null)
      setProfileGuild(profile?.guild ?? null)
      setProfileAvatarUrl(profile?.avatarUrl ?? null)
    } finally {
      setProfileLoading(false)
      setProfileResolved(true)
    }
  }, [configured, session?.user?.id])

  useEffect(() => {
    const sb = getSupabaseBrowserClient()
    if (!sb) {
      setLoading(false)
      return
    }

    let cancelled = false

    void sb.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [configured])

  useEffect(() => {
    setProfileResolved(false)
    void refreshProfile()
  }, [refreshProfile])

  const signIn = useCallback(async (provider: AuthProvider) => {
    const sb = getSupabaseBrowserClient()
    if (!sb) return
    const redirectTo = oauthRedirectUrl()
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient()
    if (!sb) return
    const { error } = await sb.auth.signOut()
    if (error) throw error
  }, [])

  const getAccessToken = useCallback(async () => {
    const sb = getSupabaseBrowserClient()
    if (!sb) return null
    const { data } = await sb.auth.getSession()
    return data.session?.access_token ?? null
  }, [])

  const user = session?.user ?? null
  const displayName =
    profileDisplayName ?? displayNameFromUser(user)
  const guild = profileGuild
  const avatarUrl = user
    ? profileResolved
      ? (profileAvatarUrl ?? avatarUrlFromUser(user))
      : null
    : null

  const value = useMemo(
    (): AuthContextValue => ({
      configured,
      loading,
      profileLoading,
      session,
      user,
      displayName,
      guild,
      avatarUrl,
      signIn,
      signOut,
      getAccessToken,
      refreshProfile,
    }),
    [
      avatarUrl,
      configured,
      displayName,
      guild,
      getAccessToken,
      loading,
      profileLoading,
      refreshProfile,
      session,
      signIn,
      signOut,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
