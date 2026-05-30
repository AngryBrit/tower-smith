import { createContext, useContext } from 'react'

export type WorkspaceUndoContextValue = {
  canUndo: boolean
  pushUndoSnapshot: () => void
  undo: () => boolean
}

export const WorkspaceUndoContext = createContext<WorkspaceUndoContextValue | null>(null)

export function useWorkspaceUndo(): WorkspaceUndoContextValue {
  const ctx = useContext(WorkspaceUndoContext)
  if (!ctx) {
    throw new Error('useWorkspaceUndo must be used within WorkspaceUndoProvider')
  }
  return ctx
}
