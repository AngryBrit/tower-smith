import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { normalizeImportNotice, type ImportNotice } from '../importNotice'
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
import type { ImportNoticeVariant } from '../importNotice'

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
  const [importNotice, setImportNoticeState] = useState<ImportNotice | null>(null)
  const fmtRef = useRef(fmt)
  useEffect(() => {
    fmtRef.current = fmt
  }, [fmt])

  const setImportNotice = useCallback(
    (value: SetStateAction<ImportNotice | string | null>) => {
      setImportNoticeState((prev) => normalizeImportNotice(
        typeof value === 'function' ? value(prev) : value,
      ))
    },
    [],
  )

  const publishImportNotice = useCallback(
    (message: string, variant: ImportNoticeVariant) => {
      setImportNoticeState({ message, variant })
    },
    [],
  )

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
      if (result.importNotice) setImportNoticeState(result.importNotice)
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
    () => ({ hydrated, importNotice, setImportNotice, publishImportNotice }),
    [hydrated, importNotice, publishImportNotice, setImportNotice],
  )

  return (
    <LabHydrationContext.Provider value={value}>{children}</LabHydrationContext.Provider>
  )
}
