const CACHE_KEY_PREFIX = 'tower-effective-paths-linked-sheets-v1:'

export const EFFECTIVE_PATHS_LINKED_SHEETS_CACHE_KEY_PREFIX = CACHE_KEY_PREFIX

type LinkedSpreadsheetCacheEntry = {
  linkedSpreadsheetIds: string[]
}

function cacheKey(masterSpreadsheetId: string): string {
  return `${CACHE_KEY_PREFIX}${masterSpreadsheetId.trim()}`
}

function uniqueSpreadsheetIds(ids: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    const trimmed = id.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/** Linked workbook IDs remembered for a given IDS Master (device-local). */
export function readCachedLinkedSpreadsheetIds(masterSpreadsheetId: string): string[] {
  if (!masterSpreadsheetId.trim()) return []
  try {
    const raw = localStorage.getItem(cacheKey(masterSpreadsheetId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as LinkedSpreadsheetCacheEntry
    if (!Array.isArray(parsed.linkedSpreadsheetIds)) return []
    return uniqueSpreadsheetIds(parsed.linkedSpreadsheetIds)
  } catch {
    return []
  }
}

export function writeCachedLinkedSpreadsheetIds(
  masterSpreadsheetId: string,
  linkedSpreadsheetIds: readonly string[],
): void {
  if (!masterSpreadsheetId.trim()) return
  const linked = uniqueSpreadsheetIds(linkedSpreadsheetIds).filter(
    (id) => id !== masterSpreadsheetId.trim(),
  )
  try {
    if (linked.length === 0) {
      localStorage.removeItem(cacheKey(masterSpreadsheetId))
      return
    }
    const payload: LinkedSpreadsheetCacheEntry = { linkedSpreadsheetIds: linked }
    localStorage.setItem(cacheKey(masterSpreadsheetId), JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Remove cached linked workbook IDs for every IDS Master on this device. */
export function clearAllEffectivePathsLinkedSpreadsheetCache(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_KEY_PREFIX)) keys.push(key)
    }
    for (const key of keys) {
      localStorage.removeItem(key)
    }
  } catch {
    /* private mode */
  }
}
