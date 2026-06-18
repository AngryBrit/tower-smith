/**
 * Cannon chassis modules (wiki): ability text and Epic → Ancestral values.
 */

import {
  formatWorkshopChassisModuleAbility,
  formatWorkshopChassisModuleValue,
  resolveChassisModuleEffectTier,
  type WorkshopChassisModuleDef,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'

export type {
  WorkshopChassisModuleEffectTier,
  WorkshopChassisModuleMergeTier,
  WorkshopChassisModuleMergeTier as WorkshopChassisModuleRarity,
  WorkshopChassisModuleValueKind,
} from './workshopChassisModuleShared'
export {
  WORKSHOP_CHASSIS_MODULE_EFFECT_TIERS,
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS as WORKSHOP_CHASSIS_MODULE_RARITIES,
} from './workshopChassisModuleShared'

export const WORKSHOP_CANNON_MODULE_ORDER = [
  'havocBringer',
  'deathPenalty',
  'beingAnnihilator',
  'astralDeliverance',
  'shrinkRay',
  'amplifyingStrike',
] as const

export type WorkshopCannonModuleId = (typeof WORKSHOP_CANNON_MODULE_ORDER)[number]

export type WorkshopCannonModuleDef = WorkshopChassisModuleDef

export const WORKSHOP_CANNON_MODULES: Record<WorkshopCannonModuleId, WorkshopCannonModuleDef> = {
  astralDeliverance: {
    name: 'Astral Deliverance',
    description:
      "Bounce shot's range is increased by 3% of the tower's total range. Each bounce increases the projectile's damage by [x]",
    kind: 'percent',
    values: { epic: 20, legendary: 40, mythic: 60, ancestral: 80 },
  },
  beingAnnihilator: {
    name: 'Being Annihilator',
    description:
      'When you super crit, your next [x] attacks are guaranteed super crits.',
    kind: 'count',
    values: { epic: 3, legendary: 4, mythic: 5, ancestral: 6 },
  },
  deathPenalty: {
    name: 'Death Penalty',
    description:
      'Chance of [x] to mark an enemy for death when it spawns, causing the first hit to destroy it.',
    kind: 'percent',
    values: { epic: 5, legendary: 8, mythic: 11, ancestral: 15 },
  },
  havocBringer: {
    name: 'Havoc Bringer',
    description: '[x] chance for rend armor to instantly go to max.',
    kind: 'percent',
    values: { epic: 10, legendary: 13, mythic: 15, ancestral: 20 },
  },
  shrinkRay: {
    name: 'Shrink Ray',
    description:
      "Attacks have a 1% chance to apply a non-stacking effect that decreases the enemy's mass by [x]",
    kind: 'percent',
    values: { epic: 10, legendary: 20, mythic: 30, ancestral: 40 },
  },
  amplifyingStrike: {
    name: 'Amplifying Strike',
    description: 'Killing a boss or elite enemy increases Tower Damage by 5x for [x]',
    kind: 'seconds',
    values: { epic: 5, legendary: 11, mythic: 18, ancestral: 26 },
  },
}

export const formatWorkshopCannonModuleValue = formatWorkshopChassisModuleValue

export function workshopCannonModuleValue(
  id: WorkshopCannonModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): number {
  return WORKSHOP_CANNON_MODULES[id].values[resolveChassisModuleEffectTier(tier)]
}

export function formatWorkshopCannonModuleAbility(
  id: WorkshopCannonModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string {
  return formatWorkshopChassisModuleAbility(WORKSHOP_CANNON_MODULES[id], tier)
}

export function workshopCannonModuleDef(id: WorkshopCannonModuleId): WorkshopCannonModuleDef {
  return WORKSHOP_CANNON_MODULES[id]
}
