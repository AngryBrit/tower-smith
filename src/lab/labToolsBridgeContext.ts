import { createContext, useContext } from 'react'
import type {
  PendingLabUiAction,
  SelectResearchHandle,
} from './labToolsTypes'

export type LabToolsBridgeContextValue = {
  api: SelectResearchHandle
  registerResearchUi: (handle: Pick<
    SelectResearchHandle,
    'openLabDataPanel' | 'openCompareDialog'
  > | null) => void
  consumePendingUiAction: () => PendingLabUiAction | null
}

export const LabToolsBridgeContext = createContext<LabToolsBridgeContextValue | null>(null)

export function useLabToolsBridge(): LabToolsBridgeContextValue {
  const ctx = useContext(LabToolsBridgeContext)
  if (!ctx) {
    throw new Error('useLabToolsBridge must be used within LabToolsBridgeProvider')
  }
  return ctx
}

export function useLabToolsApi(): SelectResearchHandle {
  return useLabToolsBridge().api
}
