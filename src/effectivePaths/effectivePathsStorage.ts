export const EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY =
  'tower-effective-paths-spreadsheet-v1'
const SPREADSHEET_REF_STORAGE_KEY = EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY
const LEGACY_SPREADSHEET_REF_STORAGE_KEY = SPREADSHEET_REF_STORAGE_KEY

export const EFFECTIVE_PATHS_SPREADSHEET_REF_CHANGE_EVENT =
  'tower-effective-paths-spreadsheet-ref-change'

function storageKey(userId?: string | null): string {
  const id = userId?.trim()
  if (id) return `${SPREADSHEET_REF_STORAGE_KEY}:${id}`
  return LEGACY_SPREADSHEET_REF_STORAGE_KEY
}

export function readStoredSpreadsheetRef(userId?: string | null): string {
  try {
    return localStorage.getItem(storageKey(userId))?.trim() ?? ''
  } catch {
    return ''
  }
}

export function writeStoredSpreadsheetRef(value: string, userId?: string | null): void {
  try {
    const trimmed = value.trim()
    const key = storageKey(userId)
    if (!trimmed) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, trimmed)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EFFECTIVE_PATHS_SPREADSHEET_REF_CHANGE_EVENT))
    }
  } catch {
    /* ignore quota / private mode */
  }
}

/** Copy a pre-login (device-local) IDS Master ref onto the signed-in account once. */
export function migrateLegacySpreadsheetRef(userId: string): void {
  if (readStoredSpreadsheetRef(userId)) return
  const legacy = readStoredSpreadsheetRef(null)
  if (legacy) writeStoredSpreadsheetRef(legacy, userId)
}

/** Remove every Effective Paths spreadsheet ref key (anonymous and per-account). */
export function clearAllEffectivePathsSpreadsheetRefs(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key === EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY ||
        key?.startsWith(`${EFFECTIVE_PATHS_SPREADSHEET_REF_STORAGE_KEY}:`)
      ) {
        keys.push(key)
      }
    }
    for (const key of keys) {
      localStorage.removeItem(key)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EFFECTIVE_PATHS_SPREADSHEET_REF_CHANGE_EVENT))
    }
  } catch {
    /* private mode */
  }
}
