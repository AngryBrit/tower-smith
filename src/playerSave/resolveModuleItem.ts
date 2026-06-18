/**
 * Resolve a decoded `ModuleItem` to workshop chassis slot + module id.
 *
 * **Copy counting** uses {@link resolveModuleItemToWorkshop} (strict).
 * **Inventory ownership** uses {@link resolveModuleItemOwnership} (strict, then loose).
 *
 * Strict rules:
 * - Unambiguous submodule slot → only that hub slot is considered.
 * - Mixed slots on one row (e.g. core + generator fodder) → rejected.
 * - No substats → fall back to infoIndex across hub slots.
 *
 * Loose ownership (when strict fails): leveled modules (Lv.2+) or ancestral+ merge tier
 * with at least one substat on the module's hub slot — covers real copies whose save row
 * mixes in a stray off-slot substat index.
 */

import type { DecodedModuleItem } from './decodePlayerInfo'
import {
  gameModuleEffectByIndex,
  gameModuleEffectForSubmoduleImport,
  type GameModuleEffectDecode,
} from './gameModuleEffectIndex'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'
import { gameModuleRarityToMergeTier } from './gameModuleRarity'
import {
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  workshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from '../data/workshopChassisModuleShared'
import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'

const MODULE_SLOTS: readonly WorkshopAssistModuleSlot[] = [
  'cannon',
  'armor',
  'generator',
  'core',
]

type ModuleItemEffectSlotResolution =
  | { kind: 'empty' }
  | { kind: 'slot'; slot: WorkshopAssistModuleSlot }
  | { kind: 'mixed' }

function mergeTierRank(tier: WorkshopChassisModuleMergeTier): number {
  return WORKSHOP_CHASSIS_MODULE_MERGE_TIERS.indexOf(tier)
}

function hubSlotsForInfoIndex(infoIndex: number): WorkshopAssistModuleSlot[] {
  return MODULE_SLOTS.filter(
    (slot) => gameWorkshopChassisModuleId(infoIndex, slot) != null,
  )
}

/** Bare table decode (no merge-tier remaps). */
function decodeBareModuleItemEffect(
  item: DecodedModuleItem,
  rawIndex: number,
): GameModuleEffectDecode | null {
  return gameModuleEffectByIndex(rawIndex, item.level)
}

/** Merge-tier-aware decode for a known hub slot (matches submodule import remaps). */
function decodeImportModuleItemEffect(
  item: DecodedModuleItem,
  rawIndex: number,
  submoduleSlotIndex: number,
  hubSlot: WorkshopAssistModuleSlot,
): GameModuleEffectDecode | null {
  const merge = gameModuleRarityToMergeTier(item.rarity)
  return gameModuleEffectForSubmoduleImport(
    rawIndex,
    hubSlot,
    item.level,
    0,
    merge,
    false,
    submoduleSlotIndex,
  )
}

function resolveBareEffectSlots(item: DecodedModuleItem): ModuleItemEffectSlotResolution {
  let slot: WorkshopAssistModuleSlot | null = null
  let seen = false
  for (let si = 0; si < item.effects.length; si++) {
    const idx = item.effects[si]!
    if (idx === 0) continue
    const decoded = decodeBareModuleItemEffect(item, idx)
    if (!decoded) continue
    seen = true
    if (slot != null && slot !== decoded.slot) return { kind: 'mixed' }
    slot = decoded.slot
  }
  if (!seen) return { kind: 'empty' }
  return { kind: 'slot', slot: slot! }
}

function resolveImportEffectSlots(
  item: DecodedModuleItem,
  hubSlot: WorkshopAssistModuleSlot,
): ModuleItemEffectSlotResolution {
  let slot: WorkshopAssistModuleSlot | null = null
  let seen = false
  for (let si = 0; si < item.effects.length; si++) {
    const idx = item.effects[si]!
    if (idx === 0) continue
    const decoded = decodeImportModuleItemEffect(item, idx, si, hubSlot)
    if (!decoded) continue
    seen = true
    if (slot != null && slot !== decoded.slot) return { kind: 'mixed' }
    slot = decoded.slot
  }
  if (!seen) return { kind: 'empty' }
  return { kind: 'slot', slot: slot! }
}

function isEpicTierCoreInventoryItem(item: DecodedModuleItem): boolean {
  const hubSlots = hubSlotsForInfoIndex(item.infoIndex)
  if (hubSlots.length !== 1 || hubSlots[0] !== 'core') return false
  const merge = gameModuleRarityToMergeTier(item.rarity)
  return merge != null && workshopChassisModuleEffectTier(merge) === 'epic'
}

function resolveModuleItemEffectSlots(
  item: DecodedModuleItem,
): ModuleItemEffectSlotResolution {
  const bare = resolveBareEffectSlots(item)
  if (bare.kind !== 'mixed' || !isEpicTierCoreInventoryItem(item)) {
    return bare
  }
  const hubSlot = hubSlotsForInfoIndex(item.infoIndex)[0]!
  const remapped = resolveImportEffectSlots(item, hubSlot)
  if (remapped.kind === 'slot' && remapped.slot === hubSlot) {
    return remapped
  }
  return bare
}

function moduleItemHasEffectOnSlot(
  item: DecodedModuleItem,
  slot: WorkshopAssistModuleSlot,
): boolean {
  if (gameWorkshopChassisModuleId(item.infoIndex, slot) == null) return false
  for (let si = 0; si < item.effects.length; si++) {
    const idx = item.effects[si]!
    if (idx === 0) continue
    const decoded =
      decodeImportModuleItemEffect(item, idx, si, slot) ??
      decodeBareModuleItemEffect(item, idx)
    if (decoded?.slot === slot) return true
  }
  return false
}

function qualifiesForLooseModuleOwnership(item: DecodedModuleItem): boolean {
  if (item.level > 1) return true
  const merge = gameModuleRarityToMergeTier(item.rarity)
  if (!merge) return false
  return mergeTierRank(merge) >= mergeTierRank('ancestral')
}

/** Chassis hub slot implied by non-zero submodule effect indices, when unambiguous. */
export function moduleItemEffectSlot(
  item: DecodedModuleItem,
): WorkshopAssistModuleSlot | null {
  const resolved = resolveModuleItemEffectSlots(item)
  return resolved.kind === 'slot' ? resolved.slot : null
}

/** Strict resolution for physical copy counts. */
export function resolveModuleItemToWorkshop(
  item: DecodedModuleItem,
  options?: { hubSlot?: WorkshopAssistModuleSlot },
): { slot: WorkshopAssistModuleSlot; moduleId: string } | null {
  const effects = resolveModuleItemEffectSlots(item)
  if (effects.kind === 'mixed') return null

  const effectSlot = effects.kind === 'slot' ? effects.slot : null

  if (options?.hubSlot != null) {
    const moduleId = gameWorkshopChassisModuleId(item.infoIndex, options.hubSlot)
    if (moduleId == null) return null
    if (effectSlot != null && effectSlot !== options.hubSlot) return null
    return { slot: options.hubSlot, moduleId }
  }

  const slotsToTry: WorkshopAssistModuleSlot[] =
    effectSlot != null ? [effectSlot] : [...MODULE_SLOTS]

  for (const slot of slotsToTry) {
    const moduleId = gameWorkshopChassisModuleId(item.infoIndex, slot)
    if (moduleId != null) return { slot, moduleId }
  }
  return null
}

function resolveModuleItemOwnershipLoose(
  item: DecodedModuleItem,
  options?: { hubSlot?: WorkshopAssistModuleSlot },
): { slot: WorkshopAssistModuleSlot; moduleId: string } | null {
  if (options?.hubSlot != null) {
    const moduleId = gameWorkshopChassisModuleId(item.infoIndex, options.hubSlot)
    if (moduleId != null) return { slot: options.hubSlot, moduleId }
    return null
  }

  if (!qualifiesForLooseModuleOwnership(item)) return null

  for (const slot of MODULE_SLOTS) {
    const moduleId = gameWorkshopChassisModuleId(item.infoIndex, slot)
    if (moduleId == null) continue
    if (moduleItemHasEffectOnSlot(item, slot)) {
      return { slot, moduleId }
    }
  }

  if (item.level > 1 && !item.effects.some((effect) => effect !== 0)) {
    for (const slot of MODULE_SLOTS) {
      const moduleId = gameWorkshopChassisModuleId(item.infoIndex, slot)
      if (moduleId != null) return { slot, moduleId }
    }
  }

  return null
}

/** Strict resolution plus loose fallback for inventory ownership. */
export function resolveModuleItemOwnership(
  item: DecodedModuleItem,
  options?: { hubSlot?: WorkshopAssistModuleSlot },
): { slot: WorkshopAssistModuleSlot; moduleId: string } | null {
  return (
    resolveModuleItemToWorkshop(item, options) ??
    resolveModuleItemOwnershipLoose(item, options)
  )
}
