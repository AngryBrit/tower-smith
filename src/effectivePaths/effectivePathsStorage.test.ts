import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  migrateLegacySpreadsheetRef,
  readStoredSpreadsheetRef,
  writeStoredSpreadsheetRef,
} from './effectivePathsStorage'

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

describe('effectivePathsStorage', () => {
  it('stores spreadsheet refs per signed-in user', () => {
    writeStoredSpreadsheetRef('user-a-sheet', 'user-a')
    writeStoredSpreadsheetRef('user-b-sheet', 'user-b')

    expect(readStoredSpreadsheetRef('user-a')).toBe('user-a-sheet')
    expect(readStoredSpreadsheetRef('user-b')).toBe('user-b-sheet')
    expect(readStoredSpreadsheetRef('user-c')).toBe('')
  })

  it('keeps anonymous refs separate from account refs', () => {
    writeStoredSpreadsheetRef('legacy-sheet')
    writeStoredSpreadsheetRef('account-sheet', 'acct-1')

    expect(readStoredSpreadsheetRef(null)).toBe('legacy-sheet')
    expect(readStoredSpreadsheetRef('acct-1')).toBe('account-sheet')
  })

  it('migrates a legacy ref onto first login', () => {
    writeStoredSpreadsheetRef('legacy-sheet')
    migrateLegacySpreadsheetRef('acct-1')

    expect(readStoredSpreadsheetRef('acct-1')).toBe('legacy-sheet')
    expect(readStoredSpreadsheetRef(null)).toBe('legacy-sheet')
  })
})
