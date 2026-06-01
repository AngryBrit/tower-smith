/**
 * In-game **Cards** sim (wiki star tables) for workshop displayed-damage.
 */

import {
  WORKSHOP_GAME_CARD_WIKI,
  workshopBerserkerCardRateFromStars,
} from './workshopGameCardWiki'

/** Wiki **Cards/Damage** star multipliers (stars 1…7). */
export const WORKSHOP_DAMAGE_CARD_STAR_MULTIPLIERS = WORKSHOP_GAME_CARD_WIKI.damage.stars

/** Wiki **Cards/Attack Speed** star multipliers (stars 1…7). */
export const WORKSHOP_ATTACK_SPEED_CARD_STAR_MULTIPLIERS =
  WORKSHOP_GAME_CARD_WIKI.attackSpeed.stars

export const WORKSHOP_DAMAGE_CARD_MAX_STARS = 7 as const
export const WORKSHOP_ATTACK_SPEED_CARD_MAX_STARS = 7 as const
export const WORKSHOP_BERSERKER_CARD_MAX_STARS = 7 as const

export function workshopAttackSpeedCardMultiplier(stars: number): number {
  const s = Math.trunc(stars)
  if (s <= 0) return 1
  if (s >= WORKSHOP_ATTACK_SPEED_CARD_STAR_MULTIPLIERS.length) {
    return WORKSHOP_ATTACK_SPEED_CARD_STAR_MULTIPLIERS[
      WORKSHOP_ATTACK_SPEED_CARD_STAR_MULTIPLIERS.length - 1
    ]!
  }
  return WORKSHOP_ATTACK_SPEED_CARD_STAR_MULTIPLIERS[s - 1]!
}

/** Star table only (no equip / mastery); prefer {@link workshopDamageCardMultiplier} in workshopCardWorkshopDisplay. */
export function workshopDamageCardMultiplierFromStars(stars: number): number {
  const s = Math.trunc(stars)
  if (s <= 0) return 1
  if (s >= WORKSHOP_DAMAGE_CARD_STAR_MULTIPLIERS.length) {
    return WORKSHOP_DAMAGE_CARD_STAR_MULTIPLIERS[WORKSHOP_DAMAGE_CARD_STAR_MULTIPLIERS.length - 1]!
  }
  return WORKSHOP_DAMAGE_CARD_STAR_MULTIPLIERS[s - 1]!
}

export function workshopBerserkerCardPercent(stars: number): number {
  return workshopBerserkerCardRateFromStars(stars)
}

/** Max Berserker flat add as a multiple of pre-berserker product (+700% → **7×**). */
export const WORKSHOP_BERSERKER_MAX_ADD_MULTIPLIER = 7 as const

/**
 * Flat Berserker add for displayed damage (wiki: min(damage taken × rate, **+700%** of
 * pre-berserker product = **7×** that product).
 */
export function workshopBerserkerDisplayedDamageAdd(
  preBerserkerProduct: number,
  damageTaken: number,
  berserkerStars: number,
  masteryMultiplier = 1,
): number {
  if (berserkerStars <= 0 || damageTaken <= 0 || preBerserkerProduct <= 0) return 0
  const mult =
    masteryMultiplier > 0 && Number.isFinite(masteryMultiplier) ? masteryMultiplier : 1
  const rate = workshopBerserkerCardPercent(berserkerStars) * mult
  const fromTaken = damageTaken * rate
  const cap = preBerserkerProduct * WORKSHOP_BERSERKER_MAX_ADD_MULTIPLIER
  return Math.min(fromTaken, cap)
}
