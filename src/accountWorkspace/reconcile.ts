import { readLocalAccountWorkspaceUpdatedAt } from './localUpdatedAt'
import type { AccountWorkspaceBackupV1 } from './types'
import { hasMeaningfulLocalBackup } from './buildBackup'

export type AccountWorkspaceReconcileAction =
  | { action: 'apply_cloud'; backup: AccountWorkspaceBackupV1 }
  | { action: 'push_local' }
  | { action: 'noop' }

function compareIsoTimestamps(a: string, b: string): number {
  return Date.parse(a) - Date.parse(b)
}

export function reconcileAccountWorkspaceOnLogin(
  cloud: AccountWorkspaceBackupV1 | null,
): AccountWorkspaceReconcileAction {
  const localUpdatedAt = readLocalAccountWorkspaceUpdatedAt()

  if (!cloud) {
    return hasMeaningfulLocalBackup() ? { action: 'push_local' } : { action: 'noop' }
  }

  if (!localUpdatedAt) {
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
