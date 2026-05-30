import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import { useLabHydration } from './LabHydrationContext'
import {
  applyLabsShareFileToWorkspace,
  buildLabsShareFileFromWorkspace,
} from './labShareActions'
import type { LabsShareFile } from '../labsShareCodec'
import type { PendingLabUiAction, SelectResearchHandle } from './labToolsTypes'
import type { ResearchData } from '../types/research'

type LabToolsBridgeContextValue = {
  api: SelectResearchHandle
  registerResearchUi: (handle: Pick<
    SelectResearchHandle,
    'openLabDataPanel' | 'openCompareDialog'
  > | null) => void
  consumePendingUiAction: () => PendingLabUiAction | null
}

const LabToolsBridgeContext = createContext<LabToolsBridgeContextValue | null>(null)

export function LabToolsBridgeProvider({
  data,
  onRequestResearchPanel,
  children,
}: {
  data: ResearchData
  onRequestResearchPanel: () => void
  children: ReactNode
}) {
  const { hydrated } = useLabHydration()
  const {
    labLevelOverrides,
    workshopFlat,
    setLabLevelOverrides,
    setWorkspace,
    setScratchWorkspace,
  } = useTowerWorkspaceContext()
  const researchUiRef = useRef<Pick<
    SelectResearchHandle,
    'openLabDataPanel' | 'openCompareDialog'
  > | null>(null)
  const pendingUiRef = useRef<PendingLabUiAction | null>(null)

  const getLabsShareFile = useCallback((): LabsShareFile | null => {
    if (!hydrated) return null
    return buildLabsShareFileFromWorkspace(labLevelOverrides, workshopFlat)
  }, [hydrated, labLevelOverrides, workshopFlat])

  const applyLabsShareFile = useCallback(
    (file: LabsShareFile): boolean => {
      if (!hydrated) return false
      return applyLabsShareFileToWorkspace(
        data,
        file,
        workshopFlat,
        setLabLevelOverrides,
        setWorkspace,
        setScratchWorkspace,
      )
    },
    [
      data,
      hydrated,
      setLabLevelOverrides,
      setScratchWorkspace,
      setWorkspace,
      workshopFlat,
    ],
  )

  const openLabDataPanel = useCallback(() => {
    if (!hydrated) return
    if (researchUiRef.current) {
      researchUiRef.current.openLabDataPanel()
      return
    }
    pendingUiRef.current = 'dataPanel'
    onRequestResearchPanel()
  }, [hydrated, onRequestResearchPanel])

  const openCompareDialog = useCallback(() => {
    if (!hydrated) return
    if (researchUiRef.current) {
      researchUiRef.current.openCompareDialog()
      return
    }
    pendingUiRef.current = 'compare'
    onRequestResearchPanel()
  }, [hydrated, onRequestResearchPanel])

  const registerResearchUi = useCallback(
    (handle: Pick<SelectResearchHandle, 'openLabDataPanel' | 'openCompareDialog'> | null) => {
      researchUiRef.current = handle
      if (!handle) return
      const pending = pendingUiRef.current
      if (!pending) return
      pendingUiRef.current = null
      if (pending === 'dataPanel') handle.openLabDataPanel()
      else handle.openCompareDialog()
    },
    [],
  )

  const consumePendingUiAction = useCallback((): PendingLabUiAction | null => {
    const pending = pendingUiRef.current
    pendingUiRef.current = null
    return pending
  }, [])

  const api = useMemo<SelectResearchHandle>(
    () => ({
      openLabDataPanel,
      openCompareDialog,
      getLabsShareFile,
      applyLabsShareFile,
    }),
    [
      applyLabsShareFile,
      getLabsShareFile,
      openCompareDialog,
      openLabDataPanel,
    ],
  )

  const value = useMemo(
    () => ({ api, registerResearchUi, consumePendingUiAction }),
    [api, registerResearchUi, consumePendingUiAction],
  )

  return (
    <LabToolsBridgeContext.Provider value={value}>{children}</LabToolsBridgeContext.Provider>
  )
}

export function useLabToolsBridge(): LabToolsBridgeContextValue {
  const ctx = useContext(LabToolsBridgeContext)
  if (!ctx) {
    throw new Error('useLabToolsBridge must be used within LabToolsBridgeProvider')
  }
  return ctx
}

/** Stable imperative API for gallery, settings, and auth actions. */
export function useLabToolsApi(): SelectResearchHandle {
  return useLabToolsBridge().api
}
