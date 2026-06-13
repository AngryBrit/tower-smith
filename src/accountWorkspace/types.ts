import type { GuardianChipState } from '../guardianChipStorage'
import type { LabPresetsFileV1 } from '../labPresetsStorage'

export const ACCOUNT_WORKSPACE_BACKUP_VERSION = 1 as const

export const ACCOUNT_WORKSPACE_MAX_BYTES = 2_097_152

export type AccountWorkspaceBackupV1 = {
  v: typeof ACCOUNT_WORKSPACE_BACKUP_VERSION
  updatedAt: string
  labPresets: LabPresetsFileV1
  guardianChips: GuardianChipState
  /** IDS Master spreadsheet URL or ID for Effective Paths sync. */
  effectivePathsIdsMasterRef?: string
}
