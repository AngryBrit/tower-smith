import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readStoredSpreadsheetRef, writeStoredSpreadsheetRef } from '../effectivePaths/effectivePathsStorage'
import { readGuardianChipState } from '../guardianChipStorage'
import { mergeMissingCloudIdsMasterRef } from './applyBackup'
import type { AccountWorkspaceBackupV1 } from './types'

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

function cloudBackupWithIds(ids: string): AccountWorkspaceBackupV1 {
  return {
    v: 1,
    updatedAt: '2026-06-13T12:00:00.000Z',
    labPresets: {
      v: 1,
      activePresetId: null,
      presets: [],
      scratchOverrides: {},
    },
    guardianChips: readGuardianChipState(),
    effectivePathsIdsMasterRef: ids,
  }
}

describe('mergeMissingCloudIdsMasterRef', () => {
  it('copies cloud IDS when local is empty', () => {
    const backup = cloudBackupWithIds('1IdsMasterWorkbookIdXXXXXXXXX')
    expect(mergeMissingCloudIdsMasterRef(backup, 'user-1')).toBe(true)
    expect(readStoredSpreadsheetRef('user-1')).toBe('1IdsMasterWorkbookIdXXXXXXXXX')
  })

  it('does not overwrite an existing local IDS ref', () => {
    writeStoredSpreadsheetRef('local-sheet', 'user-1')
    const backup = cloudBackupWithIds('cloud-sheet')
    expect(mergeMissingCloudIdsMasterRef(backup, 'user-1')).toBe(false)
    expect(readStoredSpreadsheetRef('user-1')).toBe('local-sheet')
  })

  it('ignores empty cloud refs', () => {
    expect(mergeMissingCloudIdsMasterRef(cloudBackupWithIds(''), 'user-1')).toBe(false)
    expect(readStoredSpreadsheetRef('user-1')).toBe('')
  })
})
