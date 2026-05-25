/**
 * Chassis module icon paths under `public/modules/`.
 */

import {
  resolveChassisModuleEffectTier,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'

const base = import.meta.env.BASE_URL

/** Rarity placeholder when a module has no dedicated art yet. */
export const WORKSHOP_MODULE_RARITY_PLACEHOLDER: Record<WorkshopChassisModuleEffectTier, string> = {
  epic: 'mod_epic.webp',
  legendary: 'mod_legendary.webp',
  mythic: 'mod_mythic.webp',
  ancestral: 'mod_anc.webp',
}

/** Relative paths from `public/modules/` (missing entries use rarity placeholder). */
export const WORKSHOP_CHASSIS_MODULE_IMAGE: Record<
  WorkshopAssistModuleSlot,
  Readonly<Record<string, string>>
> = {
  cannon: {
    amplifyingStrike: 'cannon/Amplifying_Strike_1_0.webp',
    astralDeliverance: 'cannon/cannon_epic_4.webp',
    beingAnnihilator: 'cannon/cannon_epic_3.webp',
    deathPenalty: 'cannon/cannon_epic_2.webp',
    havocBringer: 'cannon/cannon_epic_1.webp',
    shrinkRay: 'cannon/Shrink%20Ray.webp',
  },
  armor: {
    orbitalAugment: 'armor/Orbital_Augment_4_0.webp',
    sharpFortitude: 'armor/Sharp%20Fortitude.webp',
    wormholeRedirector: 'armor/armor_epic_1.webp',
    antiCubePortal: 'armor/armor_epic_2.webp',
    negativeMassProjector: 'armor/armor_epic_4.webp',
    spaceDisplacer: 'armor/armor_epic_3.webp',
  },
  generator: {
    projectFunding: 'generator/Project%20Funding.webp',
    restorativeBonus: 'generator/Restorative_Boost_5_0.webp',
    singularityHarness: 'generator/generator_epic_4.webp',
    galaxyCompressor: 'generator/generator_epic_3.webp',
    pulsarHarvester: 'generator/generator_epic_2.webp',
    blackHoleDigestor: 'generator/generator_epic_1.webp',
  },
  core: {
    dimensionCore: 'core/core_epic_2.webp',
    harmonyConductor: 'core/core_epic_3.webp',
    omChip: 'core/core_epic_4.webp',
    multiverseNexus: 'core/core_epic_1.webp',
    primordialCollapse: 'core/Primordial_Collapse_5_1.webp',
    magneticHook: 'core/Magnetic%20Hook.webp',
  },
}

export function workshopChassisModuleHasDedicatedArt(
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): boolean {
  return moduleId in WORKSHOP_CHASSIS_MODULE_IMAGE[slot]
}

export function workshopChassisModuleImagePath(
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string {
  const effect = resolveChassisModuleEffectTier(tier)
  return (
    WORKSHOP_CHASSIS_MODULE_IMAGE[slot][moduleId] ?? WORKSHOP_MODULE_RARITY_PLACEHOLDER[effect]
  )
}

/** Dedicated module art only (no rarity placeholder). */
export function workshopChassisModuleDedicatedImageUrl(
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): string | null {
  const rel = WORKSHOP_CHASSIS_MODULE_IMAGE[slot][moduleId]
  if (rel == null) return null
  return `${base}modules/${rel}`
}

export function workshopChassisModuleImageUrl(
  slot: WorkshopAssistModuleSlot,
  moduleId: string | null,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string | null {
  if (moduleId == null) return null
  return `${base}modules/${workshopChassisModuleImagePath(slot, moduleId, tier)}`
}
