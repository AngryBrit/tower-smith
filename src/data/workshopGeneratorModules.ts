/**
 * Generator chassis modules (wiki): ability text and Epic → Ancestral values.
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
} from './workshopChassisModuleShared'

export const WORKSHOP_GENERATOR_MODULE_ORDER = [
  'singularityHarness',
  'galaxyCompressor',
  'pulsarHarvester',
  'blackHoleDigestor',
  'projectFunding',
  'restorativeBonus',
] as const

export type WorkshopGeneratorModuleId = (typeof WORKSHOP_GENERATOR_MODULE_ORDER)[number]

export type WorkshopGeneratorModuleDef = WorkshopChassisModuleDef

export const WORKSHOP_GENERATOR_MODULES: Record<
  WorkshopGeneratorModuleId,
  WorkshopGeneratorModuleDef
> = {
  singularityHarness: {
    name: 'Singularity Harness',
    description:
      'Increase the range of each bot by [x]. Enemies hit by the Flame Bot receive double damage.',
    kind: 'addMeters',
    values: { epic: 5, legendary: 8, mythic: 11, ancestral: 15 },
  },
  galaxyCompressor: {
    name: 'Galaxy Compressor',
    description:
      'Collecting a recovery package reduced the cooldown of all Ultimate Weapons except Poison Swamp by [x].',
    kind: 'seconds',
    values: { epic: 10, legendary: 13, mythic: 17, ancestral: 20 },
  },
  pulsarHarvester: {
    name: 'Pulsar Harvester',
    description:
      "Each time a projectile hits an enemy, there is a [x] chance that it will reduce the enemy's Health and Attack level by 1 (diminishing returns after 100 reductions)",
    kind: 'percent',
    values: { epic: 1.0, legendary: 1.5, mythic: 2.0, ancestral: 2.5 },
  },
  blackHoleDigestor: {
    name: 'Black Hole Digestor',
    description:
      'Temporarily get [x] extra Coins/ Kill Bonus for each free upgrade you got on the current wave. Free Upgrades can not increase Tower Range.',
    kind: 'percent',
    values: { epic: 3, legendary: 5, mythic: 7, ancestral: 10 },
  },
  projectFunding: {
    name: 'Project Funding',
    description:
      'Tower damage is multiplied by [x] of the number of digits in your current cash',
    kind: 'percent',
    values: { epic: 12.5, legendary: 25, mythic: 50, ancestral: 100 },
  },
  restorativeBonus: {
    name: 'Restorative Bonus',
    description:
      'Packages grant a 50% attack speed boost for [x], decaying for 60 seconds.',
    kind: 'seconds',
    values: { epic: 15, legendary: 20, mythic: 25, ancestral: 30 },
  },
}

/** Wiki notes for the Generator module table. */
export const WORKSHOP_GENERATOR_MODULE_NOTES: readonly string[] = [
  'Project Funding will not go below a multiplier of x1.00 and has an effective multiplier of (1+Log(cash)*rarityMult)',
  'Black Hole Digestor just applies its bonus if a free upgrade is triggered regardless of if any free upgrades are available or not. If all upgrades in a category are maxed out, you will still receive a bonus if free upgrades trigger on that category.',
  'Pulsar Harvester has diminishing returns after reducing 100 levels on an enemy',
  'Restorative Bonus effect is refreshed when you obtain another Recovery Package; the duration does not stack.',
]

export function workshopGeneratorModuleValue(
  id: WorkshopGeneratorModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): number {
  return WORKSHOP_GENERATOR_MODULES[id].values[resolveChassisModuleEffectTier(tier)]
}

export function formatWorkshopGeneratorModuleAbility(
  id: WorkshopGeneratorModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string {
  return formatWorkshopChassisModuleAbility(WORKSHOP_GENERATOR_MODULES[id], tier)
}

export function workshopGeneratorModuleDef(
  id: WorkshopGeneratorModuleId,
): WorkshopGeneratorModuleDef {
  return WORKSHOP_GENERATOR_MODULES[id]
}

export { formatWorkshopChassisModuleValue as formatWorkshopGeneratorModuleValue }
