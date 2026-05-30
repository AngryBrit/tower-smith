import { buildLabsShareFile, type LabsShareFile } from '../labsShareCodec'
import { sanitizeLevelOverrides } from '../labLevelOverridesSanitize'
import { sanitizeWorkshopPersisted } from '../labPresetsStorage'
import {
  applyTowerThemes,
  readTowerThemesSnapshot,
  sanitizeThemeOwnedIds,
} from '../towerDataThemes'
import { mergeWorkspaceBuild } from '../towerWorkspaceStorage'
import { splitTowerBuild } from '../towerBuildStorage'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import type { TowerWorkspaceV1 } from '../towerWorkspaceStorage'

export function buildLabsShareFileFromWorkspace(
  levelOverrides: Record<string, number>,
  workshopFlat: WorkshopPersistedV1,
): LabsShareFile {
  return buildLabsShareFile(
    levelOverrides,
    workshopFlat,
    undefined,
    readTowerThemesSnapshot(),
  )
}

export function applyLabsShareFileToWorkspace(
  data: ResearchData,
  file: LabsShareFile,
  workshopFlat: WorkshopPersistedV1,
  setLevelOverrides: (next: Record<string, number>) => void,
  setWorkspace: (updater: (prev: TowerWorkspaceV1) => TowerWorkspaceV1) => void,
  setScratchWorkspace: (updater: (prev: TowerWorkspaceV1) => TowerWorkspaceV1) => void,
): boolean {
  try {
    const sanitized = sanitizeLevelOverrides(data, file.o as Record<string, unknown>)
    const ws =
      file.w !== undefined ? sanitizeWorkshopPersisted(file.w) : workshopFlat
    if (file.t) {
      applyTowerThemes({ ownedIds: sanitizeThemeOwnedIds(file.t.owned) })
    }
    setLevelOverrides(sanitized)
    const build = splitTowerBuild(ws)
    setWorkspace((prev) =>
      mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build),
    )
    setScratchWorkspace((prev) =>
      mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build),
    )
    return true
  } catch {
    return false
  }
}
