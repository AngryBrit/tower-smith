import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../auth/useAuth'
import { accountWorkspaceSyncAvailable, fetchAccountWorkspace, saveAccountWorkspace } from './api'
import { applyAccountWorkspaceBackup } from './applyBackup'
import {
  buildAccountWorkspaceBackupFromContext,
  hasMeaningfulWorkspaceData,
} from './buildBackup'
import { writeLocalAccountWorkspaceUpdatedAt } from './localUpdatedAt'
import { reconcileAccountWorkspaceOnLogin } from './reconcile'
import { useLabHydration } from '../lab/labHydrationContext'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'

const GUARDIAN_CHIP_CHANGE_EVENT = 'tower-export-guardian-chips-change'
const PUSH_DEBOUNCE_MS = 3000

export function AccountWorkspaceSyncProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const { hydrated } = useLabHydration()
  const { workspace, setWorkspace, scratchWorkspace, setScratchWorkspace } =
    useTowerWorkspaceContext()

  const skipPushRef = useRef(false)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loginSyncKeyRef = useRef<string | null>(null)

  const pushToCloud = useCallback(async () => {
    if (!accountWorkspaceSyncAvailable() || !auth.user) return
    const token = await auth.getAccessToken()
    if (!token) return

    const updatedAt = new Date().toISOString()
    const backup = buildAccountWorkspaceBackupFromContext(
      workspace,
      scratchWorkspace,
      updatedAt,
    )
    const result = await saveAccountWorkspace(token, backup)
    if (result.ok) {
      writeLocalAccountWorkspaceUpdatedAt(updatedAt)
    }
  }, [auth, scratchWorkspace, workspace])

  const schedulePush = useCallback(() => {
    if (!auth.user || skipPushRef.current) return
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null
      void pushToCloud()
    }, PUSH_DEBOUNCE_MS)
  }, [auth.user, pushToCloud])

  useEffect(() => {
    if (!hydrated || !auth.user || !accountWorkspaceSyncAvailable()) {
      loginSyncKeyRef.current = null
      return
    }

    const syncKey = auth.user.id
    if (loginSyncKeyRef.current === syncKey) return
    loginSyncKeyRef.current = syncKey

    let cancelled = false

    void (async () => {
      const token = await auth.getAccessToken()
      if (!token || cancelled) return

      const fetched = await fetchAccountWorkspace(token)
      if (!fetched.ok || cancelled) return

      const decision = reconcileAccountWorkspaceOnLogin(fetched.backup)
      if (decision.action === 'apply_cloud') {
        skipPushRef.current = true
        try {
          const applied = applyAccountWorkspaceBackup(decision.backup)
          setWorkspace(applied.workspace)
          setScratchWorkspace(applied.scratchWorkspace)
        } finally {
          skipPushRef.current = false
        }
        return
      }

      if (decision.action === 'push_local') {
        await pushToCloud()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    auth,
    auth.user,
    hydrated,
    pushToCloud,
    setScratchWorkspace,
    setWorkspace,
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
