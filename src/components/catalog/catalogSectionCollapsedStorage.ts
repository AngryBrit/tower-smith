export function readCatalogSectionCollapsed(storageKey: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, boolean> = {}
    for (const [key, val] of Object.entries(parsed)) {
      if (val === true) out[key] = true
    }
    return out
  } catch {
    return {}
  }
}

export function writeCatalogSectionCollapsed(
  storageKey: string,
  state: Record<string, boolean>,
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}
