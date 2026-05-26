/**
 * Wiki **Displayed damage** (game-vault / Damage):
 * Workshop × Lab × Damage Card × (1 + Relics) × (1 + Cannon Module %)
 * × Enhancements × Perk + Berserker
 *
 * Perk = (1 + 0.15 × Quantity) × (1 + Standard Perk Bonus) — do not round intermediate terms.
 * Berserker is a flat add after the product, capped at **+700%** of the pre-berserker product (**7×**).
 */

import { workshopCardMasteryMultiplier } from './workshopCardMastery'
import { workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  attackResearchDamageLabMultiplier,
  attackResearchStandardPerkBonusFraction,
  type ResearchData,
} from '../types/research'
import { workshopEnhanceAttackTierMultiplier } from './workshopEnhanceAttackShared'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { workshopBerserkerDisplayedDamageAdd } from './workshopSimCards'
import { workshopCannonModulePercentFromLabs } from './workshopSimModules'
import { workshopDamageStatAtLevel } from './workshopDamage'
import { enrichDamageDisplayOpts } from './workshopRelicWorkshopDisplay'

export type { WorkshopAssistModuleSlot } from './workshopSimModules'
export {
  WORKSHOP_ASSIST_MODULE_SLOTS,
  workshopAssistModuleLabPercentPoints,
  workshopCannonModulePercentFromLabs,
} from './workshopSimModules'
export {
  WORKSHOP_BERSERKER_CARD_MAX_STARS,
  WORKSHOP_DAMAGE_CARD_MAX_STARS,
  workshopBerserkerCardPercent,
  workshopBerserkerDisplayedDamageAdd,
  workshopDamageCardMultiplier,
} from './workshopSimCards'

export type WorkshopDamageDisplayOpts = {
  labMultiplier?: number
  damageCardMultiplier?: number
  /** Relic bonus summed into **(1 + Relics)** (e.g. 0.5 for +50%). */
  relicsBonus?: number
  /** Cannon module damage % as a decimal added to 1 (e.g. 0.3 for +30%). */
  cannonModulePercent?: number
  enhancementsMultiplier?: number
  /** Damage perk count for **(1 + 0.15 × Quantity)**. */
  perkDamageQuantity?: number
  /** Standard Perks Bonus lab as a decimal (e.g. 0.25 for 25%). */
  standardPerkBonus?: number
  /** Flat Berserker card bonus added after the product. */
  berserkerDamageAdd?: number
}

/**
 * Pre-berserker product (Workshop × Lab × … × Perk) with no intermediate rounding.
 * @see computeWorkshopDisplayedDamage
 */
export function computeWorkshopDisplayedDamagePreBerserker(
  workshopDamage: number,
  opts: WorkshopDamageDisplayOpts = {},
): number {
  return computeWorkshopDisplayedDamage(workshopDamage, {
    ...opts,
    berserkerDamageAdd: 0,
  })
}

/** @see WorkshopDamageDisplayOpts */
export function workshopDisplayedDamagePerkMultiplier(opts: WorkshopDamageDisplayOpts): number {
  const quantity = opts.perkDamageQuantity ?? 0
  const standard = opts.standardPerkBonus ?? 0
  return (1 + 0.15 * quantity) * (1 + standard)
}

/**
 * Displayed tower damage from workshop base and optional multipliers (wiki formula).
 * Avoid rounding until the final abbrev formatting step.
 */
export function computeWorkshopDisplayedDamage(
  workshopDamage: number,
  opts: WorkshopDamageDisplayOpts = {},
): number {
  const lab = opts.labMultiplier ?? 1
  const card = opts.damageCardMultiplier ?? 1
  const relics = 1 + (opts.relicsBonus ?? 0)
  const cannon = 1 + (opts.cannonModulePercent ?? 0)
  const enhancements = opts.enhancementsMultiplier ?? 1
  const perk = workshopDisplayedDamagePerkMultiplier(opts)
  const berserker = opts.berserkerDamageAdd ?? 0

  return (
    workshopDamage * lab * card * relics * cannon * enhancements * perk + berserker
  )
}

function normalizeDamageDisplayOpts(
  opts?: WorkshopDamageDisplayOpts | number,
): WorkshopDamageDisplayOpts | undefined {
  if (opts === undefined) return undefined
  if (typeof opts === 'number') return { labMultiplier: opts }
  return opts
}

export function workshopDisplayedDamageFromWorkshopLevel(
  completedLevels: number,
  opts?: WorkshopDamageDisplayOpts | number,
): number {
  const workshop = workshopDamageStatAtLevel(completedLevels)
  const normalized = normalizeDamageDisplayOpts(opts)
  if (normalized === undefined) return workshop
  return computeWorkshopDisplayedDamage(workshop, normalized)
}

/** Build wiki displayed-damage opts from workshop + lab sim + cards/modules sim. */
export function workshopDamageDisplayOptsFromPersisted(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
): WorkshopDamageDisplayOpts | undefined {
  if (research == null) return undefined

  const workshop = workshopDamageStatAtLevel(ws.damageLevel)
  const damageCardMultiplier =
    ws.simDamageCardStars > 0
      ? workshopCardMultProduct(ws, research, labOverrides, 'damage')
      : 1
  const berserkerMasteryMultiplier =
    ws.simBerserkerCardStars > 0
      ? workshopCardMasteryMultiplier('berserker', research, labOverrides)
      : 1
  const base: WorkshopDamageDisplayOpts = {
    labMultiplier: attackResearchDamageLabMultiplier(research, labOverrides),
    damageCardMultiplier,
    relicsBonus: ws.simRelicsBonusFraction,
    cannonModulePercent: workshopCannonModulePercentFromLabs(
      research,
      labOverrides,
      ws.simAssistModuleSlot,
    ),
    enhancementsMultiplier: workshopEnhanceAttackTierMultiplier(
      workshopEnhancementsLabUnlocked(research, labOverrides) ? ws.enhanceDamageLevel : 0,
    ),
    perkDamageQuantity: ws.simPerkDamageQuantity,
    standardPerkBonus: attackResearchStandardPerkBonusFraction(research, labOverrides),
    berserkerDamageAdd: 0,
  }

  const preBerserker = computeWorkshopDisplayedDamagePreBerserker(workshop, base)
  const withBerserker: WorkshopDamageDisplayOpts = {
    ...base,
    berserkerDamageAdd: workshopBerserkerDisplayedDamageAdd(
      preBerserker,
      ws.simBerserkerDamageTaken,
      ws.simBerserkerCardStars,
      berserkerMasteryMultiplier,
    ),
  }
  return enrichDamageDisplayOpts(withBerserker, new Set(ws.relicOwnedIds))
}

export function workshopDisplayedDamageFromPersisted(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
): number {
  const workshop = workshopDamageStatAtLevel(ws.damageLevel)
  const opts = workshopDamageDisplayOptsFromPersisted(ws, research, labOverrides)
  if (opts === undefined) return workshop
  return computeWorkshopDisplayedDamage(workshop, opts)
}
