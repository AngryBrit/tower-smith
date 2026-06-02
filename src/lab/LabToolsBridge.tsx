import {
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { useLabHydration } from './labHydrationContext'
import { LabToolsBridgeContext } from './labToolsBridgeContext'
import {
  applyLabsShareFileToWorkspace,
  buildLabsShareFileFromWorkspace,
} from './labShareActions'
import type { LabsShareFile } from '../labsShareCodec'
import type { PendingLabUiAction, SelectResearchHandle } from './labToolsTypes'
import type { ResearchData } from '../types/research'

export function LabToolsBridgeProvider({
  data,
  children,
}: {
  data: ResearchData
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
  }, [hydrated])

  const openCompareDialog = useCallback(() => {
    if (!hydrated) return
    if (researchUiRef.current) {
      researchUiRef.current.openCompareDialog()
      return
    }
    pendingUiRef.current = 'compare'
  }, [hydrated])

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
