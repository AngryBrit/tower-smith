import { useCallback, useEffect, useState } from 'react'
import { GAME_THEMES, type GameThemeEntry } from './data/gameThemes'

export const THEME_OWNED_STORAGE_KEY = 'tower-export-theme-owned-v2'
export const CATALOG_DEFAULTS_MIGRATION_KEY =
  'tower-export-theme-owned-catalog-defaults-v2'

const CHANGE_EVENT = 'tower-export-theme-owned-change'

function catalogDefaultOwnedIds(): Set<string> {
  const ids = new Set<string>()
  for (const entry of GAME_THEMES) {
    if (entry.ownedDefault) ids.add(entry.id)
  }
  return ids
}

function defaultOwnedIds(): Set<string> {
  return catalogDefaultOwnedIds()
}

export function readThemeOwnedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(THEME_OWNED_STORAGE_KEY)
    if (!raw) return defaultOwnedIds()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultOwnedIds()
    const ids = parsed.filter((x): x is string => typeof x === 'string')
    return new Set(ids)
  } catch {
    return defaultOwnedIds()
  }
}

/** One-time: merge catalog owned defaults (guardians, backgrounds, etc.) into saved state. */
export function migrateThemeOwnedCatalogDefaults(): void {
  try {
    if (localStorage.getItem(CATALOG_DEFAULTS_MIGRATION_KEY) === '1') return
    const defaults = catalogDefaultOwnedIds()
    if (defaults.size === 0) {
      localStorage.setItem(CATALOG_DEFAULTS_MIGRATION_KEY, '1')
      return
    }
    const owned = readThemeOwnedIds()
    const next = new Set(owned)
    let changed = false
    for (const id of defaults) {
      if (!next.has(id)) {
        next.add(id)
        changed = true
      }
    }
    if (changed) writeThemeOwnedIds(next)
    localStorage.setItem(CATALOG_DEFAULTS_MIGRATION_KEY, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

/** @deprecated Use migrateThemeOwnedCatalogDefaults */
export const migrateThemeOwnedGuardianDefaults = migrateThemeOwnedCatalogDefaults

export function writeThemeOwnedIds(owned: ReadonlySet<string>): void {
  try {
    localStorage.setItem(THEME_OWNED_STORAGE_KEY, JSON.stringify([...owned]))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

/**
 * After wiping all browser storage: persist empty owned themes and skip the
 * one-time catalog-default migration so reset does not reload dev/test skins.
 */
export function seedThemeOwnedAfterFullReset(): void {
  writeThemeOwnedIds(new Set())
  try {
    localStorage.setItem(CATALOG_DEFAULTS_MIGRATION_KEY, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

export function isThemeOwned(
  entry: GameThemeEntry,
  ownedIds: ReadonlySet<string>,
): boolean {
  return ownedIds.has(entry.id)
}

export function useThemeOwned(): [ReadonlySet<string>, (themeId: string, owned: boolean) => void] {
  const [ownedIds, setOwnedIds] = useState<ReadonlySet<string>>(() => {
    migrateThemeOwnedCatalogDefaults()
    return readThemeOwnedIds()
  })

  useEffect(() => {
    migrateThemeOwnedCatalogDefaults()
    const sync = () => setOwnedIds(readThemeOwnedIds())
    window.addEventListener(CHANGE_EVENT, sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_OWNED_STORAGE_KEY || e.key === null) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setThemeOwned = useCallback((themeId: string, owned: boolean) => {
    setOwnedIds((prev) => {
      const next = new Set(prev)
      if (owned) next.add(themeId)
      else next.delete(themeId)
      writeThemeOwnedIds(next)
      return next
    })
  }, [])

  return [ownedIds, setThemeOwned]
}

/** Mark many themes owned or not (current tab + search filter). */
export function setThemesOwnedBatch(
  themeIds: readonly string[],
  owned: boolean,
): void {
  const current = readThemeOwnedIds()
  const next = new Set(current)
  for (const id of themeIds) {
    if (owned) next.add(id)
    else next.delete(id)
  }
  writeThemeOwnedIds(next)
}
