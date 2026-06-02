/**
 * Wiki **Displayed damage** (game-vault / Damage):
 *
 * **Displayed damage** = Workshop × Lab × Damage Card × (1 + Relics) × (1 + Cannon Module %)
 * × Enhancements × Perk + Berserker
 *
 * **Lab** = Attack **Damage** × partial **Damage / Meter** × **Attack Speed** labs
 * (DPM uses a fraction of **(labMult − 1)**; Damage and Attack Speed use full damage-style ×).
 *
 * **Workshop** = workshop damage upgrade value × equipped cannon chassis **Tower Damage** (×1 if none).
 * No rounding until `formatCoinAbbrev` on the final value.
 *
 * **Perk** = (1 + 0.15 × Quantity) × (1 + Standard Perk Bonus) — do not round.
 * **Berserker** = min(damage taken × rate, **+700%** of the pre-berserker product = **7×** that product).
 */

import { workshopCardMasteryMultiplier } from './workshopCardMastery'
import { workshopDamageCardMultiplier } from './workshopCardWorkshopDisplay'
import { workshopEquippedCardStars } from './workshopGameCards'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  attackResearchStandardPerkBonusFraction,
  type ResearchData,
} from '../types/research'
import { workshopEnhanceAttackTierMultiplier } from './workshopEnhanceAttackShared'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { workshopBerserkerDisplayedDamageAdd } from './workshopSimCards'
import { workshopCannonModulePercentFromLabs } from './workshopSimModules'
import { workshopDamageStatAtLevel } from './workshopDamage'
import { workshopChassisModuleHeroStatMultiplier } from './workshopChassisModuleHeroStatWorkshop'
import {
  mergeLabOverridesForDisplayedDamage,
  workshopDisplayedDamageLabOpts,
} from './workshopLabOverridesForDamage'
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
  workshopDamageCardMultiplierFromStars,
} from './workshopSimCards'

export type WorkshopDamageDisplayOpts = {
  /** Cannon chassis **Tower Damage** folded into **Workshop** (default 1). */
  chassisTowerDamageMultiplier?: number
  /** Product of Damage × Damage/Meter × Attack Speed labs. */
  labMultiplier?: number
  /** Optional factors for tooltip breakdown (should match `labMultiplier`). */
  labDamageMultiplier?: number
  labDamagePerMeterMultiplier?: number
  labAttackSpeedMultiplier?: number
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

function workshopEffectiveDamage(
  workshopDamage: number,
  opts: WorkshopDamageDisplayOpts,
): number {
  return workshopDamage * (opts.chassisTowerDamageMultiplier ?? 1)
}

/** @see WorkshopDamageDisplayOpts — **Perk** term only; not rounded. */
export function workshopDisplayedDamagePerkMultiplier(opts: WorkshopDamageDisplayOpts): number {
  const quantity = opts.perkDamageQuantity ?? 0
  const standard = opts.standardPerkBonus ?? 0
  return (1 + 0.15 * quantity) * (1 + standard)
}

/**
 * Wiki multiplicative product (Workshop × Lab × … × Perk) with no intermediate rounding.
 */
export function computeWorkshopDisplayedDamagePreBerserker(
  workshopDamage: number,
  opts: WorkshopDamageDisplayOpts = {},
): number {
  const workshop = workshopEffectiveDamage(workshopDamage, opts)
  const lab = opts.labMultiplier ?? 1
  const card = opts.damageCardMultiplier ?? 1
  const relics = 1 + (opts.relicsBonus ?? 0)
  const cannon = 1 + (opts.cannonModulePercent ?? 0)
  const enhancements = opts.enhancementsMultiplier ?? 1
  const perk = workshopDisplayedDamagePerkMultiplier(opts)

  return workshop * lab * card * relics * cannon * enhancements * perk
}

/**
 * Displayed tower damage from workshop base and optional multipliers (wiki formula).
 * Rounding only when formatting for UI (`formatCoinAbbrev`).
 */
export function computeWorkshopDisplayedDamage(
  workshopDamage: number,
  opts: WorkshopDamageDisplayOpts = {},
): number {
  return (
    computeWorkshopDisplayedDamagePreBerserker(workshopDamage, opts) +
    (opts.berserkerDamageAdd ?? 0)
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
  return computeWorkshopDisplayedDamage(workshop, normalized ?? {})
}

/** Wiki factors from workshop sim only (labs/cards mastery need {@link ResearchData}). */
export function workshopDamageDisplayOptsWorkshopSimOnly(
  ws: WorkshopPersistedV1,
): WorkshopDamageDisplayOpts {
  const chassisTowerDamageMultiplier = workshopChassisModuleHeroStatMultiplier(ws, 'cannon')
  const berserkerStars = workshopEquippedCardStars(ws, 'berserker')
  const base: WorkshopDamageDisplayOpts = {
    chassisTowerDamageMultiplier:
      chassisTowerDamageMultiplier > 1 + 1e-9 ? chassisTowerDamageMultiplier : undefined,
    labMultiplier: 1,
    damageCardMultiplier: workshopDamageCardMultiplier(ws, null, {}),
    relicsBonus: ws.simRelicsBonusFraction,
    cannonModulePercent: 0,
    enhancementsMultiplier: workshopEnhanceAttackTierMultiplier(
      ws.enhanceDamageLevel,
      undefined,
      undefined,
      false,
    ),
    perkDamageQuantity: ws.simPerkDamageQuantity,
    standardPerkBonus: 0,
    berserkerDamageAdd: 0,
  }
  const preBerserker = computeWorkshopDisplayedDamagePreBerserker(
    workshopDamageStatAtLevel(ws.damageLevel),
    base,
  )
  return enrichDamageDisplayOpts(
    {
      ...base,
      berserkerDamageAdd: workshopBerserkerDisplayedDamageAdd(
        preBerserker,
        ws.simBerserkerDamageTaken,
        berserkerStars,
        1,
      ),
    },
    new Set(ws.relicOwnedIds),
  )
}

/** Build all wiki displayed-damage opts from workshop + lab sim + cards/modules sim. */
export function workshopDamageDisplayOptsFromPersisted(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): WorkshopDamageDisplayOpts {
  const labOpts = workshopDisplayedDamageLabOpts(research, labOverrides, gameResearchLevel)

  if (research == null) {
    const sim = workshopDamageDisplayOptsWorkshopSimOnly(ws)
    return labOpts.labMultiplier != null ? { ...sim, ...labOpts } : sim
  }

  const effectiveLabOverrides = mergeLabOverridesForDisplayedDamage(
    research,
    labOverrides,
    gameResearchLevel,
  )

  const workshop = workshopDamageStatAtLevel(ws.damageLevel)
  const damageCardMultiplier = workshopDamageCardMultiplier(
    ws,
    research,
    effectiveLabOverrides,
  )
  const berserkerStars = workshopEquippedCardStars(ws, 'berserker')
  const berserkerMasteryMultiplier =
    berserkerStars > 0
      ? workshopCardMasteryMultiplier('berserker', research, effectiveLabOverrides)
      : 1
  const chassisTowerDamageMultiplier = workshopChassisModuleHeroStatMultiplier(ws, 'cannon')
  const enhanceLevel = workshopEnhancementsLabUnlocked(research, effectiveLabOverrides)
    ? ws.enhanceDamageLevel
    : 0
  const base: WorkshopDamageDisplayOpts = {
    chassisTowerDamageMultiplier:
      chassisTowerDamageMultiplier > 1 + 1e-9 ? chassisTowerDamageMultiplier : undefined,
    ...labOpts,
    damageCardMultiplier,
    relicsBonus: ws.simRelicsBonusFraction,
    cannonModulePercent: workshopCannonModulePercentFromLabs(
      research,
      effectiveLabOverrides,
      ws.simAssistModuleSlot,
    ),
    enhancementsMultiplier: workshopEnhanceAttackTierMultiplier(
      enhanceLevel,
      undefined,
      undefined,
      false,
    ),
    perkDamageQuantity: ws.simPerkDamageQuantity,
    standardPerkBonus: attackResearchStandardPerkBonusFraction(
      research,
      effectiveLabOverrides,
    ),
    berserkerDamageAdd: 0,
  }

  const preBerserker = computeWorkshopDisplayedDamagePreBerserker(workshop, base)
  return enrichDamageDisplayOpts(
    {
      ...base,
      berserkerDamageAdd: workshopBerserkerDisplayedDamageAdd(
        preBerserker,
        ws.simBerserkerDamageTaken,
        berserkerStars,
        berserkerMasteryMultiplier,
      ),
    },
    new Set(ws.relicOwnedIds),
  )
}

/** Human-readable wiki factor breakdown (for UI tooltips). */
export function formatWorkshopDisplayedDamageBreakdown(
  opts: WorkshopDamageDisplayOpts,
): string {
  const parts: string[] = []
  const chassis = opts.chassisTowerDamageMultiplier ?? 1
  if (chassis > 1 + 1e-9) parts.push(`chassis ×${chassis.toFixed(2)}`)
  const dmg = opts.labDamageMultiplier
  const dpm = opts.labDamagePerMeterMultiplier
  const as = opts.labAttackSpeedMultiplier
  if (dmg != null && dpm != null && as != null) {
    parts.push(`dmg ×${dmg.toFixed(2)} · dpm ×${dpm.toFixed(2)} · as ×${as.toFixed(2)}`)
  } else {
    const lab = opts.labMultiplier ?? 1
    if (lab > 1 + 1e-9) parts.push(`lab ×${lab.toFixed(2)}`)
  }
  const card = opts.damageCardMultiplier ?? 1
  if (card > 1 + 1e-9) parts.push(`Damage card ×${card.toFixed(2)}`)
  const relics = opts.relicsBonus ?? 0
  if (relics > 0) parts.push(`relics +${(relics * 100).toFixed(0)}%`)
  const cannon = opts.cannonModulePercent ?? 0
  if (cannon > 0) parts.push(`cannon module +${(cannon * 100).toFixed(0)}%`)
  const enhance = opts.enhancementsMultiplier ?? 1
  if (enhance > 1 + 1e-9) parts.push(`enhance ×${enhance.toFixed(2)}`)
  const perk = workshopDisplayedDamagePerkMultiplier(opts)
  if (perk > 1 + 1e-9) parts.push(`perk ×${perk.toFixed(2)}`)
  const berserk = opts.berserkerDamageAdd ?? 0
  if (berserk > 0) parts.push(`+${berserk.toExponential(2)} berserker`)
  return parts.length ? parts.join(' · ') : 'workshop only'
}

export function workshopDisplayedDamageFromPersisted(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): number {
  const workshop = workshopDamageStatAtLevel(ws.damageLevel)
  return computeWorkshopDisplayedDamage(
    workshop,
    workshopDamageDisplayOptsFromPersisted(
      ws,
      research,
      labOverrides,
      gameResearchLevel,
    ),
  )
}
