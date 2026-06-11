import {
  ASSIST_CHASSIS_MODULE_ID_KEY,
  ASSIST_CHASSIS_MODULE_RARITY_KEY,
} from '../data/workshopAssistChassisModule'
import {
  CHASSIS_MODULE_ID_KEY,
  CHASSIS_MODULE_LEVEL_KEY,
  CHASSIS_MODULE_RARITY_KEY,
  sanitizeChassisModuleId,
  sanitizeChassisModuleMergeTier,
} from '../data/workshopChassisModuleSelection'
import {
  WORKSHOP_SUBMODULE_SECTIONS,
  submoduleEffectId,
} from '../data/workshopSubmoduleCatalog'
import {
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
}

export type ModulesEpSectionLevels = {
  /** Hub “Highest Primary Level” (main chassis module level cap). */
  highestPrimaryLevel: number
  /** Hub “Highest Assist Level” (assist module level cap). */
  highestAssistLevel: number
}

export type ModulesEpSyncState = {
  /** Equipped modules (main + assist per hub slot) from the active workshop tab. */
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
  }
}

function sectionLevelsFromPersisted(
  ws: WorkshopPersistedV1,
  modules: ModulesEpEquippedModule[],
): Record<WorkshopAssistModuleSlot, ModulesEpSectionLevels> {
  const levels = modulesEpDefaultSectionLevels()
  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const hubAssistLevel = clampWorkshopAssistModuleLevel(ws[ASSIST_MODULE_LEVEL_KEY[slot]] ?? 0)
    const equippedAssist = modules.find((m) => m.hubSlot === slot && m.role === 'assist')
    levels[slot] = {
      highestPrimaryLevel: clampWorkshopAssistModuleLevel(ws[CHASSIS_MODULE_LEVEL_KEY[slot]] ?? 0),
      highestAssistLevel: equippedAssist
        ? Math.max(hubAssistLevel, equippedAssist.level)
        : hubAssistLevel,
    }
  }
  return levels
}

/** Equipped chassis modules (main + assist) from the active workshop tab only. */
export function modulesEpStateFromPersisted(ws: WorkshopPersistedV1): ModulesEpSyncState {
  const modules: ModulesEpEquippedModule[] = []
  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const main = equippedMainFromSource(ws, slot)
    if (main) modules.push(main)
    const assist = equippedAssistFromSource(ws, slot)
    if (assist) modules.push(assist)
  }
  return { modules, sectionLevels: sectionLevelsFromPersisted(ws, modules) }
}
