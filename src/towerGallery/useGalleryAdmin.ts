import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { deferInEffect } from '../deferInEffect'
import { fetchGalleryAdminStatus, type GalleryAdminApiError } from './adminApi'
import { towerGalleryApiAvailable } from './api'

export function useGalleryAdmin() {
  const { session, getAccessToken } = useAuth()
  const apiEnabled = towerGalleryApiAvailable()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<GalleryAdminApiError | null>(null)

  const refresh = useCallback(async () => {
    if (!apiEnabled || !session) {
      setLoading(false)
      setIsAdmin(false)
      setUserId(session?.user.id ?? null)
      setError(null)
      return
    }
    setLoading(true)
    const token = await getAccessToken()
    const result = await fetchGalleryAdminStatus(token)
    setLoading(false)
    if (!result.ok) {
      setIsAdmin(false)
      setUserId(session.user.id)
      setError(result.error)
      return
    }
    setIsAdmin(result.admin)
    setUserId(result.userId)
    setError(null)
  }, [apiEnabled, getAccessToken, session])

  useEffect(() => {
    deferInEffect(() => void refresh())
  }, [refresh])

  return {
    loading,
    isAdmin,
    userId,
    error,
    refresh,
    signedIn: session != null,
  }
}
