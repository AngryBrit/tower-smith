import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { fetchUserProfile } from '../profile/profileApi'
import { getSupabaseBrowserClient, supabaseBrowserConfigured } from '../supabase/client'
import { resolveGuildNameById } from '../towerGallery/api'
import { deferInEffect } from '../deferInEffect'
import { AuthContext, displayNameFromUser, avatarUrlFromUser, type AuthContextValue, type OAuthProvider } from './authContext'
import { oauthRedirectUrl } from './oauthRedirect'

export type { OAuthProvider } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = supabaseBrowserConfigured()
  const [loading, setLoading] = useState(() => configured && getSupabaseBrowserClient() != null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null)
  const [profileGuild, setProfileGuild] = useState<string | null>(null)
  const [profileGuildId, setProfileGuildId] = useState<string | null>(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId || !configured) {
      setProfileDisplayName(null)
      setProfileGuild(null)
      setProfileGuildId(null)
      setProfileAvatarUrl(null)
      setProfileResolved(false)
      return
    }

    setProfileLoading(true)
    try {
      const profile = await fetchUserProfile(userId)
      setProfileDisplayName(profile?.displayName ?? null)
      setProfileGuildId(profile?.guildId ?? null)
      let resolvedGuild: string | null = null
      if (profile?.guildId) {
        const resolved = await resolveGuildNameById(profile.guildId)
        resolvedGuild = resolved ?? profile.guildId
      }
      setProfileGuild(resolvedGuild)
      setProfileAvatarUrl(profile?.avatarUrl ?? null)
    } finally {
      setProfileLoading(false)
      setProfileResolved(true)
    }
  }, [configured, session?.user?.id])

  useEffect(() => {
    const sb = getSupabaseBrowserClient()
    if (!sb) {
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
    deferInEffect(() => {
      setProfileResolved(false)
      void refreshProfile()
    })
  }, [refreshProfile])

  const signIn = useCallback(async (provider: OAuthProvider) => {
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

  const prefillProfileFromImport = useCallback(
    (hints: { displayName?: string | null; guild?: string | null }) => {
      const display = hints.displayName?.trim()
      const guild = hints.guild?.trim()
      if (display && !profileDisplayName) setProfileDisplayName(display)
      if (guild && !profileGuild) setProfileGuild(guild)
    },
    [profileDisplayName, profileGuild],
  )

  const user = session?.user ?? null
  const displayName =
    profileDisplayName ?? displayNameFromUser(user)
  const guild = profileGuild
  const guildId = profileGuildId
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
      guildId,
      avatarUrl,
      signIn,
      signOut,
      getAccessToken,
      refreshProfile,
      prefillProfileFromImport,
    }),
    [
      avatarUrl,
      configured,
      displayName,
      guild,
      guildId,
      getAccessToken,
      loading,
      prefillProfileFromImport,
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
