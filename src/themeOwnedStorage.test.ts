import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CATALOG_DEFAULTS_MIGRATION_KEY,
  migrateThemeOwnedCatalogDefaults,
  readThemeOwnedIds,
  seedThemeOwnedAfterFullReset,
  THEME_OWNED_STORAGE_KEY,
  writeThemeOwnedIds,
} from './themeOwnedStorage'

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

function stubBrowserGlobals() {
  vi.stubGlobal('localStorage', createLocalStorageMock())
  vi.stubGlobal('window', {
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
}

describe('themeOwnedStorage', () => {
  beforeEach(() => {
    stubBrowserGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns catalog defaults when no saved owned state exists', () => {
    const owned = readThemeOwnedIds()
    expect(owned.size).toBeGreaterThan(0)
    expect(owned.has('bg-plasma-field')).toBe(true)
  })

  it('seedThemeOwnedAfterFullReset leaves no owned themes after migration', () => {
    localStorage.clear()
    seedThemeOwnedAfterFullReset()
    migrateThemeOwnedCatalogDefaults()
    expect(readThemeOwnedIds().size).toBe(0)
    expect(localStorage.getItem(THEME_OWNED_STORAGE_KEY)).toBe('[]')
    expect(localStorage.getItem(CATALOG_DEFAULTS_MIGRATION_KEY)).toBe('1')
  })

  it('migrateThemeOwnedCatalogDefaults merges defaults on first visit only', () => {
    writeThemeOwnedIds(new Set(['bg-interstellar']))
    migrateThemeOwnedCatalogDefaults()
    const afterFirst = readThemeOwnedIds()
    expect(afterFirst.has('bg-interstellar')).toBe(true)
    expect(afterFirst.has('bg-plasma-field')).toBe(true)

    writeThemeOwnedIds(new Set())
    migrateThemeOwnedCatalogDefaults()
    expect(readThemeOwnedIds().size).toBe(0)
  })
})
