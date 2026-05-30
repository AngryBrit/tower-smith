import {
  createContext,
  useCallback,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { WorkshopPersistedV1 } from './labPresetsStorage'
import {
  type BotsPersistedV1,
  type CardsPersistedV1,
  type ModulesPersistedV1,
  type RelicsPersistedV1,
  type TowerBuildPersistedV1,
  type UltimatesPersistedV1,
  type WorkshopUpgradesPersistedV1,
} from './towerBuildStorage'
import { mergeWorkspaceBuildDomain, type TowerWorkspaceV1 } from './towerWorkspaceStorage'

export type TowerWorkspaceContextValue = {
  workspace: TowerWorkspaceV1
  setWorkspace: Dispatch<SetStateAction<TowerWorkspaceV1>>
  scratchWorkspace: TowerWorkspaceV1
  setScratchWorkspace: Dispatch<SetStateAction<TowerWorkspaceV1>>
  labLevelOverrides: Record<string, number>
  setLabLevelOverrides: Dispatch<SetStateAction<Record<string, number>>>
  towerBuild: TowerBuildPersistedV1
  setTowerBuild: Dispatch<SetStateAction<TowerBuildPersistedV1>>
  scratchTowerBuild: TowerBuildPersistedV1
  setScratchTowerBuild: Dispatch<SetStateAction<TowerBuildPersistedV1>>
  workshopFlat: WorkshopPersistedV1
  scratchWorkshopFlat: WorkshopPersistedV1
}

export const TowerWorkspaceContext = createContext<TowerWorkspaceContextValue | null>(null)

export function useTowerWorkspaceContext(): TowerWorkspaceContextValue {
  const ctx = useContext(TowerWorkspaceContext)
  if (!ctx) {
    throw new Error('useTowerWorkspaceContext must be used within TowerWorkspaceProvider')
  }
  return ctx
}

/** @deprecated Use useTowerWorkspaceContext */
export const useTowerBuildContext = useTowerWorkspaceContext

export function useWorkshopUpgrades(): [
  WorkshopUpgradesPersistedV1,
  (next: WorkshopUpgradesPersistedV1) => void,
] {
  const { workspace, setWorkspace } = useTowerWorkspaceContext()
  const setWorkshop = useCallback(
    (next: WorkshopUpgradesPersistedV1) => {
      setWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'workshop', next))
    },
    [setWorkspace],
  )
  return [workspace.build.workshop, setWorkshop]
}

export function useCardsPersistedWithScratch(): {
  cards: CardsPersistedV1
  setCards: (next: CardsPersistedV1) => void
  setScratchCards: (next: CardsPersistedV1) => void
} {
  const { workspace, setWorkspace, setScratchWorkspace } = useTowerWorkspaceContext()
  const setCards = useCallback(
    (next: CardsPersistedV1) => {
      setWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'cards', next))
    },
    [setWorkspace],
  )
  const setScratchCards = useCallback(
    (next: CardsPersistedV1) => {
      setScratchWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'cards', next))
    },
    [setScratchWorkspace],
  )
  return { cards: workspace.build.cards, setCards, setScratchCards }
}

export function useModulesPersistedWithScratch(): {
  modules: ModulesPersistedV1
  setModules: (next: ModulesPersistedV1) => void
  setScratchModules: (next: ModulesPersistedV1) => void
} {
  const { workspace, setWorkspace, setScratchWorkspace } = useTowerWorkspaceContext()
  const setModules = useCallback(
    (next: ModulesPersistedV1) => {
      setWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'modules', next))
    },
    [setWorkspace],
  )
  const setScratchModules = useCallback(
    (next: ModulesPersistedV1) => {
      setScratchWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'modules', next))
    },
    [setScratchWorkspace],
  )
  return { modules: workspace.build.modules, setModules, setScratchModules }
}

export function useRelicsPersistedWithScratch(): {
  relics: RelicsPersistedV1
  setRelics: (next: RelicsPersistedV1) => void
  setScratchRelics: (next: RelicsPersistedV1) => void
} {
  const { workspace, setWorkspace, setScratchWorkspace } = useTowerWorkspaceContext()
  const setRelics = useCallback(
    (next: RelicsPersistedV1) => {
      setWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'relics', next))
    },
    [setWorkspace],
  )
  const setScratchRelics = useCallback(
    (next: RelicsPersistedV1) => {
      setScratchWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'relics', next))
    },
    [setScratchWorkspace],
  )
  return { relics: workspace.build.relics, setRelics, setScratchRelics }
}

export function useBotsPersisted(): [BotsPersistedV1, (next: BotsPersistedV1) => void] {
  const { workspace, setWorkspace } = useTowerWorkspaceContext()
  const setBots = useCallback(
    (next: BotsPersistedV1) => {
      setWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'bots', next))
    },
    [setWorkspace],
  )
  return [workspace.build.bots, setBots]
}

export function useUltimatesPersisted(): [
  UltimatesPersistedV1,
  (next: UltimatesPersistedV1) => void,
] {
  const { workspace, setWorkspace } = useTowerWorkspaceContext()
  const setUltimates = useCallback(
    (next: UltimatesPersistedV1) => {
      setWorkspace((prev) => mergeWorkspaceBuildDomain(prev, 'ultimates', next))
    },
    [setWorkspace],
  )
  return [workspace.build.ultimates, setUltimates]
}
