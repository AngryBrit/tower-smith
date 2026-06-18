/**
 * Resolve a decoded `ModuleItem` to workshop chassis slot + module id.
 * Uses submodule effect slot when present — infoIndex alone can mislabel inventory fodder.
 */

import type { DecodedModuleItem } from './decodePlayerInfo'
import { gameModuleEffectByIndex } from './gameModuleEffectIndex'
import { gameWorkshopChassisModuleId } from './gameModuleIndex'
import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'

const MODULE_SLOTS: readonly WorkshopAssistModuleSlot[] = [
  'cannon',
  'armor',
  'generator',
  'core',
]

/** Chassis hub slot implied by non-zero submodule effect indices, when unambiguous. */
export function moduleItemEffectSlot(
  item: DecodedModuleItem,
): WorkshopAssistModuleSlot | null {
  let slot: WorkshopAssistModuleSlot | null = null
  for (const idx of item.effects) {
    if (idx === 0) continue
    const decoded = gameModuleEffectByIndex(idx, item.level)
    if (!decoded) continue
    if (slot != null && slot !== decoded.slot) return null
    slot = decoded.slot
  }
  return slot
}

export function resolveModuleItemToWorkshop(
  item: DecodedModuleItem,
  options?: { hubSlot?: WorkshopAssistModuleSlot },
): { slot: WorkshopAssistModuleSlot; moduleId: string } | null {
  const effectSlot = moduleItemEffectSlot(item)

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
