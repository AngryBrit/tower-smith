import { readGuardianChipState, sanitizeGuardianChipState } from '../guardianChipStorage'
import { parseLabPresetsFile, type LabPreset } from '../labPresetsStorage'
import {
  buildLabPresetsPayloadWithWorkspace,
  TOWER_LAB_PRESETS_STORAGE_KEY,
} from '../towerWorkspacePresets'
import {
  defaultTowerWorkspace,
  syncWorkspaceThemesFromStorage,
  type TowerWorkspaceV1,
} from '../towerWorkspaceStorage'
import {
  sanitizeTowerBuild,
  type TowerBuildPersistedV1,
} from '../towerBuildStorage'
import { buildAccountWorkspaceBackup } from './validate'
import type { AccountWorkspaceBackupV1 } from './types'

export function hasNonEmptyPresetLabelsInBuild(build: TowerBuildPersistedV1): boolean {
  return (
    build.cards.cardPresetLabels.some((label) => label.trim().length > 0) ||
    build.modules.modulePresetLabels.some((label) => label.trim().length > 0)
  )
}

export function hasMeaningfulWorkspaceData(
  workspace: TowerWorkspaceV1,
  scratchWorkspace: TowerWorkspaceV1,
): boolean {
  if (Object.keys(workspace.lab.levelOverrides).length > 0) return true
  if (workspace.lab.gameResearchLevel?.length) return true
  if (Object.keys(scratchWorkspace.lab.levelOverrides).length > 0) return true
  if (scratchWorkspace.lab.gameResearchLevel?.length) return true
  if (hasNonEmptyPresetLabelsInBuild(workspace.build)) return true
  if (hasNonEmptyPresetLabelsInBuild(scratchWorkspace.build)) return true
  return false
}

/** Factory-default payload pushed to the cloud after a full app reset. */
export function buildEmptyAccountWorkspaceBackup(
  updatedAt: string = new Date().toISOString(),
): AccountWorkspaceBackupV1 {
  const workspace = defaultTowerWorkspace()
  const scratchWorkspace = defaultTowerWorkspace()
  const labPresets = buildLabPresetsPayloadWithWorkspace(
    null,
    [],
    syncWorkspaceThemesFromStorage(workspace),
    syncWorkspaceThemesFromStorage(scratchWorkspace),
  )
  return buildAccountWorkspaceBackup(labPresets, sanitizeGuardianChipState(null), updatedAt)
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
    const scratchBuild = parsed.scratchBuild
      ? sanitizeTowerBuild(parsed.scratchBuild)
      : parsed.scratchWorkspace
        ? sanitizeTowerBuild(parsed.scratchWorkspace.build)
        : null
    if (scratchBuild && hasNonEmptyPresetLabelsInBuild(scratchBuild)) return true
    for (const preset of parsed.presets) {
      if (preset.build && hasNonEmptyPresetLabelsInBuild(sanitizeTowerBuild(preset.build))) {
        return true
      }
      if (
        preset.workspace &&
        hasNonEmptyPresetLabelsInBuild(sanitizeTowerBuild(preset.workspace.build))
      ) {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}
