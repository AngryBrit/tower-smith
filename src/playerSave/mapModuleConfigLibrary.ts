/**
 * Build `simChassisModuleConfigs` from decoded player save module data.
 */

import {
  defaultWorkshopModuleConfigLibrary,
  type WorkshopModuleConfigEntry,
  type WorkshopModuleConfigLibrary,
} from '../data/workshopModuleConfigLibrary'
import { assistUniqueRarityFromGameLevel } from '../data/workshopAssistModuleCatalog'
import { workshopChassisModuleLevel } from '../data/workshopChassisModuleSelection'
import {
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from '../data/workshopChassisModuleShared'
import {
  clampWorkshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from '../data/workshopSimModules'
import { buildModuleCopyCountsFromPlayerSave } from '../data/workshopModuleCopyCounts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { DecodedModuleItem, DecodedPlayerSave } from './decodePlayerInfo'
import { gameSubmoduleImportFromEffectIndices } from './gameModuleEffectIndex'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'
import { gameModuleRarityToMergeTier } from './gameModuleRarity'
import { resolveModuleItemOwnership } from './resolveModuleItem'

const MODULE_SLOTS: readonly WorkshopAssistModuleSlot[] = [
  'cannon',
  'armor',
  'generator',
  'core',
]

function mergeTierRank(tier: WorkshopChassisModuleMergeTier): number {
  return WORKSHOP_CHASSIS_MODULE_MERGE_TIERS.indexOf(tier)
}

function preferModuleConfigEntry(
  existing: WorkshopModuleConfigEntry,
  incoming: WorkshopModuleConfigEntry,
): WorkshopModuleConfigEntry {
  if (incoming.level !== existing.level) {
    return incoming.level > existing.level ? incoming : existing
  }
  return mergeTierRank(incoming.rarity) > mergeTierRank(existing.rarity) ? incoming : existing
}

export function workshopSlotForModuleInfoIndex(
  infoIndex: number,
  item?: DecodedModuleItem,
): {
  slot: WorkshopAssistModuleSlot
  moduleId: string
} | null {
  if (item) return resolveModuleItemOwnership(item)
  for (const slot of MODULE_SLOTS) {
    const moduleId = gameWorkshopChassisModuleId(infoIndex, slot)
    if (moduleId) return { slot, moduleId }
  }
  return null
}

export function moduleConfigEntryFromDecodedItem(
  slot: WorkshopAssistModuleSlot,
  item: DecodedModuleItem,
  role: 'main' | 'assist',
  mainChassisLevelForAssist: number,
  uniqueEffectRarity?: WorkshopChassisModuleEffectTier,
): WorkshopModuleConfigEntry | null {
  const merge = gameModuleRarityToMergeTier(item.rarity)
  if (!merge) return null
  const imported = gameSubmoduleImportFromEffectIndices(
    slot,
    item.effects,
    item.level,
    role === 'assist' ? mainChassisLevelForAssist : 0,
    merge,
  )
  return {
    rarity: merge,
    level: clampWorkshopAssistModuleLevel(item.level),
    submodules: imported.map,
    submoduleSlots: imported.ordered,
    ...(uniqueEffectRarity != null ? { uniqueEffectRarity } : {}),
  }
}

function putLibraryEntry(
  library: WorkshopModuleConfigLibrary,
  slot: WorkshopAssistModuleSlot,
  role: 'main' | 'assist',
  moduleId: string,
  entry: WorkshopModuleConfigEntry,
  force = false,
): void {
  const bucket = library[slot][role]
  if (force) {
    bucket[moduleId] = entry
    return
  }
  const prev = bucket[moduleId]
  bucket[moduleId] = prev != null ? preferModuleConfigEntry(prev, entry) : entry
}

export function buildModuleConfigLibraryFromPlayerSave(
  save: DecodedPlayerSave,
  ws: WorkshopPersistedV1,
): WorkshopModuleConfigLibrary {
  const library = defaultWorkshopModuleConfigLibrary()

  for (const item of save.moduleInventory) {
    const resolved = resolveModuleItemOwnership(item)
    if (!resolved) continue
    const entry = moduleConfigEntryFromDecodedItem(resolved.slot, item, 'main', 0)
    if (entry) putLibraryEntry(library, resolved.slot, 'main', resolved.moduleId, entry)
  }

  for (let i = 0; i < MODULE_SLOTS.length; i++) {
    const slot = MODULE_SLOTS[i]!
    const item = save.moduleEquipped[i]
    if (!item) continue
    const moduleId = gameWorkshopChassisModuleId(item.infoIndex, slot)
    if (!moduleId) continue
    const entry = moduleConfigEntryFromDecodedItem(slot, item, 'main', 0)
    if (entry) putLibraryEntry(library, slot, 'main', moduleId, entry, true)
  }

  for (let i = 0; i < MODULE_SLOTS.length; i++) {
    const slot = MODULE_SLOTS[i]!
    const row = save.assistModuleSlots[i]
    const item = row?.equipped
    if (!item) continue
    const moduleId = gameWorkshopChassisModuleId(item.infoIndex, slot)
    if (!moduleId) continue
    const uniqueRarity =
      row.unlocked ? assistUniqueRarityFromGameLevel(row.uniqueEffectEfficiencyLevel) : undefined
    const entry = moduleConfigEntryFromDecodedItem(
      slot,
      item,
      'assist',
      workshopChassisModuleLevel(ws, slot),
      uniqueRarity,
    )
    if (entry) putLibraryEntry(library, slot, 'assist', moduleId, entry, true)
  }

  return library
}

export function applyModuleConfigLibraryFromPlayerSave(
  ws: WorkshopPersistedV1,
  save: DecodedPlayerSave,
): void {
  ws.simChassisModuleConfigs = buildModuleConfigLibraryFromPlayerSave(save, ws)
  ws.simChassisModuleCopyCounts = buildModuleCopyCountsFromPlayerSave(save)
}
