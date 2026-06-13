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

export function hasMeaningfulCloudWorkspaceBackup(backup: AccountWorkspaceBackupV1): boolean {
  const { workspace, scratchWorkspace } = readTowerWorkspaceFromPresetsFile(
    backup.labPresets,
  )
  return hasMeaningfulWorkspaceData(workspace, scratchWorkspace)
}

/** @deprecated Use hasMeaningfulCloudWorkspaceBackup */
export function hasMeaningfulCloudBackup(backup: AccountWorkspaceBackupV1): boolean {
  return hasMeaningfulCloudWorkspaceBackup(backup)
}

export function reconcileAccountWorkspaceOnLogin(
  cloud: AccountWorkspaceBackupV1 | null,
): AccountWorkspaceReconcileAction {
  const localUpdatedAt = readLocalAccountWorkspaceUpdatedAt()
  const localSyncable = hasMeaningfulLocalBackup()

  if (!cloud || !hasMeaningfulCloudWorkspaceBackup(cloud)) {
    return localSyncable ? { action: 'push_local' } : { action: 'noop' }
  }

  if (!localUpdatedAt || !localSyncable) {
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

export function shouldApplyCloudWorkspaceBackup(backup: AccountWorkspaceBackupV1): boolean {
  return hasMeaningfulCloudWorkspaceBackup(backup)
}
