/**
 * Armor chassis modules (wiki): ability text and Epic → Ancestral values.
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

export const WORKSHOP_ARMOR_MODULE_ORDER = [
  'antiCubePortal',
  'negativeMassProjector',
  'wormholeRedirector',
  'spaceDisplacer',
  'sharpFortitude',
  'orbitalAugment',
] as const

export type WorkshopArmorModuleId = (typeof WORKSHOP_ARMOR_MODULE_ORDER)[number]

export type WorkshopArmorModuleDef = WorkshopChassisModuleDef

export const WORKSHOP_ARMOR_MODULES: Record<WorkshopArmorModuleId, WorkshopArmorModuleDef> = {
  antiCubePortal: {
    name: 'Anti-Cube Portal',
    description: 'Enemies take [x] damage for 7s after they are hit by a shockwave.',
    kind: 'damageMult',
    values: { epic: 10, legendary: 15, mythic: 20, ancestral: 25 },
  },
  negativeMassProjector: {
    name: 'Negative Mass Projector',
    description:
      "If an orb doesn't kill the enemy it will apply a stacking debuff, reducing its damage and speed by [x] per hit, to a max reduction of 50%",
    kind: 'percent',
    values: { epic: 1.0, legendary: 1.5, mythic: 2.0, ancestral: 2.5 },
  },
  wormholeRedirector: {
    name: 'Wormhole Redirector',
    description: 'Health Regen can heal up to [x] of Package Max Recovery',
    kind: 'percent',
    values: { epic: 25, legendary: 50, mythic: 75, ancestral: 100 },
  },
  spaceDisplacer: {
    name: 'Space Displacer',
    description:
      'Landmines have a [x] chance to spawn as an Inner Land Mine (20 max) instead of a normal mine. These mines autonomously move and organize around the tower.',
    kind: 'percent',
    values: { epic: 15, legendary: 20, mythic: 25, ancestral: 30 },
  },
  sharpFortitude: {
    name: 'Sharp Fortitude',
    description:
      "Increase the Wall's health and regen by [x]. Enemies take +1% increased damage from wall thorns per subsequent hit.",
    kind: 'mult',
    values: { epic: 1.25, legendary: 1.5, mythic: 2, ancestral: 2.5 },
  },
  orbitalAugment: {
    name: 'Orbital Augment',
    description:
      "Adds [x] orbiting Electrons around the tower. Each Electron deals damage equal to 15% of the enemy's remaining health (quarter effective against Bosses and Fleets)",
    kind: 'count',
    values: { epic: 2, legendary: 4, mythic: 6, ancestral: 8 },
  },
}

/** Wiki notes for the Armor module table. */
export const WORKSHOP_ARMOR_MODULE_NOTES: readonly string[] = [
  'Space displacer uses the lv1 x30 damage multiplier if the ultimate weapon is not unlocked. If you do have the ILM unlocked, the stats and effects of your ILM will be used. This means sub effects such as +ILM damage multiplier will affect total damage.',
  'Enemies still count as "hit" by shockwave/orbs for NMP/ACP effects even if they are immune to the effects.',
]

export function workshopArmorModuleValue(
  id: WorkshopArmorModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): number {
  return WORKSHOP_ARMOR_MODULES[id].values[resolveChassisModuleEffectTier(tier)]
}

export function formatWorkshopArmorModuleAbility(
  id: WorkshopArmorModuleId,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string {
  return formatWorkshopChassisModuleAbility(WORKSHOP_ARMOR_MODULES[id], tier)
}

export function workshopArmorModuleDef(id: WorkshopArmorModuleId): WorkshopArmorModuleDef {
  return WORKSHOP_ARMOR_MODULES[id]
}

export { formatWorkshopChassisModuleValue as formatWorkshopArmorModuleValue }
