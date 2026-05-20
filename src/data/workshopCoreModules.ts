/**
 * Core chassis modules (wiki): ability text and Epic → Ancestral values.
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

export const WORKSHOP_CORE_MODULE_ORDER = [
  'omChip',
  'harmonyConductor',
  'dimensionCore',
  'multiverseNexus',
  'magneticHook',
  'primordialCollapse',
] as const

export type WorkshopCoreModuleId = (typeof WORKSHOP_CORE_MODULE_ORDER)[number]

export type WorkshopCoreModuleDef = WorkshopChassisModuleDef

export const WORKSHOP_CORE_MODULES: Record<WorkshopCoreModuleId, WorkshopCoreModuleDef> = {
  omChip: {
    name: 'Om Chip',
    description:
      'Spotlight will rotate to focus a boss. Bosses reflect the light around it to nearby enemies, increasing by [x] the damage they receive.',
    kind: 'mult',
    values: { epic: 2, legendary: 4, mythic: 7, ancestral: 15 },
  },
  harmonyConductor: {
    name: 'Harmony Conductor',
    description: '[x] chance of poisoned enemies to miss-attack (bosses chance is halved).',
    kind: 'percent',
    values: { epic: 15, legendary: 20, mythic: 25, ancestral: 30 },
  },
  dimensionCore: {
    name: 'Dimension Core',
    description:
      'Chain lightning have 60% chance of hitting the initial target. Shock chance and multiplier is doubled. If shock is applied again to the same enemy the shock multiplier will add up to a max stack of [x].',
    kind: 'count',
    values: { epic: 5, legendary: 10, mythic: 15, ancestral: 20 },
  },
  multiverseNexus: {
    name: 'Multiverse Nexus',
    description:
      'Death Wave, Golden Tower and Black Hole will always activate at the same time, but the cooldown will be the average of those +/-[x].',
    kind: 'seconds',
    values: { epic: 20, legendary: 10, mythic: 1, ancestral: -10 },
  },
  magneticHook: {
    name: 'Magnetic Hook',
    description:
      '[x] Inner Land Mines are fired at Bosses as they enter Tower range. 25% of Elites have Inner Land Mines fired at them as they enter Tower range.',
    kind: 'count',
    values: { epic: 1, legendary: 2, mythic: 3, ancestral: 4 },
  },
  primordialCollapse: {
    name: 'Primordial Collapse',
    description:
      'Spawns one additional Black Hole. Damage from enemies within a Black Hole is decreased by [x]',
    kind: 'percent',
    values: { epic: 50, legendary: 55, mythic: 65, ancestral: 80 },
  },
}

/** Wiki notes for the Core module table (Dimension Core shock stacking). */
export const WORKSHOP_CORE_MODULE_NOTES: readonly string[] = [
  'Dimension Core — base shock mult with lab maxed is 1.66× (1 + 0.66).',
  'Dimension Core — base shock mult after doubled by Dimension Core: 2.32× (1 + 1.32).',
  'Dimension Core — shock mult stacking is additive: 1 + 1.32×n (e.g. 20 stacks → 1 + 1.32×20 = 27.4× total mult when fully stacked).',
]

export function workshopCoreModuleValue(
  id: WorkshopCoreModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): number {
  return WORKSHOP_CORE_MODULES[id].values[resolveChassisModuleEffectTier(tier)]
}

export function formatWorkshopCoreModuleAbility(
  id: WorkshopCoreModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string {
  return formatWorkshopChassisModuleAbility(WORKSHOP_CORE_MODULES[id], tier)
}

export function workshopCoreModuleDef(id: WorkshopCoreModuleId): WorkshopCoreModuleDef {
  return WORKSHOP_CORE_MODULES[id]
}

export { formatWorkshopChassisModuleValue as formatWorkshopCoreModuleValue }
