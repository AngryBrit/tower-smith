import { readTowerWorkspaceFromPresetsFile } from '../towerWorkspacePresets'
import { readLocalAccountWorkspaceUpdatedAt } from './localUpdatedAt'
import type { AccountWorkspaceBackupV1 } from './types'
import { hasMeaningfulLocalBackup, hasMeaningfulWorkspaceData } from './buildBackup'

export type AccountWorkspaceReconcileAction =
  | { action: 'apply_cloud'; backup: AccountWorkspaceBackupV1 }
  | { action: 'push_local' }
  | { action: 'noop' }

function compareIsoTimestamps(a: string, b: string): number {
  return Date.parse(a) - Date.parse(b)
}

export function hasMeaningfulCloudBackup(backup: AccountWorkspaceBackupV1): boolean {
  const { workspace, scratchWorkspace } = readTowerWorkspaceFromPresetsFile(
    backup.labPresets,
  )
  return hasMeaningfulWorkspaceData(workspace, scratchWorkspace)
}

export function reconcileAccountWorkspaceOnLogin(
  cloud: AccountWorkspaceBackupV1 | null,
): AccountWorkspaceReconcileAction {
  const localUpdatedAt = readLocalAccountWorkspaceUpdatedAt()
  const localMeaningful = hasMeaningfulLocalBackup()

  if (!cloud || !hasMeaningfulCloudBackup(cloud)) {
    return localMeaningful ? { action: 'push_local' } : { action: 'noop' }
  }

  if (!localUpdatedAt || !localMeaningful) {
    return { action: 'apply_cloud', backup: cloud }
  }

  const delta = compareIsoTimestamps(cloud.updatedAt, localUpdatedAt)
  if (delta > 0) {
    return { action: 'apply_cloud', backup: cloud }
  }
  if (delta < 0) {
    return { action: 'push_local' }
  }
  return { action: 'noop' }
}
