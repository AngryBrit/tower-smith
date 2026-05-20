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
    astralDeliverance: 'cannon/astral_deliverance.webp',
    beingAnnihilator: 'cannon/being_annihilator.webp',
    deathPenalty: 'cannon/death_penalty.webp',
    havocBringer: 'cannon/havoc_bringer.webp',
  },
  armor: {
    antiCubePortal: 'armor/anti-cube_portal.webp',
    negativeMassProjector: 'armor/negative_mass_projector.webp',
    spaceDisplacer: 'armor/space_displacer.webp',
  },
  generator: {
    singularityHarness: 'generator/singularity_harness.webp',
    galaxyCompressor: 'generator/galaxy_compressor.webp',
    pulsarHarvester: 'generator/pulsar_harvester.webp',
    blackHoleDigestor: 'generator/blackhole_digester.webp',
  },
  core: {
    omChip: 'core/om_chip.webp',
    multiverseNexus: 'core/multiverse_nexus.webp',
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
