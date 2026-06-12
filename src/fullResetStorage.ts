import { seedThemeOwnedAfterFullReset } from './themeOwnedStorage'

/** Prefix for all TowerSmith browser persistence keys. */
export const TOWER_EXPORT_STORAGE_KEY_PREFIX = 'tower-export-'

/** Returns every `localStorage` key owned by this app (current and legacy). */
export function listTowerExportStorageKeys(): string[] {
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(TOWER_EXPORT_STORAGE_KEY_PREFIX)) keys.push(key)
    }
  } catch {
    /* private mode */
  }
  return keys
}

/** Remove all TowerSmith data from `localStorage` in this browser. */
export function clearAllTowerExportStorage(): void {
  for (const key of listTowerExportStorageKeys()) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}

/**
 * Wipe all stored app data and reload so every panel re-reads defaults.
 * Call only after the user confirms a full reset.
 */
export function performFullAppReset(): void {
  clearAllTowerExportStorage()
  seedThemeOwnedAfterFullReset()
  window.location.reload()
}
