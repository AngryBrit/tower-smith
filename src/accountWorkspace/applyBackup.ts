import { applyTowerThemes } from '../towerDataThemes'
import { writeGuardianChipState } from '../guardianChipStorage'
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
): AppliedAccountWorkspaceBackup {
  const { workspace, scratchWorkspace } = readTowerWorkspaceFromPresetsFile(
    backup.labPresets,
  )
  applyTowerThemes(workspaceThemesSnapshot(workspace))
  writeGuardianChipState(backup.guardianChips)
  persistLabWorkspacesToLocalStorage(workspace, scratchWorkspace)
  writeLocalAccountWorkspaceUpdatedAt(backup.updatedAt)
  return { workspace, scratchWorkspace }
}
