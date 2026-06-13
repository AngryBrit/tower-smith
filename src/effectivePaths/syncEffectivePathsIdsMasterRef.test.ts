import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readStoredSpreadsheetRef, writeStoredSpreadsheetRef } from './effectivePathsStorage'
import {
  migrateIdsMasterRefFromWorkspaceBackup,
  persistEffectivePathsIdsMasterRef,
  syncEffectivePathsIdsMasterRefOnLogin,
} from './syncEffectivePathsIdsMasterRef'

const updateUserEffectivePathsIdsMasterRef = vi.fn()

vi.mock('../profile/profileApi', () => ({
  updateUserEffectivePathsIdsMasterRef: (...args: unknown[]) =>
    updateUserEffectivePathsIdsMasterRef(...args),
}))

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
  updateUserEffectivePathsIdsMasterRef.mockReset()
  updateUserEffectivePathsIdsMasterRef.mockResolvedValue({ ok: true })
})

describe('syncEffectivePathsIdsMasterRefOnLogin', () => {
  it('writes profile ref to local storage', async () => {
    const changed = await syncEffectivePathsIdsMasterRefOnLogin(
      'user-1',
      '1IdsMasterWorkbookIdXXXXXXXXX',
    )
    expect(changed).toBe(true)
    expect(readStoredSpreadsheetRef('user-1')).toBe('1IdsMasterWorkbookIdXXXXXXXXX')
    expect(updateUserEffectivePathsIdsMasterRef).not.toHaveBeenCalled()
  })

  it('uploads local ref when profile is empty', async () => {
    writeStoredSpreadsheetRef('local-sheet', 'user-1')
    const changed = await syncEffectivePathsIdsMasterRefOnLogin('user-1', null)
    expect(changed).toBe(true)
    expect(updateUserEffectivePathsIdsMasterRef).toHaveBeenCalledWith('user-1', 'local-sheet')
  })
})

describe('migrateIdsMasterRefFromWorkspaceBackup', () => {
  it('migrates legacy workspace backup refs onto profile and local storage', async () => {
    const migrated = await migrateIdsMasterRefFromWorkspaceBackup(
      'user-1',
      '1IdsMasterWorkbookIdXXXXXXXXX',
    )
    expect(migrated).toBe(true)
    expect(readStoredSpreadsheetRef('user-1')).toBe('1IdsMasterWorkbookIdXXXXXXXXX')
    expect(updateUserEffectivePathsIdsMasterRef).toHaveBeenCalledWith(
      'user-1',
      '1IdsMasterWorkbookIdXXXXXXXXX',
    )
  })

  it('does not overwrite an existing local ref', async () => {
    writeStoredSpreadsheetRef('local-sheet', 'user-1')
    const migrated = await migrateIdsMasterRefFromWorkspaceBackup(
      'user-1',
      'cloud-sheet',
    )
    expect(migrated).toBe(false)
    expect(readStoredSpreadsheetRef('user-1')).toBe('local-sheet')
  })
})

describe('persistEffectivePathsIdsMasterRef', () => {
  it('writes local storage and profile when signed in', async () => {
    const result = await persistEffectivePathsIdsMasterRef('user-1', 'saved-sheet')
    expect(result).toEqual({ ok: true })
    expect(readStoredSpreadsheetRef('user-1')).toBe('saved-sheet')
    expect(updateUserEffectivePathsIdsMasterRef).toHaveBeenCalledWith('user-1', 'saved-sheet')
  })

  it('writes local storage only when anonymous', async () => {
    const result = await persistEffectivePathsIdsMasterRef(null, 'anon-sheet')
    expect(result).toEqual({ ok: true })
    expect(readStoredSpreadsheetRef(null)).toBe('anon-sheet')
    expect(updateUserEffectivePathsIdsMasterRef).not.toHaveBeenCalled()
  })
})
