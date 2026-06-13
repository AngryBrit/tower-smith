import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../auth/useAuth'
import { useI18n } from '../i18n'
import {
  accountWorkspaceSyncAvailable,
  fetchAccountWorkspace,
  saveAccountWorkspace,
  type AccountWorkspaceApiError,
} from './api'
import { applyAccountWorkspaceBackup } from './applyBackup'
import {
  buildAccountWorkspaceBackupFromContext,
  hasMeaningfulWorkspaceData,
} from './buildBackup'
import { writeLocalAccountWorkspaceUpdatedAt } from './localUpdatedAt'
import {
  reconcileAccountWorkspaceOnLogin,
  shouldApplyCloudWorkspaceBackup,
} from './reconcile'
import { resolveAccessToken } from '../auth/resolveAccessToken'
import {
  accountWorkspaceErrorMessage,
  isAccountWorkspaceAuthError,
} from './syncErrorMessage'
import { migrateIdsMasterRefFromWorkspaceBackup } from '../effectivePaths/syncEffectivePathsIdsMasterRef'
import { useLabHydration } from '../lab/labHydrationContext'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'

const GUARDIAN_CHIP_CHANGE_EVENT = 'tower-export-guardian-chips-change'
const PUSH_DEBOUNCE_MS = 3000

export function AccountWorkspaceSyncProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const auth = useAuth()
  const { hydrated, publishImportNotice } = useLabHydration()
  const { workspace, setWorkspace, scratchWorkspace, setScratchWorkspace } =
    useTowerWorkspaceContext()

  const skipPushRef = useRef(false)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loginSyncCompletedRef = useRef<string | null>(null)
  const loginSyncInFlightRef = useRef<string | null>(null)

  const saveBackupWithAuth = useCallback(
    async (
      backup: ReturnType<typeof buildAccountWorkspaceBackupFromContext>,
    ): Promise<{ ok: true } | { ok: false; error: AccountWorkspaceApiError }> => {
      let token = await resolveAccessToken()
      if (!token) return { ok: false, error: 'auth_required' }

      let result = await saveAccountWorkspace(token, backup)
      if (!result.ok && isAccountWorkspaceAuthError(result.error)) {
        token = await resolveAccessToken({ forceRefresh: true })
        if (token) result = await saveAccountWorkspace(token, backup)
      }
      return result
    },
    [],
  )

  const pushToCloud = useCallback(async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!accountWorkspaceSyncAvailable() || !auth.user) {
      return { ok: false, error: accountWorkspaceErrorMessage(t, 'sync_unavailable') }
    }

    const updatedAt = new Date().toISOString()
    const backup = buildAccountWorkspaceBackupFromContext(
      workspace,
      scratchWorkspace,
      updatedAt,
    )
    const result = await saveBackupWithAuth(backup)
    if (result.ok) {
      writeLocalAccountWorkspaceUpdatedAt(updatedAt)
      return { ok: true }
    }
    return { ok: false, error: accountWorkspaceErrorMessage(t, result.error) }
  }, [auth.user, saveBackupWithAuth, scratchWorkspace, t, workspace])

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

    const userId = auth.user.id
    if (loginSyncCompletedRef.current === userId) return
    if (loginSyncInFlightRef.current === userId) return
    loginSyncInFlightRef.current = userId

    let cancelled = false

    void (async () => {
      try {
        let token = await resolveAccessToken()
        if (!token || cancelled) return

        let fetched = await fetchAccountWorkspace(token)
        if (!fetched.ok && isAccountWorkspaceAuthError(fetched.error)) {
          token = await resolveAccessToken({ forceRefresh: true })
          if (token && !cancelled) {
            fetched = await fetchAccountWorkspace(token)
          }
        }

        if (cancelled) return
        if (!fetched.ok) {
          publishImportNotice(accountWorkspaceErrorMessage(t, fetched.error), 'error')
          return
        }

        loginSyncCompletedRef.current = userId
        const idsMigratedFromBackup = await migrateIdsMasterRefFromWorkspaceBackup(
          userId,
          fetched.backup?.effectivePathsIdsMasterRef,
        )

        const decision = reconcileAccountWorkspaceOnLogin(fetched.backup)
        if (decision.action === 'apply_cloud') {
          skipPushRef.current = true
          try {
            if (shouldApplyCloudWorkspaceBackup(decision.backup)) {
              const applied = applyAccountWorkspaceBackup(decision.backup)
              setWorkspace(applied.workspace)
              setScratchWorkspace(applied.scratchWorkspace)
              publishImportNotice(t('sr_notice_account_sync_loaded'), 'success')
            }
          } finally {
            skipPushRef.current = false
          }
          return
        }

        if (decision.action === 'push_local') {
          const saved = await pushToCloud()
          if (!saved.ok && !cancelled) {
            publishImportNotice(saved.error, 'error')
          } else if (idsMigratedFromBackup && !cancelled) {
            publishImportNotice(t('sr_notice_account_sync_loaded'), 'success')
          }
          return
        }

        if (idsMigratedFromBackup && !cancelled) {
          publishImportNotice(t('sr_notice_account_sync_loaded'), 'success')
        }
      } finally {
        if (loginSyncInFlightRef.current === userId) {
          loginSyncInFlightRef.current = null
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
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
