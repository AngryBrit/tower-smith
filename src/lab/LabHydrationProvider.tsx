import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { useI18n } from '../i18n'
import type { ResearchData } from '../types/research'
import {
  buildLabPresetsPayloadWithWorkspace,
  TOWER_LAB_PRESETS_STORAGE_KEY,
} from '../towerWorkspacePresets'
import { syncWorkspaceThemesFromStorage } from '../towerWorkspaceStorage'
import { LabHydrationContext } from './labHydrationContext'
import { hydrateWorkspaceFromStorage } from './workspaceHydration'

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
