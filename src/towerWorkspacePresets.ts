import type { LabPresetsFileV1, LabPreset } from './labPresetsStorage'
import { sanitizeWorkshopPersisted } from './labPresetsStorage'
import { applyTowerThemes } from './towerDataThemes'
import {
  defaultTowerWorkspace,
  sanitizeLabPersisted,
  sanitizeThemesPersisted,
  sanitizeTowerWorkspace,
  workspaceThemesSnapshot,
  type TowerWorkspaceV1,
} from './towerWorkspaceStorage'
import {
  defaultTowerBuild,
  flattenTowerBuild,
  sanitizeTowerBuild,
  splitTowerBuild,
} from './towerBuildStorage'

export function readWorkspaceFromPreset(preset: LabPreset | undefined): TowerWorkspaceV1 {
  if (preset?.workspace) return sanitizeTowerWorkspace(preset.workspace)
  const build = preset?.build
    ? sanitizeTowerBuild(preset.build)
    : preset?.workshop
      ? splitTowerBuild(sanitizeWorkshopPersisted(preset.workshop))
      : defaultTowerBuild()
  return {
    lab: sanitizeLabPersisted({ levelOverrides: preset?.levelOverrides ?? {} }),
    build,
    themes: defaultTowerWorkspace().themes,
  }
}

export function readTowerWorkspaceFromPresetsFile(parsed: LabPresetsFileV1): {
  workspace: TowerWorkspaceV1
  scratchWorkspace: TowerWorkspaceV1
} {
  const active = parsed.activePresetId
    ? parsed.presets.find((p) => p.id === parsed.activePresetId)
    : undefined

  const scratchWorkspace = parsed.scratchWorkspace
    ? sanitizeTowerWorkspace(parsed.scratchWorkspace)
    : {
        lab: sanitizeLabPersisted({ levelOverrides: parsed.scratchOverrides }),
        build: parsed.scratchBuild
          ? sanitizeTowerBuild(parsed.scratchBuild)
          : parsed.scratchWorkshop
            ? splitTowerBuild(sanitizeWorkshopPersisted(parsed.scratchWorkshop))
            : defaultTowerBuild(),
        themes: sanitizeThemesPersisted({
          selection: parsed.themeSelection,
          ownedIds: parsed.themeOwnedIds,
        }),
      }

  const workspace = active ? readWorkspaceFromPreset(active) : scratchWorkspace

  if (parsed.themeSelection !== undefined || parsed.themeOwnedIds !== undefined) {
    const themes = sanitizeThemesPersisted({
      selection: parsed.themeSelection,
      ownedIds: parsed.themeOwnedIds,
    })
    workspace.themes = themes
    if (!parsed.scratchWorkspace) scratchWorkspace.themes = themes
    applyTowerThemes(workspaceThemesSnapshot({ ...workspace, themes }))
  }

  return { workspace, scratchWorkspace }
}

export function buildLabPresetsPayloadWithWorkspace(
  activePresetId: string | null,
  presets: readonly LabPreset[],
  workspace: TowerWorkspaceV1,
  scratchWorkspace: TowerWorkspaceV1,
): LabPresetsFileV1 {
  const flatBuild = flattenTowerBuild(workspace.build)
  const flatScratch = flattenTowerBuild(scratchWorkspace.build)
  const themes = workspaceThemesSnapshot(workspace)

  const mergedPresets = activePresetId
    ? presets.map((p) =>
        p.id === activePresetId
          ? {
              ...p,
              levelOverrides: { ...workspace.lab.levelOverrides },
              workspace: { ...workspace },
              build: { ...workspace.build },
              workshop: { ...flatBuild },
            }
          : p,
      )
    : [...presets]

  return {
    v: 1,
    activePresetId,
    presets: mergedPresets,
    scratchOverrides: activePresetId
      ? { ...scratchWorkspace.lab.levelOverrides }
      : { ...workspace.lab.levelOverrides },
    scratchWorkspace:
      activePresetId != null ? { ...scratchWorkspace } : { ...workspace },
    scratchBuild:
      activePresetId != null ? { ...scratchWorkspace.build } : { ...workspace.build },
    scratchWorkshop: activePresetId != null ? { ...flatScratch } : { ...flatBuild },
    ...(themes.selection ? { themeSelection: { ...themes.selection } } : {}),
    themeOwnedIds: [...themes.ownedIds],
  }
}
