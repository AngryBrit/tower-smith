import {
  useCallback,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  flattenTowerBuild,
  type TowerBuildPersistedV1,
} from './towerBuildStorage'
import { mergeWorkspaceLab, type TowerWorkspaceV1 } from './towerWorkspaceStorage'
import { TowerWorkspaceContext } from './towerWorkspaceContext'
import type { TowerWorkspaceContextValue } from './towerWorkspaceContext'

export function TowerWorkspaceProvider({
  workspace,
  setWorkspace,
  scratchWorkspace,
  setScratchWorkspace,
  children,
}: {
  workspace: TowerWorkspaceV1
  setWorkspace: Dispatch<SetStateAction<TowerWorkspaceV1>>
  scratchWorkspace: TowerWorkspaceV1
  setScratchWorkspace: Dispatch<SetStateAction<TowerWorkspaceV1>>
  children: ReactNode
}) {
  const workshopFlat = useMemo(() => flattenTowerBuild(workspace.build), [workspace.build])
  const scratchWorkshopFlat = useMemo(
    () => flattenTowerBuild(scratchWorkspace.build),
    [scratchWorkspace.build],
  )

  const setLabLevelOverrides = useCallback<Dispatch<SetStateAction<Record<string, number>>>>(
    (action) => {
      setWorkspace((prev) => {
        const nextOverrides =
          typeof action === 'function' ? action(prev.lab.levelOverrides) : action
        return mergeWorkspaceLab(prev, { levelOverrides: nextOverrides })
      })
    },
    [setWorkspace],
  )

  const setTowerBuild = useCallback<Dispatch<SetStateAction<TowerBuildPersistedV1>>>(
    (action) => {
      setWorkspace((prev) => {
        const nextBuild = typeof action === 'function' ? action(prev.build) : action
        return { ...prev, build: nextBuild }
      })
    },
    [setWorkspace],
  )

  const setScratchTowerBuild = useCallback<Dispatch<SetStateAction<TowerBuildPersistedV1>>>(
    (action) => {
      setScratchWorkspace((prev) => {
        const nextBuild = typeof action === 'function' ? action(prev.build) : action
        return { ...prev, build: nextBuild }
      })
    },
    [setScratchWorkspace],
  )

  const value = useMemo(
    (): TowerWorkspaceContextValue => ({
      workspace,
      setWorkspace,
      scratchWorkspace,
      setScratchWorkspace,
      labLevelOverrides: workspace.lab.levelOverrides,
      setLabLevelOverrides,
      gameResearchLevel: workspace.lab.gameResearchLevel,
      towerBuild: workspace.build,
      setTowerBuild,
      scratchTowerBuild: scratchWorkspace.build,
      setScratchTowerBuild,
      workshopFlat,
      scratchWorkshopFlat,
    }),
    [
      workspace,
      setWorkspace,
      scratchWorkspace,
      setScratchWorkspace,
      setLabLevelOverrides,
      setTowerBuild,
      setScratchTowerBuild,
      workshopFlat,
      scratchWorkshopFlat,
    ],
  )

  return (
    <TowerWorkspaceContext.Provider value={value}>{children}</TowerWorkspaceContext.Provider>
  )
}
