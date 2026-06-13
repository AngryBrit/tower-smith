import {
  parseLabPresetsFile,
  type LabPresetsFileV1,
} from '../labPresetsStorage'
import {
  sanitizeGuardianChipState,
  type GuardianChipState,
} from '../guardianChipStorage'
import {
  ACCOUNT_WORKSPACE_BACKUP_VERSION,
  ACCOUNT_WORKSPACE_MAX_BYTES,
  type AccountWorkspaceBackupV1,
} from './types'

function isIsoTimestamp(value: string): boolean {
  const ms = Date.parse(value)
  return Number.isFinite(ms)
}

const EFFECTIVE_PATHS_IDS_MASTER_REF_MAX_LEN = 500

function parseEffectivePathsIdsMasterRef(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.length > EFFECTIVE_PATHS_IDS_MASTER_REF_MAX_LEN) return undefined
  return trimmed
}

export function parseAccountWorkspaceBackup(raw: unknown): AccountWorkspaceBackupV1 | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  if (o.v !== ACCOUNT_WORKSPACE_BACKUP_VERSION) return null
  if (typeof o.updatedAt !== 'string' || !isIsoTimestamp(o.updatedAt)) return null

  const labPresets = parseLabPresetsFile(o.labPresets)
  if (!labPresets) return null

  const guardianChips = sanitizeGuardianChipState(o.guardianChips)
  const effectivePathsIdsMasterRef = parseEffectivePathsIdsMasterRef(
    o.effectivePathsIdsMasterRef,
  )
  if (o.effectivePathsIdsMasterRef !== undefined && effectivePathsIdsMasterRef === undefined) {
    return null
  }

  return {
    v: ACCOUNT_WORKSPACE_BACKUP_VERSION,
    updatedAt: o.updatedAt,
    labPresets,
    guardianChips,
    ...(effectivePathsIdsMasterRef !== undefined
      ? { effectivePathsIdsMasterRef }
      : {}),
  }
}

export function validateAccountWorkspaceBackupBytes(
  byteLength: number,
): 'too_large' | null {
  if (byteLength > ACCOUNT_WORKSPACE_MAX_BYTES) return 'too_large'
  return null
}

export function buildAccountWorkspaceBackup(
  labPresets: LabPresetsFileV1,
  guardianChips: GuardianChipState,
  updatedAt: string = new Date().toISOString(),
  effectivePathsIdsMasterRef?: string,
): AccountWorkspaceBackupV1 {
  const ref = effectivePathsIdsMasterRef?.trim()
  return {
    v: ACCOUNT_WORKSPACE_BACKUP_VERSION,
    updatedAt,
    labPresets,
    guardianChips,
    ...(ref ? { effectivePathsIdsMasterRef: ref } : {}),
  }
}
