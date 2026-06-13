import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../auth/useAuth'
import { useI18n } from '../i18n'
import { accountWorkspaceSyncAvailable, fetchAccountWorkspace, saveAccountWorkspace } from './api'
import { applyAccountWorkspaceBackup } from './applyBackup'
import {
  buildAccountWorkspaceBackupFromContext,
  hasMeaningfulWorkspaceData,
} from './buildBackup'
import { refreshAccessTokenForSync } from './refreshAccessToken'
import { writeLocalAccountWorkspaceUpdatedAt } from './localUpdatedAt'
import { reconcileAccountWorkspaceOnLogin } from './reconcile'
import { accountWorkspaceErrorMessage } from './syncErrorMessage'
import { useLabHydration } from '../lab/labHydrationContext'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'

const GUARDIAN_CHIP_CHANGE_EVENT = 'tower-export-guardian-chips-change'
const PUSH_DEBOUNCE_MS = 3000

async function accessTokenForSync(
  getAccessToken: () => Promise<string | null>,
): Promise<string | null> {
  const refreshed = await refreshAccessTokenForSync()
  if (refreshed) return refreshed
  return getAccessToken()
}

export function AccountWorkspaceSyncProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const auth = useAuth()
  const { hydrated, publishImportNotice } = useLabHydration()
  const { workspace, setWorkspace, scratchWorkspace, setScratchWorkspace } =
    useTowerWorkspaceContext()

  const skipPushRef = useRef(false)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loginSyncCompletedRef = useRef<string | null>(null)

  const pushToCloud = useCallback(async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!accountWorkspaceSyncAvailable() || !auth.user) {
      return { ok: false, error: accountWorkspaceErrorMessage(t, 'sync_unavailable') }
    }
    const token = await accessTokenForSync(auth.getAccessToken)
    if (!token) {
      return { ok: false, error: accountWorkspaceErrorMessage(t, 'invalid_token') }
    }

    const updatedAt = new Date().toISOString()
    const backup = buildAccountWorkspaceBackupFromContext(
      workspace,
      scratchWorkspace,
      updatedAt,
    )
    const result = await saveAccountWorkspace(token, backup)
    if (result.ok) {
      writeLocalAccountWorkspaceUpdatedAt(updatedAt)
      return { ok: true }
    }
    return { ok: false, error: accountWorkspaceErrorMessage(t, result.error) }
  }, [auth, scratchWorkspace, t, workspace])

  const schedulePush = useCallback(() => {
    if (!auth.user || skipPushRef.current) return
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null
      void pushToCloud()
    }, PUSH_DEBOUNCE_MS)
  }, [auth.user, pushToCloud])

  useEffect(() => {
    if (auth.loading) return

    if (!hydrated || !auth.user || !auth.session || !accountWorkspaceSyncAvailable()) {
      if (!auth.user) loginSyncCompletedRef.current = null
      return
    }

    const syncKey = `${auth.user.id}:${auth.session.access_token}`
    if (loginSyncCompletedRef.current === syncKey) return

    let cancelled = false

    void (async () => {
      const token = await accessTokenForSync(auth.getAccessToken)
      if (!token || cancelled) return

      const fetched = await fetchAccountWorkspace(token)
      if (cancelled) return
      if (!fetched.ok) {
        publishImportNotice(accountWorkspaceErrorMessage(t, fetched.error), 'error')
        return
      }

      loginSyncCompletedRef.current = syncKey

      const decision = reconcileAccountWorkspaceOnLogin(fetched.backup)
      if (decision.action === 'apply_cloud') {
        skipPushRef.current = true
        try {
          const applied = applyAccountWorkspaceBackup(decision.backup)
          setWorkspace(applied.workspace)
          setScratchWorkspace(applied.scratchWorkspace)
          publishImportNotice(t('sr_notice_account_sync_loaded'), 'success')
        } finally {
          skipPushRef.current = false
        }
        return
      }

      if (decision.action === 'push_local') {
        const saved = await pushToCloud()
        if (!saved.ok && !cancelled) {
          publishImportNotice(saved.error, 'error')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    auth,
    auth.loading,
    auth.session,
    auth.user,
    hydrated,
    publishImportNotice,
    pushToCloud,
    setScratchWorkspace,
    setWorkspace,
    t,
  ])

  useEffect(() => {
    if (!hydrated || !auth.user) return
    if (!hasMeaningfulWorkspaceData(workspace, scratchWorkspace)) return
    schedulePush()
  }, [auth.user, hydrated, schedulePush, scratchWorkspace, workspace])

  useEffect(() => {
    if (!hydrated || !auth.user) return

    const onGuardianChange = () => {
      schedulePush()
    }
    window.addEventListener(GUARDIAN_CHIP_CHANGE_EVENT, onGuardianChange)
    return () => {
      window.removeEventListener(GUARDIAN_CHIP_CHANGE_EVENT, onGuardianChange)
    }
  }, [auth.user, hydrated, schedulePush])

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    }
  }, [])

  return children
}
