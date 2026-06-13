import { readGuardianChipState } from '../guardianChipStorage'
import { parseLabPresetsFile, type LabPreset } from '../labPresetsStorage'
import {
  buildLabPresetsPayloadWithWorkspace,
  TOWER_LAB_PRESETS_STORAGE_KEY,
} from '../towerWorkspacePresets'
import {
  syncWorkspaceThemesFromStorage,
  type TowerWorkspaceV1,
} from '../towerWorkspaceStorage'
import { buildAccountWorkspaceBackup } from './validate'
import type { AccountWorkspaceBackupV1 } from './types'

export function hasMeaningfulWorkspaceData(
  workspace: TowerWorkspaceV1,
  scratchWorkspace: TowerWorkspaceV1,
): boolean {
  if (Object.keys(workspace.lab.levelOverrides).length > 0) return true
  if (workspace.lab.gameResearchLevel?.length) return true
  if (Object.keys(scratchWorkspace.lab.levelOverrides).length > 0) return true
  if (scratchWorkspace.lab.gameResearchLevel?.length) return true
  return false
}

export function buildAccountWorkspaceBackupFromContext(
  workspace: TowerWorkspaceV1,
  scratchWorkspace: TowerWorkspaceV1,
  updatedAt: string = new Date().toISOString(),
): AccountWorkspaceBackupV1 {
  let activePresetId: string | null = null
  let presets: readonly LabPreset[] = []
  try {
    const raw = localStorage.getItem(TOWER_LAB_PRESETS_STORAGE_KEY)
    if (raw) {
      const parsed = parseLabPresetsFile(JSON.parse(raw))
      if (parsed) {
        activePresetId = parsed.activePresetId
        presets = parsed.presets
      }
    }
  } catch {
    /* ignore corrupt storage */
  }

  const labPresets = buildLabPresetsPayloadWithWorkspace(
    activePresetId,
    presets,
    syncWorkspaceThemesFromStorage(workspace),
    syncWorkspaceThemesFromStorage(scratchWorkspace),
  )

  return buildAccountWorkspaceBackup(
    labPresets,
    readGuardianChipState(),
    updatedAt,
  )
}

export function hasMeaningfulLocalBackup(): boolean {
  try {
    const raw = localStorage.getItem(TOWER_LAB_PRESETS_STORAGE_KEY)
    if (!raw) return false
    const parsed = parseLabPresetsFile(JSON.parse(raw))
    if (!parsed) return false
    if (parsed.presets.some((p) => Object.keys(p.levelOverrides).length > 0)) {
      return true
    }
    if (Object.keys(parsed.scratchOverrides).length > 0) return true
    const scratchLab = parsed.scratchWorkspace?.lab
    if (scratchLab?.gameResearchLevel?.length) return true
    if (scratchLab && Object.keys(scratchLab.levelOverrides).length > 0) return true
    const active = parsed.activePresetId
      ? parsed.presets.find((p) => p.id === parsed.activePresetId)
      : undefined
    if (active?.workspace && hasMeaningfulWorkspaceData(active.workspace, active.workspace)) {
      return true
    }
    return false
  } catch {
    return false
  }
}
