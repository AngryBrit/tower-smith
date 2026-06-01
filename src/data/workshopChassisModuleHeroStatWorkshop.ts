/**
 * Chassis module main-effect multipliers for workshop stat displays (DVT hero stats).
 */

import { clampWorkshopChassisModuleLevel } from './workshopChassisModuleShared'
import {
  workshopChassisModuleHeroStatMilli,
  type WorkshopChassisModuleHeroStatSlot,
} from './workshopChassisModuleHeroStatAnchors'
import {
  workshopChassisModuleSelection,
  type WorkshopChassisModulePersisted,
} from './workshopChassisModuleSelection'
import {
  ASSIST_MODULE_LEVEL_KEY,
  workshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from './workshopSimModules'

export type WorkshopChassisModuleLevelPersisted = {
  [K in (typeof ASSIST_MODULE_LEVEL_KEY)[WorkshopAssistModuleSlot]]: number
}

const HERO_STAT_SLOT: Record<WorkshopAssistModuleSlot, WorkshopChassisModuleHeroStatSlot> = {
  cannon: 'cannon',
  armor: 'armor',
  generator: 'generator',
  core: 'core',
}

/** ×1 when no chassis module is equipped. */
export function workshopChassisModuleHeroStatMultiplier(
  ws: WorkshopChassisModulePersisted & WorkshopChassisModuleLevelPersisted,
  slot: WorkshopAssistModuleSlot,
): number {
  const { moduleId, rarity } = workshopChassisModuleSelection(ws, slot)
  if (moduleId == null) return 1
  const level = workshopAssistModuleLevel(ws, slot)
  const clamped = clampWorkshopChassisModuleLevel(level, rarity)
  return workshopChassisModuleHeroStatMilli(HERO_STAT_SLOT[slot], rarity, clamped) / 1000
}
