import { DEFAULT_THEME_SELECTION } from './data/gameThemes'
import { readTowerThemesSnapshot, type TowerThemesSnapshot } from './towerDataThemes'
import {
  clearTowerBuild,
  defaultTowerBuild,
  mergeTowerBuildDomain,
  sanitizeTowerBuild,
  type TowerBuildPersistedV1,
} from './towerBuildStorage'
import type { ThemeSelectionState } from './themeSelectionStorage'

export type LabPersistedV1 = {
  levelOverrides: Record<string, number>
}

export type ThemesPersistedV1 = {
  selection?: ThemeSelectionState
  ownedIds: string[]
}

/** Full in-browser tower workspace: lab, build domains, and themes. */
export type TowerWorkspaceV1 = {
  lab: LabPersistedV1
  build: TowerBuildPersistedV1
  themes: ThemesPersistedV1
}

export function defaultLabPersisted(): LabPersistedV1 {
  return { levelOverrides: {} }
}

export function defaultThemesPersisted(): ThemesPersistedV1 {
  return {
    selection: { ...DEFAULT_THEME_SELECTION },
    ownedIds: [],
  }
}

export function defaultTowerWorkspace(): TowerWorkspaceV1 {
  return {
    lab: defaultLabPersisted(),
    build: defaultTowerBuild(),
    themes: defaultThemesPersisted(),
  }
}

export function themesPersistedFromSnapshot(snapshot?: TowerThemesSnapshot): ThemesPersistedV1 {
  if (!snapshot) return defaultThemesPersisted()
  return {
    ...(snapshot.selection !== undefined ? { selection: { ...snapshot.selection } } : {}),
    ownedIds: [...snapshot.ownedIds],
  }
}

export function sanitizeThemesPersisted(raw: unknown): ThemesPersistedV1 {
  const d = defaultThemesPersisted()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d
  const o = raw as Record<string, unknown>
  const ownedIds = Array.isArray(o.ownedIds)
    ? [
        ...new Set(
          o.ownedIds.filter((x): x is string => typeof x === 'string' && x.trim().length > 0),
        ),
      ]
        .map((s) => s.trim())
        .sort()
    : d.ownedIds
  const selection =
    o.selection && typeof o.selection === 'object' && !Array.isArray(o.selection)
      ? { ...d.selection, ...(o.selection as ThemeSelectionState) }
      : d.selection
  return { selection, ownedIds }
}

export function sanitizeLabPersisted(raw: unknown): LabPersistedV1 {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaultLabPersisted()
  const o = raw as Record<string, unknown>
  const lo = o.levelOverrides
  if (!lo || typeof lo !== 'object' || Array.isArray(lo)) return defaultLabPersisted()
  const levelOverrides: Record<string, number> = {}
  for (const [key, val] of Object.entries(lo)) {
    const n = Number(val)
    if (Number.isFinite(n)) levelOverrides[key] = Math.trunc(n)
  }
  return { levelOverrides }
}

export function isNestedTowerWorkspace(raw: unknown): raw is TowerWorkspaceV1 {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const o = raw as Record<string, unknown>
  return (
    typeof o.lab === 'object' &&
    o.lab != null &&
    typeof o.build === 'object' &&
    o.build != null &&
    typeof o.themes === 'object' &&
    o.themes != null
  )
}

export function sanitizeTowerWorkspace(raw: unknown): TowerWorkspaceV1 {
  if (isNestedTowerWorkspace(raw)) {
    return {
      lab: sanitizeLabPersisted(raw.lab),
      build: sanitizeTowerBuild(raw.build),
      themes: sanitizeThemesPersisted(raw.themes),
    }
  }
  return defaultTowerWorkspace()
}

export function mergeWorkspaceLab(
  workspace: TowerWorkspaceV1,
  lab: LabPersistedV1,
): TowerWorkspaceV1 {
  return { ...workspace, lab: sanitizeLabPersisted(lab) }
}

export function mergeWorkspaceBuild(
  workspace: TowerWorkspaceV1,
  build: TowerBuildPersistedV1,
): TowerWorkspaceV1 {
  return { ...workspace, build: sanitizeTowerBuild(build) }
}

export function mergeWorkspaceBuildDomain<K extends keyof TowerBuildPersistedV1>(
  workspace: TowerWorkspaceV1,
  domain: K,
  next: TowerBuildPersistedV1[K],
): TowerWorkspaceV1 {
  return mergeWorkspaceBuild(workspace, mergeTowerBuildDomain(workspace.build, domain, next))
}

export function mergeWorkspaceThemes(
  workspace: TowerWorkspaceV1,
  themes: ThemesPersistedV1,
): TowerWorkspaceV1 {
  return { ...workspace, themes: sanitizeThemesPersisted(themes) }
}

/** Reset lab levels, all build domains, and owned themes in the workspace snapshot. */
export function clearTowerWorkspace(workspace: TowerWorkspaceV1): TowerWorkspaceV1 {
  return {
    lab: defaultLabPersisted(),
    build: clearTowerBuild(workspace.build),
    themes: defaultThemesPersisted(),
  }
}

export function workspaceThemesSnapshot(workspace: TowerWorkspaceV1): TowerThemesSnapshot {
  return {
    ...(workspace.themes.selection !== undefined
      ? { selection: { ...workspace.themes.selection } }
      : {}),
    ownedIds: [...workspace.themes.ownedIds],
  }
}

export function syncWorkspaceThemesFromStorage(workspace: TowerWorkspaceV1): TowerWorkspaceV1 {
  return mergeWorkspaceThemes(workspace, themesPersistedFromSnapshot(readTowerThemesSnapshot()))
}
