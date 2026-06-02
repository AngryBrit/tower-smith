import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { useI18n } from '../i18n'
import { parseLabPresetsFile, type LabPreset } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import {
  buildLabPresetsPayloadWithWorkspace,
  TOWER_LAB_PRESETS_STORAGE_KEY,
} from '../towerWorkspacePresets'
import type { LabPersistedV1 } from '../towerWorkspaceStorage'
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
  const fmtRef = useRef(fmt)
  useEffect(() => {
    fmtRef.current = fmt
  }, [fmt])

  function shouldKeepLabStateDuringHydrate(lab: LabPersistedV1): boolean {
    return Boolean(lab.gameResearchLevel?.length) || Object.keys(lab.levelOverrides).length > 0
  }

  useEffect(() => {
    let cancelled = false

    void hydrateWorkspaceFromStorage(data, fmtRef.current).then((result) => {
      if (cancelled) return
      setWorkspace((prev) =>
        shouldKeepLabStateDuringHydrate(prev.lab) ? prev : result.workspace,
      )
      setScratchWorkspace((prev) =>
        shouldKeepLabStateDuringHydrate(prev.lab) ? prev : result.scratchWorkspace,
      )
      if (result.importNotice) setImportNotice(result.importNotice)
      setHydrated(true)
    })

    return () => {
      cancelled = true
    }
  }, [data, setScratchWorkspace, setWorkspace])

  useEffect(() => {
    if (!hydrated) return
    try {
      let activePresetId: string | null = null
      let presets: readonly LabPreset[] = []
      const raw = localStorage.getItem(TOWER_LAB_PRESETS_STORAGE_KEY)
      if (raw) {
        const parsed = parseLabPresetsFile(JSON.parse(raw))
        if (parsed) {
          activePresetId = parsed.activePresetId
          presets = parsed.presets
        }
      }
      const payload = buildLabPresetsPayloadWithWorkspace(
        activePresetId,
        presets,
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
