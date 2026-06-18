import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllEffectivePathsStorage } from './effectivePaths/clearEffectivePathsStorage'
import {
  EFFECTIVE_PATHS_LINKED_SHEETS_CACHE_KEY_PREFIX,
} from './effectivePaths/effectivePathsLinkedSpreadsheetCache'
import {
  EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY,
} from './effectivePaths/effectivePathsStorage'
import {
  clearAllTowerExportStorage,
  clearFullAppResetPending,
  isFullAppResetPending,
  listTowerExportStorageKeys,
  markFullAppResetPending,
  performFullAppReset,
  TOWER_EXPORT_STORAGE_KEY_PREFIX,
} from './fullResetStorage'
import {
  CATALOG_DEFAULTS_MIGRATION_KEY,
  migrateThemeOwnedCatalogDefaults,
  readThemeOwnedIds,
  THEME_OWNED_STORAGE_KEY,
} from './themeOwnedStorage'

function createStorageMock() {
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

function stubBrowserGlobals() {
  vi.stubGlobal('localStorage', createStorageMock())
  vi.stubGlobal('sessionStorage', createStorageMock())
  vi.stubGlobal('window', {
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: { reload: vi.fn() },
  })
}

describe('fullResetStorage', () => {
  beforeEach(() => {
    stubBrowserGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists and clears only tower-export keys', () => {
    localStorage.setItem(`${TOWER_EXPORT_STORAGE_KEY_PREFIX}lab-presets-v1`, '{}')
    localStorage.setItem(`${TOWER_EXPORT_STORAGE_KEY_PREFIX}locale-v1`, 'en')
    localStorage.setItem('other-app-key', 'keep')

    expect(listTowerExportStorageKeys().sort()).toEqual([
      `${TOWER_EXPORT_STORAGE_KEY_PREFIX}lab-presets-v1`,
      `${TOWER_EXPORT_STORAGE_KEY_PREFIX}locale-v1`,
    ])

    clearAllTowerExportStorage()

    expect(listTowerExportStorageKeys()).toEqual([])
    expect(localStorage.getItem('other-app-key')).toBe('keep')
  })

  it('performFullAppReset seeds empty theme owned before reload', () => {
    localStorage.setItem(`${TOWER_EXPORT_STORAGE_KEY_PREFIX}locale-v1`, 'en')
    localStorage.setItem(THEME_OWNED_STORAGE_KEY, JSON.stringify(['bg-koi-pond']))

    performFullAppReset()

    expect(isFullAppResetPending()).toBe(true)
    expect(window.location.reload).toHaveBeenCalledOnce()
    expect(localStorage.getItem(THEME_OWNED_STORAGE_KEY)).toBe('[]')
    expect(localStorage.getItem(CATALOG_DEFAULTS_MIGRATION_KEY)).toBe('1')
    migrateThemeOwnedCatalogDefaults()
    expect(readThemeOwnedIds().size).toBe(0)
  })

  it('performFullAppReset clears effective paths local storage', () => {
    localStorage.setItem(EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY, 'legacy-sheet')
    localStorage.setItem(`${EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY}:user-1`, 'user-sheet')
    localStorage.setItem(
      `${EFFECTIVE_PATHS_LINKED_SHEETS_CACHE_KEY_PREFIX}master-1`,
      JSON.stringify({ linkedSpreadsheetIds: ['child-1'] }),
    )
    localStorage.setItem('tower-effective-paths-pending-exports-v1', '[]')
    sessionStorage.setItem('towersmith_google_drive_file_token', '{"accessToken":"x","expiresAt":9e15}')

    performFullAppReset()

    expect(localStorage.getItem(EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(`${EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY}:user-1`)).toBeNull()
    expect(localStorage.getItem(`${EFFECTIVE_PATHS_LINKED_SHEETS_CACHE_KEY_PREFIX}master-1`)).toBeNull()
    expect(localStorage.getItem('tower-effective-paths-pending-exports-v1')).toBeNull()
    expect(sessionStorage.getItem('towersmith_google_drive_file_token')).toBeNull()
  })

  it('clearAllEffectivePathsStorage removes spreadsheet, cache, and pending export keys', () => {
    localStorage.setItem(EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY, 'legacy-sheet')
    localStorage.setItem(`${EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY}:acct`, 'acct-sheet')
    localStorage.setItem(
      `${EFFECTIVE_PATHS_LINKED_SHEETS_CACHE_KEY_PREFIX}master`,
      JSON.stringify({ linkedSpreadsheetIds: ['child'] }),
    )
    localStorage.setItem('tower-effective-paths-pending-exports-v1', '[]')
    localStorage.setItem('other-app-key', 'keep')

    clearAllEffectivePathsStorage()

    expect(localStorage.getItem(EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(`${EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY}:acct`)).toBeNull()
    expect(localStorage.getItem(`${EFFECTIVE_PATHS_LINKED_SHEETS_CACHE_KEY_PREFIX}master`)).toBeNull()
    expect(localStorage.getItem('tower-effective-paths-pending-exports-v1')).toBeNull()
    expect(localStorage.getItem('other-app-key')).toBe('keep')
  })

  it('full reset pending flag survives localStorage wipe and can be cleared', () => {
    markFullAppResetPending()
    expect(isFullAppResetPending()).toBe(true)

    clearAllTowerExportStorage()
    expect(isFullAppResetPending()).toBe(true)

    clearFullAppResetPending()
    expect(isFullAppResetPending()).toBe(false)
  })
})
