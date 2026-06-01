/**
 * In-game-style primary stat line for module picker hero (e.g. x2.270 Tower Health).
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import {
  clampWorkshopChassisModuleLevel,
  type WorkshopChassisModuleDef,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'
import {
  formatWorkshopChassisModuleHeroStatMilli,
  workshopChassisModuleHeroStatMilli,
  type WorkshopChassisModuleHeroStatSlot,
} from './workshopChassisModuleHeroStatAnchors'

type WorkshopChassisModuleRarity =
  | WorkshopChassisModuleEffectTier
  | WorkshopChassisModuleMergeTier
import { WORKSHOP_MODULE_LEVEL_MAX } from './workshopSubmoduleCatalog'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'

export type WorkshopChassisModuleHeroStatContext = {
  moduleLevel: number
}

/** @deprecated Health card/lab are not stacked on the module-picker hero line. */
export function buildTowerHealthHeroStatContext(
  _ws: WorkshopPersistedV1,
  _research: ResearchData | null,
  _labOverrides: Record<string, number>,
  moduleLevel: number,
): WorkshopChassisModuleHeroStatContext {
  return { moduleLevel }
}

export function buildTowerDamageHeroStatContext(
  _ws: WorkshopPersistedV1,
  _research: ResearchData | null,
  _labOverrides: Record<string, number>,
  moduleLevel: number,
): WorkshopChassisModuleHeroStatContext {
  return { moduleLevel }
}

function clampModuleLevel(moduleLevel: number): number {
  return Math.max(0, Math.min(WORKSHOP_MODULE_LEVEL_MAX, moduleLevel))
}

function normalizeHeroStatMergeTier(
  rarity: WorkshopChassisModuleRarity,
): WorkshopChassisModuleMergeTier {
  if (rarity === 'rare' || rarity === 'rare_plus') return rarity
  if (
    rarity === 'epic' ||
    rarity === 'legendary' ||
    rarity === 'mythic' ||
    rarity === 'ancestral'
  ) {
    return rarity
  }
  return rarity as WorkshopChassisModuleMergeTier
}

function effectiveModuleLevelForHeroStat(
  moduleLevel: number,
  merge: WorkshopChassisModuleMergeTier,
): number {
  return clampWorkshopChassisModuleLevel(clampModuleLevel(moduleLevel), merge)
}

function formatSlotHeroStat(
  slot: WorkshopChassisModuleHeroStatSlot,
  merge: WorkshopChassisModuleMergeTier,
  moduleLevel: number,
  label: string,
): string {
  const milli = workshopChassisModuleHeroStatMilli(
    slot,
    merge,
    effectiveModuleLevelForHeroStat(moduleLevel, merge),
  )
  return `x${formatWorkshopChassisModuleHeroStatMilli(milli)} ${label}`
}

export function formatWorkshopChassisModuleHeroStat(
  slot: WorkshopAssistModuleSlot,
  _def: WorkshopChassisModuleDef,
  rarity: WorkshopChassisModuleRarity,
  context?: WorkshopChassisModuleHeroStatContext,
): string {
  const moduleLevel = context?.moduleLevel ?? 0
  const merge = normalizeHeroStatMergeTier(rarity)

  if (slot === 'cannon') {
    return formatSlotHeroStat('cannon', merge, moduleLevel, 'Tower Damage')
  }

  if (slot === 'armor') {
    return formatSlotHeroStat('armor', merge, moduleLevel, 'Tower Health')
  }

  if (slot === 'generator') {
    return formatSlotHeroStat('generator', merge, moduleLevel, 'Coin Bonus')
  }

  if (slot === 'core') {
    return formatSlotHeroStat('core', merge, moduleLevel, 'Ultimate Weapon Damage')
  }

  const _exhaustive: never = slot
  return _exhaustive
}
