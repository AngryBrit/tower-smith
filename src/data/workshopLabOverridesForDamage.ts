/**
 * Merge player-save `researchLevel` into lab overrides for wiki **Displayed damage**
 * (attack Damage / Damage per meter / Attack Speed labs, modules cannon %, cards mastery, …).
 */

import {
  attackLabsToOverrides,
  cardMasteryLabsToOverrides,
  cardsLabsToOverrides,
  mainLabsToOverrides,
  modulesLabsToOverrides,
} from '../playerSave/mapPlayerDataToTower'
import { GAME_RESEARCH_SLOT_COUNT } from '../playerSave/gameResearchIndex'
import {
  attackResearchAttackSpeedLabMultiplier,
  attackResearchDamageLabMultiplier,
  attackResearchDamageStyleLabMultiplier,
  attackResearchDisplayedDamageLabMultiplier,
  damageStyleLabMultiplier,
  type ResearchData,
} from '../types/research'

export type WorkshopDisplayedDamageLabOpts = {
  labMultiplier?: number
  labDamageMultiplier?: number
  labDamagePerMeterMultiplier?: number
  labAttackSpeedMultiplier?: number
}

export function sanitizeGameResearchLevel(
  raw: unknown,
): number[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out = Array.from({ length: GAME_RESEARCH_SLOT_COUNT }, () => 0)
  for (let i = 0; i < Math.min(raw.length, GAME_RESEARCH_SLOT_COUNT); i++) {
    const n = Number(raw[i])
    out[i] = Number.isFinite(n) ? Math.trunc(n) : 0
  }
  return out
}

/** Re-apply save research ids for labs that affect displayed damage. */
export function mergeLabOverridesForDisplayedDamage(
  research: ResearchData,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): Record<string, number> {
  if (!gameResearchLevel?.length) return labOverrides
  const level = Array.from({ length: GAME_RESEARCH_SLOT_COUNT }, (_, i) => {
    const n = gameResearchLevel[i]
    return typeof n === 'number' && Number.isFinite(n) ? Math.trunc(n) : 0
  })
  return {
    ...labOverrides,
    ...mainLabsToOverrides(research, level),
    ...attackLabsToOverrides(research, level),
    ...modulesLabsToOverrides(research, level),
    ...cardsLabsToOverrides(research, level),
    ...cardMasteryLabsToOverrides(research, level),
  }
}

function displayedDamageLabFactorsFromRawSave(
  gameResearchLevel: readonly number[],
): { damage: number; damagePerMeter: number; attackSpeed: number } {
  const damage =
    typeof gameResearchLevel[0] === 'number' && Number.isFinite(gameResearchLevel[0])
      ? damageStyleLabMultiplier(Math.trunc(gameResearchLevel[0]), 100)
      : 1
  const attackSpeed =
    typeof gameResearchLevel[1] === 'number' && Number.isFinite(gameResearchLevel[1])
      ? damageStyleLabMultiplier(Math.trunc(gameResearchLevel[1]), 99)
      : 1
  const damagePerMeter =
    typeof gameResearchLevel[4] === 'number' && Number.isFinite(gameResearchLevel[4])
      ? damageStyleLabMultiplier(Math.trunc(gameResearchLevel[4]), 99)
      : 1
  return { damage, damagePerMeter, attackSpeed }
}

/** Wiki **Lab** term factors for displayed damage (Damage × DPM × Attack Speed). */
export function workshopDisplayedDamageLabOpts(
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): WorkshopDisplayedDamageLabOpts {
  if (research) {
    const merged = mergeLabOverridesForDisplayedDamage(
      research,
      labOverrides,
      gameResearchLevel,
    )
    const damage = attackResearchDamageLabMultiplier(research, merged)
    const damagePerMeter = attackResearchDamageStyleLabMultiplier(
      research,
      merged,
      'Damage / Meter',
    )
    const attackSpeed = attackResearchAttackSpeedLabMultiplier(research, merged)
    const labMultiplier = attackResearchDisplayedDamageLabMultiplier(research, merged)
    return {
      labMultiplier: labMultiplier > 1 + 1e-9 ? labMultiplier : undefined,
      labDamageMultiplier: damage > 1 + 1e-9 ? damage : undefined,
      labDamagePerMeterMultiplier: damagePerMeter > 1 + 1e-9 ? damagePerMeter : undefined,
      labAttackSpeedMultiplier: attackSpeed > 1 + 1e-9 ? attackSpeed : undefined,
    }
  }

  if (!gameResearchLevel?.length) return {}
  const { damage, damagePerMeter, attackSpeed } =
    displayedDamageLabFactorsFromRawSave(gameResearchLevel)
  const labMultiplier = damage * damagePerMeter * attackSpeed
  return {
    labMultiplier: labMultiplier > 1 + 1e-9 ? labMultiplier : undefined,
    labDamageMultiplier: damage > 1 + 1e-9 ? damage : undefined,
    labDamagePerMeterMultiplier: damagePerMeter > 1 + 1e-9 ? damagePerMeter : undefined,
    labAttackSpeedMultiplier: attackSpeed > 1 + 1e-9 ? attackSpeed : undefined,
  }
}

/**
 * Attack lab product for displayed damage (Damage × Damage/Meter × Attack Speed).
 * Uses merged overrides first; falls back to raw `researchLevel[0|1|4]` from the save.
 */
export function damageLabMultiplierFromSave(
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): number {
  const { labMultiplier } = workshopDisplayedDamageLabOpts(
    research,
    labOverrides,
    gameResearchLevel,
  )
  return labMultiplier ?? 1
}
