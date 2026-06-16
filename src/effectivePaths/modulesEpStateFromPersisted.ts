import {
  CHASSIS_MODULE_ORDERS,
  CHASSIS_MODULE_ID_KEY,
  CHASSIS_MODULE_LEVEL_KEY,
  CHASSIS_MODULE_RARITY_KEY,
  sanitizeChassisModuleId,
  sanitizeChassisModuleMergeTier,
} from '../data/workshopChassisModuleSelection'
import {
  ASSIST_CHASSIS_MODULE_ID_KEY,
  ASSIST_CHASSIS_MODULE_RARITY_KEY,
  workshopAssistChassisModuleSelection,
} from '../data/workshopAssistChassisModule'
import {
  WORKSHOP_SUBMODULE_SECTIONS,
  submoduleEffectId,
} from '../data/workshopSubmoduleCatalog'
import {
  orderedSlotsFromSelectionMap,
  workshopSubmoduleOrderedSlots,
  workshopSubmoduleSelections,
  type WorkshopSubmoduleModuleRole,
  type WorkshopSubmoduleSelections,
} from '../data/workshopSubmoduleSelection'
import type { WorkshopSubmoduleRarity } from '../data/workshopSubmoduleEffects'
import {
  ASSIST_MODULE_LEVEL_KEY,
  WORKSHOP_ASSIST_MODULE_SLOTS,
  clampWorkshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from '../data/workshopSimModules'
import type { WorkshopChassisModuleMergeTier } from '../data/workshopChassisModuleShared'
import {
  workshopModuleConfigEntry,
  workshopModuleIsOwned,
  type WorkshopModuleConfigEntry,
} from '../data/workshopModuleConfigLibrary'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

export type ModulesEpEquippedSubstat = {
  effectId: string
  catalogLabel: string
  rarity: WorkshopSubmoduleRarity
}

export type ModulesEpEquippedModuleRole = 'main' | 'assist'

export type ModulesEpEquippedModule = {
  moduleId: string
  hubSlot: WorkshopAssistModuleSlot
  role: ModulesEpEquippedModuleRole
  mergeTier: WorkshopChassisModuleMergeTier
  level: number
  substats: ModulesEpEquippedSubstat[]
  /** When true, this module is equipped on the hub (main or assist slot). */
  hubEquipped: boolean
}

export type ModulesEpSectionLevels = {
  /** Hub “Highest Primary Level” (main chassis module level cap). */
  highestPrimaryLevel: number
  /** Hub “Highest Assist Level” (assist module level cap). */
  highestAssistLevel: number
}

export type ModulesEpSyncState = {
  /** Owned inventory modules (equipped + library) for Effective Paths Inventory columns. */
  modules: ModulesEpEquippedModule[]
  /** Per-hub sidebar level caps written to Inventory “Highest Level” / “Assist Level”. */
  sectionLevels: Record<WorkshopAssistModuleSlot, ModulesEpSectionLevels>
}

export function modulesEpDefaultSectionLevels(): Record<
  WorkshopAssistModuleSlot,
  ModulesEpSectionLevels
> {
  return {
    cannon: { highestPrimaryLevel: 0, highestAssistLevel: 0 },
    armor: { highestPrimaryLevel: 0, highestAssistLevel: 0 },
    generator: { highestPrimaryLevel: 0, highestAssistLevel: 0 },
    core: { highestPrimaryLevel: 0, highestAssistLevel: 0 },
  }
}

function submoduleCatalogLabel(slot: WorkshopAssistModuleSlot, effectId: string): string | null {
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  for (const row of section.rows) {
    if (submoduleEffectId(row.label) === effectId) return row.label
  }
  return null
}

function collectSubstatsFromConfigEntry(
  slot: WorkshopAssistModuleSlot,
  entry: WorkshopModuleConfigEntry,
): ModulesEpEquippedSubstat[] {
  const ordered = entry.submoduleSlots ?? orderedSlotsFromSelectionMap(entry.submodules)
  const out: ModulesEpEquippedSubstat[] = []
  for (const pick of ordered) {
    if (pick == null) continue
    const { effectId } = pick
    const rarity = entry.submodules[effectId] ?? pick.rarity
    if (!rarity) continue
    const catalogLabel = submoduleCatalogLabel(slot, effectId)
    if (!catalogLabel) continue
    out.push({ effectId, catalogLabel, rarity })
  }
  return out
}

function collectSubstats(
  selections: WorkshopSubmoduleSelections,
  slot: WorkshopAssistModuleSlot,
  role: WorkshopSubmoduleModuleRole,
): ModulesEpEquippedSubstat[] {
  const source = { simSubmoduleSelections: selections }
  const map = workshopSubmoduleSelections(source, slot, role)
  const ordered = workshopSubmoduleOrderedSlots(source, slot, role)
  const out: ModulesEpEquippedSubstat[] = []
  for (const pick of ordered) {
    if (pick == null) continue
    const { effectId } = pick
    const rarity = map[effectId] ?? pick.rarity
    if (!rarity) continue
    const catalogLabel = submoduleCatalogLabel(slot, effectId)
    if (!catalogLabel) continue
    out.push({ effectId, catalogLabel, rarity })
  }
  return out
}

function equippedMainFromSource(
  source: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
): ModulesEpEquippedModule | null {
  const moduleId = sanitizeChassisModuleId(slot, source[CHASSIS_MODULE_ID_KEY[slot]])
  if (!moduleId) return null
  return {
    moduleId,
    hubSlot: slot,
    role: 'main',
    mergeTier: sanitizeChassisModuleMergeTier(source[CHASSIS_MODULE_RARITY_KEY[slot]]),
    level: Math.max(0, Math.trunc(source[CHASSIS_MODULE_LEVEL_KEY[slot]] ?? 0)),
    substats: collectSubstats(source.simSubmoduleSelections, slot, 'main'),
    hubEquipped: true,
  }
}

function equippedAssistFromSource(
  source: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
): ModulesEpEquippedModule | null {
  const moduleId = sanitizeChassisModuleId(slot, source[ASSIST_CHASSIS_MODULE_ID_KEY[slot]])
  if (!moduleId) return null
  return {
    moduleId,
    hubSlot: slot,
    role: 'assist',
    mergeTier: sanitizeChassisModuleMergeTier(source[ASSIST_CHASSIS_MODULE_RARITY_KEY[slot]]),
    level: Math.max(0, Math.trunc(source[ASSIST_MODULE_LEVEL_KEY[slot]] ?? 0)),
    substats: collectSubstats(source.simSubmoduleSelections, slot, 'assist'),
    hubEquipped: true,
  }
}

function moduleHasStoredConfig(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): boolean {
  const lib = ws.simChassisModuleConfigs?.[slot]
  return lib?.main[moduleId] != null || lib?.assist[moduleId] != null
}

function preferredInventoryModuleRole(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): ModulesEpEquippedModuleRole {
  if (workshopAssistChassisModuleSelection(ws, slot).moduleId === moduleId) return 'assist'
  const lib = ws.simChassisModuleConfigs?.[slot]
  if (lib?.assist[moduleId] != null && lib?.main[moduleId] == null) return 'assist'
  return 'main'
}

function inventoryModuleFromLibraryEntry(
  slot: WorkshopAssistModuleSlot,
  role: ModulesEpEquippedModuleRole,
  moduleId: string,
  entry: WorkshopModuleConfigEntry,
): ModulesEpEquippedModule {
  return {
    moduleId,
    hubSlot: slot,
    role,
    mergeTier: entry.rarity,
    level: entry.level,
    substats: collectSubstatsFromConfigEntry(slot, entry),
    hubEquipped: false,
  }
}

function sectionLevelsFromPersisted(
  ws: WorkshopPersistedV1,
  modules: ModulesEpEquippedModule[],
): Record<WorkshopAssistModuleSlot, ModulesEpSectionLevels> {
  const levels = modulesEpDefaultSectionLevels()
  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const hubAssistLevel = clampWorkshopAssistModuleLevel(ws[ASSIST_MODULE_LEVEL_KEY[slot]] ?? 0)
    const equippedAssist = modules.find(
      (m) => m.hubSlot === slot && m.hubEquipped && m.role === 'assist',
    )
    levels[slot] = {
      highestPrimaryLevel: clampWorkshopAssistModuleLevel(ws[CHASSIS_MODULE_LEVEL_KEY[slot]] ?? 0),
      highestAssistLevel: equippedAssist
        ? Math.max(hubAssistLevel, equippedAssist.level)
        : hubAssistLevel,
    }
  }
  return levels
}

/** Owned chassis modules (equipped + config library) from the active workshop tab. */
export function modulesEpStateFromPersisted(ws: WorkshopPersistedV1): ModulesEpSyncState {
  const modules: ModulesEpEquippedModule[] = []
  const seen = new Set<string>()

  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const main = equippedMainFromSource(ws, slot)
    if (main) {
      modules.push(main)
      seen.add(`${slot}:${main.moduleId}`)
    }
    const assist = equippedAssistFromSource(ws, slot)
    if (assist) {
      modules.push(assist)
      seen.add(`${slot}:${assist.moduleId}`)
    }
  }

  const library = ws.simChassisModuleConfigs
  if (library) {
    for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
      for (const role of ['main', 'assist'] as const) {
        for (const [moduleId, entry] of Object.entries(library[slot][role])) {
          const key = `${slot}:${moduleId}`
          if (seen.has(key)) continue
          modules.push(inventoryModuleFromLibraryEntry(slot, role, moduleId, entry))
          seen.add(key)
        }
      }
    }
  }

  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    for (const moduleId of CHASSIS_MODULE_ORDERS[slot]) {
      const key = `${slot}:${moduleId}`
      if (seen.has(key)) continue
      if (!workshopModuleIsOwned(ws, slot, moduleId)) continue
      if (!moduleHasStoredConfig(ws, slot, moduleId)) continue
      const role = preferredInventoryModuleRole(ws, slot, moduleId)
      const entry = workshopModuleConfigEntry(ws, slot, role, moduleId)
      modules.push(inventoryModuleFromLibraryEntry(slot, role, moduleId, entry))
      seen.add(key)
    }
  }

  return { modules, sectionLevels: sectionLevelsFromPersisted(ws, modules) }
}
