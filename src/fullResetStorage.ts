import { seedThemeOwnedAfterFullReset } from './themeOwnedStorage'

/** Prefix for all TowerSmith browser persistence keys. */
export const TOWER_EXPORT_STORAGE_KEY_PREFIX = 'tower-export-'

/**
 * Survives `clearAllTowerExportStorage` and page reload; not a `tower-export-*` key.
 * Tells account sync to wipe the cloud backup instead of restoring it after a full reset.
 */
export const FULL_APP_RESET_PENDING_SESSION_KEY = 'towersmith-full-app-reset-pending-v1'

export function markFullAppResetPending(): void {
  try {
    sessionStorage.setItem(FULL_APP_RESET_PENDING_SESSION_KEY, '1')
  } catch {
    /* private mode */
  }
}

export function isFullAppResetPending(): boolean {
  try {
    return sessionStorage.getItem(FULL_APP_RESET_PENDING_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function clearFullAppResetPending(): void {
  try {
    sessionStorage.removeItem(FULL_APP_RESET_PENDING_SESSION_KEY)
  } catch {
    /* private mode */
  }
}

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
  markFullAppResetPending()
  clearAllTowerExportStorage()
  seedThemeOwnedAfterFullReset()
  window.location.reload()
}
