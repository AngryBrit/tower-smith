import {
  decodeLabsShareQueryValue,
  clearShareEncodedFromUrl,
  readShareEncodedFromUrlSearchParams,
} from '../labsShareCodec'
import { sanitizeLevelOverrides } from '../labLevelOverridesSanitize'
import {
  parseLabPresetsFile,
  sanitizeWorkshopPersisted,
} from '../labPresetsStorage'
import {
  applyTowerThemes,
  sanitizeThemeOwnedIds,
} from '../towerDataThemes'
import {
  defaultTowerWorkspace,
  mergeWorkspaceBuild,
  type TowerWorkspaceV1,
} from '../towerWorkspaceStorage'
import { splitTowerBuild } from '../towerBuildStorage'
import {
  readTowerWorkspaceFromPresetsFile,
  TOWER_LAB_PRESETS_STORAGE_KEY,
} from '../towerWorkspacePresets'
import type { ResearchData } from '../types/research'
import {
  clearGalleryBuildIdFromUrl,
  readGalleryBuildIdFromUrlSearchParams,
} from '../towerGallery/shareLink'
import { getGalleryTower } from '../towerGallery/api'
type WorkspaceHydrationFmt = {
  shareOpenedLevels: (
    count: number,
    workshopFromLink?: boolean,
    buildName?: string,
  ) => string
}

const LEVEL_OVERRIDES_STORAGE_KEY = 'tower-export-level-overrides-v1'

export type WorkspaceHydrationResult = {
  workspace: TowerWorkspaceV1
  scratchWorkspace: TowerWorkspaceV1
  importNotice: string | null
}

function loadPersistedLabState(data: ResearchData): {
  workspace: TowerWorkspaceV1
  scratchWorkspace: TowerWorkspaceV1
} {
  const empty = {
    workspace: defaultTowerWorkspace(),
    scratchWorkspace: defaultTowerWorkspace(),
  }
  try {
    const rawNew = localStorage.getItem(TOWER_LAB_PRESETS_STORAGE_KEY)
    if (rawNew) {
      const parsed = parseLabPresetsFile(JSON.parse(rawNew))
      if (parsed) {
        return readTowerWorkspaceFromPresetsFile(parsed)
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  try {
    const rawJson = localStorage.getItem(LEVEL_OVERRIDES_STORAGE_KEY)
    if (rawJson) {
      const parsed: unknown = JSON.parse(rawJson)
      if (parsed && typeof parsed === 'object' && 'levelOverrides' in parsed) {
        const lo = (parsed as { levelOverrides?: unknown }).levelOverrides
        if (lo && typeof lo === 'object' && !Array.isArray(lo)) {
          const levelOverrides = sanitizeLevelOverrides(
            data,
            lo as Record<string, unknown>,
          )
          return {
            workspace: {
              ...defaultTowerWorkspace(),
              lab: { levelOverrides },
            },
            scratchWorkspace: {
              ...defaultTowerWorkspace(),
              lab: { levelOverrides },
            },
          }
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return empty
}

function sanitizeWorkspaceLab(
  data: ResearchData,
  ws: TowerWorkspaceV1,
): TowerWorkspaceV1 {
  return {
    ...ws,
    lab: {
      levelOverrides: sanitizeLevelOverrides(
        data,
        ws.lab.levelOverrides as Record<string, unknown>,
      ),
    },
  }
}

export async function hydrateWorkspaceFromStorage(
  data: ResearchData,
  fmt: WorkspaceHydrationFmt,
): Promise<WorkspaceHydrationResult> {
  const persistedLabs = loadPersistedLabState(data)

  try {
    const params = new URLSearchParams(window.location.search)

    const galleryBuildId = readGalleryBuildIdFromUrlSearchParams(params)
    if (galleryBuildId) {
      const gallery = await getGalleryTower(galleryBuildId)
      const payload = gallery.ok ? gallery.record.payload : null
      if (payload?.o) {
        const sanitized = sanitizeLevelOverrides(data, payload.o as Record<string, unknown>)
        const workshopFromLink = payload.w !== undefined
        const sharedBuildName =
          typeof payload.n === 'string'
            ? payload.n.trim()
            : gallery.ok
              ? gallery.record.title
              : undefined
        let nextWorkspace = persistedLabs.workspace
        let nextScratchWorkspace = persistedLabs.scratchWorkspace
        if (workshopFromLink) {
          const build = splitTowerBuild(sanitizeWorkshopPersisted(payload.w))
          nextWorkspace = mergeWorkspaceBuild(nextWorkspace, build)
          nextScratchWorkspace = mergeWorkspaceBuild(nextScratchWorkspace, build)
        }
        if (payload.t) {
          applyTowerThemes({
            ownedIds: sanitizeThemeOwnedIds(payload.t.owned),
          })
        }
        const lab = { levelOverrides: sanitized }
        const url = new URL(window.location.href)
        clearGalleryBuildIdFromUrl(url)
        clearShareEncodedFromUrl(url)
        window.history.replaceState(null, '', url.pathname + url.search + url.hash)
        const n = Object.keys(sanitized).length
        return {
          workspace: { ...nextWorkspace, lab },
          scratchWorkspace: { ...nextScratchWorkspace, lab },
          importNotice: fmt.shareOpenedLevels(n, workshopFromLink, sharedBuildName),
        }
      }
    }

    const share = readShareEncodedFromUrlSearchParams(params)
    if (share) {
      const payload = await decodeLabsShareQueryValue(share)
      if (payload?.o) {
        const sanitized = sanitizeLevelOverrides(data, payload.o as Record<string, unknown>)
        const workshopFromLink = payload.w !== undefined
        const sharedBuildName =
          typeof payload.n === 'string' ? payload.n.trim() : undefined
        let nextWorkspace = persistedLabs.workspace
        let nextScratchWorkspace = persistedLabs.scratchWorkspace
        if (workshopFromLink) {
          const build = splitTowerBuild(sanitizeWorkshopPersisted(payload.w))
          nextWorkspace = mergeWorkspaceBuild(nextWorkspace, build)
          nextScratchWorkspace = mergeWorkspaceBuild(nextScratchWorkspace, build)
        }
        if (payload.t) {
          applyTowerThemes({
            ownedIds: sanitizeThemeOwnedIds(payload.t.owned),
          })
        }
        const lab = { levelOverrides: sanitized }
        const url = new URL(window.location.href)
        clearShareEncodedFromUrl(url)
        window.history.replaceState(null, '', url.pathname + url.search + url.hash)
        const n = Object.keys(sanitized).length
        return {
          workspace: { ...nextWorkspace, lab },
          scratchWorkspace: { ...nextScratchWorkspace, lab },
          importNotice: fmt.shareOpenedLevels(n, workshopFromLink, sharedBuildName),
        }
      }
    }
  } catch {
    /* ignore corrupt share payload */
  }

  return {
    workspace: sanitizeWorkspaceLab(data, persistedLabs.workspace),
    scratchWorkspace: sanitizeWorkspaceLab(data, persistedLabs.scratchWorkspace),
    importNotice: null,
  }
}
