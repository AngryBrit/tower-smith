import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAllTowerExportStorage,
  listTowerExportStorageKeys,
  TOWER_EXPORT_STORAGE_KEY_PREFIX,
} from './fullResetStorage'

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

describe('fullResetStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
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
})
