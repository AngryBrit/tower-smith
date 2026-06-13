import { applyTowerThemes } from '../towerDataThemes'
import { writeGuardianChipState } from '../guardianChipStorage'
import {
  readStoredSpreadsheetRef,
  writeStoredSpreadsheetRef,
} from '../effectivePaths/effectivePathsStorage'
import {
  persistLabWorkspacesToLocalStorage,
  readTowerWorkspaceFromPresetsFile,
} from '../towerWorkspacePresets'
import { workspaceThemesSnapshot, type TowerWorkspaceV1 } from '../towerWorkspaceStorage'
import { writeLocalAccountWorkspaceUpdatedAt } from './localUpdatedAt'
import type { AccountWorkspaceBackupV1 } from './types'

export type AppliedAccountWorkspaceBackup = {
  workspace: TowerWorkspaceV1
  scratchWorkspace: TowerWorkspaceV1
}

export function applyAccountWorkspaceBackup(
  backup: AccountWorkspaceBackupV1,
  userId?: string | null,
): AppliedAccountWorkspaceBackup {
  const { workspace, scratchWorkspace } = readTowerWorkspaceFromPresetsFile(
    backup.labPresets,
  )
  applyTowerThemes(workspaceThemesSnapshot(workspace))
  writeGuardianChipState(backup.guardianChips)
  if (backup.effectivePathsIdsMasterRef !== undefined) {
    writeStoredSpreadsheetRef(backup.effectivePathsIdsMasterRef, userId)
  }
  persistLabWorkspacesToLocalStorage(workspace, scratchWorkspace)
  writeLocalAccountWorkspaceUpdatedAt(backup.updatedAt)
  return { workspace, scratchWorkspace }
}

export function applyCloudEffectivePathsIdsMasterRef(
  backup: AccountWorkspaceBackupV1,
  userId?: string | null,
): boolean {
  if (backup.effectivePathsIdsMasterRef === undefined) return false
  writeStoredSpreadsheetRef(backup.effectivePathsIdsMasterRef, userId)
  writeLocalAccountWorkspaceUpdatedAt(backup.updatedAt)
  return true
}

/** Copy cloud IDS Master ref into local storage when this device has none yet. */
export function mergeMissingCloudIdsMasterRef(
  backup: AccountWorkspaceBackupV1 | null,
  userId?: string | null,
): boolean {
  const cloudRef = backup?.effectivePathsIdsMasterRef?.trim()
  if (!cloudRef) return false
  if (readStoredSpreadsheetRef(userId)?.trim()) return false
  writeStoredSpreadsheetRef(cloudRef, userId)
  return true
}
