import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import { useI18n } from '../i18n'
import type { ResearchData } from '../types/research'
import {
  buildLabPresetsPayloadWithWorkspace,
  TOWER_LAB_PRESETS_STORAGE_KEY,
} from '../towerWorkspacePresets'
import { syncWorkspaceThemesFromStorage } from '../towerWorkspaceStorage'
import { hydrateWorkspaceFromStorage } from './workspaceHydration'

type LabHydrationContextValue = {
  hydrated: boolean
  importNotice: string | null
  setImportNotice: Dispatch<SetStateAction<string | null>>
}

const LabHydrationContext = createContext<LabHydrationContextValue | null>(null)

export function LabHydrationProvider({
  data,
  children,
}: {
  data: ResearchData
  children: ReactNode
}) {
  const { fmt } = useI18n()
  const { workspace, setWorkspace, scratchWorkspace, setScratchWorkspace } =
    useTowerWorkspaceContext()
  const [hydrated, setHydrated] = useState(false)
  const [importNotice, setImportNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void hydrateWorkspaceFromStorage(data, fmt).then((result) => {
      if (cancelled) return
      setWorkspace(result.workspace)
      setScratchWorkspace(result.scratchWorkspace)
      if (result.importNotice) setImportNotice(result.importNotice)
      setHydrated(true)
    })

    return () => {
      cancelled = true
    }
  }, [data, fmt, setScratchWorkspace, setWorkspace])

  useEffect(() => {
    if (!hydrated) return
    try {
      const payload = buildLabPresetsPayloadWithWorkspace(
        null,
        [],
        syncWorkspaceThemesFromStorage(workspace),
        syncWorkspaceThemesFromStorage(scratchWorkspace),
      )
      localStorage.setItem(TOWER_LAB_PRESETS_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* quota / private mode */
    }
  }, [hydrated, workspace, scratchWorkspace])

  const value = useMemo(
    () => ({ hydrated, importNotice, setImportNotice }),
    [hydrated, importNotice],
  )

  return (
    <LabHydrationContext.Provider value={value}>{children}</LabHydrationContext.Provider>
  )
}

export function useLabHydration(): LabHydrationContextValue {
  const ctx = useContext(LabHydrationContext)
  if (!ctx) {
    throw new Error('useLabHydration must be used within LabHydrationProvider')
  }
  return ctx
}
