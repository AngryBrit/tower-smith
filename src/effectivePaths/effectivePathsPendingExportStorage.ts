import type { EffectivePathsPendingExport } from './effectivePathsStaging'

export type { EffectivePathsPendingExport } from './effectivePathsStaging'

const STORAGE_KEY = 'tower-effective-paths-pending-exports-v1'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function readAll(): EffectivePathsPendingExport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const now = Date.now()
    return parsed.filter((entry): entry is EffectivePathsPendingExport => {
      if (!entry || typeof entry !== 'object') return false
      const createdAt = (entry as { createdAt?: unknown }).createdAt
      if (typeof createdAt !== 'number' || now - createdAt > MAX_AGE_MS) return false
      const stagedSheets = (entry as { stagedSheets?: unknown }).stagedSheets
      return Array.isArray(stagedSheets) && stagedSheets.length > 0
    })
  } catch {
    return []
  }
}

function writeAll(entries: EffectivePathsPendingExport[]): void {
  try {
    if (entries.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore quota / private mode */
  }
}

export function readPendingEffectivePathsExports(): EffectivePathsPendingExport[] {
  return readAll()
}

export function addPendingEffectivePathsExport(entry: EffectivePathsPendingExport): void {
  const existing = readAll().filter((row) => row.id !== entry.id)
  writeAll([...existing, entry])
}

export function removePendingEffectivePathsExport(id: string): void {
  writeAll(readAll().filter((row) => row.id !== id))
}

export function removePendingExportsForTarget(syncTarget: string): void {
  writeAll(readAll().filter((row) => row.syncTarget !== syncTarget))
}

export function clearPendingEffectivePathsExports(): void {
  writeAll([])
}
