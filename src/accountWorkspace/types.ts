import type { GuardianChipState } from '../guardianChipStorage'
import type { LabPresetsFileV1 } from '../labPresetsStorage'

export const ACCOUNT_WORKSPACE_BACKUP_VERSION = 1 as const

export const ACCOUNT_WORKSPACE_MAX_BYTES = 512_000

export type AccountWorkspaceBackupV1 = {
  v: typeof ACCOUNT_WORKSPACE_BACKUP_VERSION
  updatedAt: string
  labPresets: LabPresetsFileV1
  guardianChips: GuardianChipState
}
