import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import { applyTowerThemes } from '../towerDataThemes'
import { persistLabWorkspacesToLocalStorage } from '../towerWorkspacePresets'
import type { TowerWorkspaceV1 } from '../towerWorkspaceStorage'
import { workspaceThemesSnapshot } from '../towerWorkspaceStorage'
import { useI18n } from '../i18n'
import { useLabHydration } from './LabHydrationContext'

const MAX_UNDO_SNAPSHOTS = 20

type WorkspacePairSnapshot = {
  workspace: TowerWorkspaceV1
  scratchWorkspace: TowerWorkspaceV1
}

type WorkspaceUndoContextValue = {
  canUndo: boolean
  pushUndoSnapshot: () => void
  undo: () => boolean
}

const WorkspaceUndoContext = createContext<WorkspaceUndoContextValue | null>(null)

function cloneWorkspace(workspace: TowerWorkspaceV1): TowerWorkspaceV1 {
  return structuredClone(workspace)
}

export function WorkspaceUndoProvider({ children }: { children: ReactNode }) {
  const { workspace, setWorkspace, scratchWorkspace, setScratchWorkspace } =
    useTowerWorkspaceContext()
  const { t } = useI18n()
  const { setImportNotice } = useLabHydration()
  const stackRef = useRef<WorkspacePairSnapshot[]>([])
  const [canUndo, setCanUndo] = useState(false)

  const syncCanUndo = useCallback(() => {
    setCanUndo(stackRef.current.length > 0)
  }, [])

  const pushUndoSnapshot = useCallback(() => {
    const next: WorkspacePairSnapshot = {
      workspace: cloneWorkspace(workspace),
      scratchWorkspace: cloneWorkspace(scratchWorkspace),
    }
    const stack = stackRef.current
    stack.push(next)
    if (stack.length > MAX_UNDO_SNAPSHOTS) {
      stack.splice(0, stack.length - MAX_UNDO_SNAPSHOTS)
    }
    syncCanUndo()
  }, [scratchWorkspace, syncCanUndo, workspace])

  const undo = useCallback((): boolean => {
    const stack = stackRef.current
    if (stack.length === 0) return false
    const snap = stack.pop()!
    applyTowerThemes(workspaceThemesSnapshot(snap.workspace))
    setWorkspace(snap.workspace)
    setScratchWorkspace(snap.scratchWorkspace)
    persistLabWorkspacesToLocalStorage(snap.workspace, snap.scratchWorkspace)
    syncCanUndo()
    return true
  }, [setScratchWorkspace, setWorkspace, syncCanUndo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key !== 'z' || (!e.ctrlKey && !e.metaKey) || e.altKey || e.shiftKey) return
      const target = e.target
      if (target instanceof HTMLElement && target.isContentEditable) return
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      if (stackRef.current.length === 0) return
      e.preventDefault()
      if (undo()) {
        setImportNotice(t('workspace_undo_done'))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setImportNotice, t, undo])

  const value = useMemo(
    () => ({ canUndo, pushUndoSnapshot, undo }),
    [canUndo, pushUndoSnapshot, undo],
  )

  return (
    <WorkspaceUndoContext.Provider value={value}>{children}</WorkspaceUndoContext.Provider>
  )
}

export function useWorkspaceUndo(): WorkspaceUndoContextValue {
  const ctx = useContext(WorkspaceUndoContext)
  if (!ctx) {
    throw new Error('useWorkspaceUndo must be used within WorkspaceUndoProvider')
  }
  return ctx
}
