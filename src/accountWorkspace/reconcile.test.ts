import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readGuardianChipState } from '../guardianChipStorage'
import { reconcileAccountWorkspaceOnLogin } from './reconcile'
import type { AccountWorkspaceBackupV1 } from './types'
import { ACCOUNT_WORKSPACE_LOCAL_UPDATED_AT_KEY } from './localUpdatedAt'

function createLocalStorageMock() {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    key(index: number): string | null {
      return [...store.keys()][index] ?? null
    },
    getItem(key: string): string | null {
      return store.get(key) ?? null
    },
    setItem(key: string, value: string): void {
      store.set(key, value)
    },
    removeItem(key: string): void {
      store.delete(key)
    },
    clear(): void {
      store.clear()
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createLocalStorageMock())
})

function cloudBackup(updatedAt: string): AccountWorkspaceBackupV1 {
  return {
    v: 1,
    updatedAt,
    labPresets: {
      v: 1,
      activePresetId: null,
      presets: [],
      scratchOverrides: { 'attack-damage': 5 },
    },
    guardianChips: readGuardianChipState(),
  }
}

describe('reconcileAccountWorkspaceOnLogin', () => {
  it('pushes local when cloud is missing and local has data', () => {
    localStorage.setItem(
      'tower-export-lab-presets-v1',
      JSON.stringify({
        v: 1,
        activePresetId: null,
        presets: [],
        scratchOverrides: { 'attack-damage': 1 },
      }),
    )
    expect(reconcileAccountWorkspaceOnLogin(null)).toEqual({ action: 'push_local' })
  })

  it('applies cloud when local has no timestamp', () => {
    const backup = cloudBackup('2026-06-13T12:00:00.000Z')
    expect(reconcileAccountWorkspaceOnLogin(backup)).toEqual({
      action: 'apply_cloud',
      backup,
    })
  })

  it('applies cloud when cloud is newer than local', () => {
    const backup = cloudBackup('2026-06-13T13:00:00.000Z')
    localStorage.setItem(ACCOUNT_WORKSPACE_LOCAL_UPDATED_AT_KEY, '2026-06-13T12:00:00.000Z')
    expect(reconcileAccountWorkspaceOnLogin(backup)).toEqual({
      action: 'apply_cloud',
      backup,
    })
  })

  it('pushes local when local is newer than cloud and has data', () => {
    localStorage.setItem(
      'tower-export-lab-presets-v1',
      JSON.stringify({
        v: 1,
        activePresetId: null,
        presets: [],
        scratchOverrides: { 'attack-damage': 9 },
      }),
    )
    localStorage.setItem(ACCOUNT_WORKSPACE_LOCAL_UPDATED_AT_KEY, '2026-06-13T14:00:00.000Z')
    expect(reconcileAccountWorkspaceOnLogin(cloudBackup('2026-06-13T13:00:00.000Z'))).toEqual({
      action: 'push_local',
    })
  })

  it('noops when cloud backup only contains a legacy IDS ref', () => {
    const backup: AccountWorkspaceBackupV1 = {
      v: 1,
      updatedAt: '2026-06-13T12:00:00.000Z',
      labPresets: {
        v: 1,
        activePresetId: null,
        presets: [],
        scratchOverrides: {},
      },
      guardianChips: readGuardianChipState(),
      effectivePathsIdsMasterRef: '1IdsMasterWorkbookIdXXXXXXXXX',
    }
    expect(reconcileAccountWorkspaceOnLogin(backup)).toEqual({ action: 'noop' })
  })
})
