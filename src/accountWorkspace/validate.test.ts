import { describe, expect, it } from 'vitest'
import { readGuardianChipState } from '../guardianChipStorage'
import {
  buildAccountWorkspaceBackup,
  parseAccountWorkspaceBackup,
  validateAccountWorkspaceBackupBytes,
} from './validate'

describe('parseAccountWorkspaceBackup', () => {
  it('accepts a valid v1 backup', () => {
    const backup = buildAccountWorkspaceBackup(
      {
        v: 1,
        activePresetId: null,
        presets: [],
        scratchOverrides: { 'attack-damage': 3 },
      },
      readGuardianChipState(),
      '2026-06-13T10:00:00.000Z',
    )
    const parsed = parseAccountWorkspaceBackup(backup)
    expect(parsed).not.toBeNull()
    expect(parsed?.v).toBe(1)
    expect(parsed?.updatedAt).toBe('2026-06-13T10:00:00.000Z')
    expect(parsed?.labPresets.scratchOverrides).toEqual({ 'attack-damage': 3 })
  })

  it('rejects invalid versions', () => {
    expect(parseAccountWorkspaceBackup({ v: 2, updatedAt: '2026-06-13T10:00:00.000Z' })).toBeNull()
  })
})

describe('validateAccountWorkspaceBackupBytes', () => {
  it('flags oversized payloads', () => {
    expect(validateAccountWorkspaceBackupBytes(600_000)).toBeNull()
    expect(validateAccountWorkspaceBackupBytes(3_000_000)).toBe('too_large')
  })
})
