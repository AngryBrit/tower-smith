/**
 * Equipped chassis module (Cannon / Armor / …) selection for workshop modules UI.
 */

import {
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  sanitizeChassisModuleMergeTier,
  type WorkshopChassisModuleDef,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'

/** @deprecated Use WorkshopChassisModuleMergeTier */
export type WorkshopChassisModuleRarity = WorkshopChassisModuleMergeTier
import {
  WORKSHOP_ARMOR_MODULE_ORDER,
  workshopArmorModuleDef,
  type WorkshopArmorModuleId,
} from './workshopArmorModules'
import {
  WORKSHOP_CANNON_MODULE_ORDER,
  workshopCannonModuleDef,
  type WorkshopCannonModuleId,
} from './workshopCannonModules'
import {
  WORKSHOP_CORE_MODULE_ORDER,
  workshopCoreModuleDef,
  type WorkshopCoreModuleId,
} from './workshopCoreModules'
import {
  WORKSHOP_GENERATOR_MODULE_ORDER,
  workshopGeneratorModuleDef,
  type WorkshopGeneratorModuleId,
} from './workshopGeneratorModules'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'

export type WorkshopChassisModuleSelection = {
  moduleId: string | null
  rarity: WorkshopChassisModuleMergeTier
}

export const CHASSIS_MODULE_ID_KEY = {
  cannon: 'simCannonChassisModuleId',
  armor: 'simArmorChassisModuleId',
  generator: 'simGeneratorChassisModuleId',
  core: 'simCoreChassisModuleId',
} as const

export const CHASSIS_MODULE_RARITY_KEY = {
  cannon: 'simCannonChassisModuleRarity',
  armor: 'simArmorChassisModuleRarity',
  generator: 'simGeneratorChassisModuleRarity',
  core: 'simCoreChassisModuleRarity',
} as const

export type WorkshopChassisModulePersisted = {
  [K in (typeof CHASSIS_MODULE_ID_KEY)[WorkshopAssistModuleSlot]]: string
} & {
  [K in (typeof CHASSIS_MODULE_RARITY_KEY)[WorkshopAssistModuleSlot]]: string
}

export const CHASSIS_MODULE_ORDERS: Record<WorkshopAssistModuleSlot, readonly string[]> = {
  cannon: WORKSHOP_CANNON_MODULE_ORDER,
  armor: WORKSHOP_ARMOR_MODULE_ORDER,
  generator: WORKSHOP_GENERATOR_MODULE_ORDER,
  core: WORKSHOP_CORE_MODULE_ORDER,
}

export { sanitizeChassisModuleMergeTier, sanitizeChassisModuleMergeTier as sanitizeChassisModuleRarity }

export function sanitizeChassisModuleId(
  slot: WorkshopAssistModuleSlot,
  raw: unknown,
): string | null {
  if (raw == null || raw === '') return null
  const id = String(raw)
  return CHASSIS_MODULE_ORDERS[slot].includes(id) ? id : null
}

export function workshopChassisModuleSelection(
  ws: WorkshopChassisModulePersisted,
  slot: WorkshopAssistModuleSlot,
): WorkshopChassisModuleSelection {
  const idKey = CHASSIS_MODULE_ID_KEY[slot]
  const rKey = CHASSIS_MODULE_RARITY_KEY[slot]
  return {
    moduleId: sanitizeChassisModuleId(slot, ws[idKey]),
    rarity: sanitizeChassisModuleMergeTier(ws[rKey]),
  }
}

export function workshopChassisModuleDefForSlot(
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): WorkshopChassisModuleDef {
  switch (slot) {
    case 'cannon':
      return workshopCannonModuleDef(moduleId as WorkshopCannonModuleId)
    case 'armor':
      return workshopArmorModuleDef(moduleId as WorkshopArmorModuleId)
    case 'generator':
      return workshopGeneratorModuleDef(moduleId as WorkshopGeneratorModuleId)
    case 'core':
      return workshopCoreModuleDef(moduleId as WorkshopCoreModuleId)
    default:
      return workshopCannonModuleDef(moduleId as WorkshopCannonModuleId)
  }
}

export { WORKSHOP_CHASSIS_MODULE_MERGE_TIERS, WORKSHOP_CHASSIS_MODULE_MERGE_TIERS as WORKSHOP_CHASSIS_MODULE_RARITIES }
