/**
 * Workshop **Land Mine Damage**: wiki milestone **Level** / **Value** / **Cost** (marginal) / **Total Cost**;
 * max **200** levels. Between milestones, **Value** (%) and marginal **Cost** use log-linear interpolation.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
export const WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL = 200 as const

const ANCHOR_LEVELS: readonly number[] = [
  1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
]

/** Damage **%** at each anchor level (wiki **Value**). */
const ANCHOR_STAT_PERCENT: readonly number[] = [
  110, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2100,
]

const ANCHOR_MARGINAL_COINS: readonly number[] = [
  500, 8240, 65_190, 239_710, 608_870, 1.26e6, 2.33e6, 3.85e6, 6.22e6, 9.1e6, 25.57e6, 93.9e6, 372.95e6,
  1.89e9, 9.61e9, 48e9, 274.16e9, 1.33e12, 7.75e12, 36.9e12, 217.61e12,
]

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

function segmentIndex(level: number): number {
  if (level <= ANCHOR_LEVELS[0]!) return 0
  let i = 0
  while (i < ANCHOR_LEVELS.length - 1 && ANCHOR_LEVELS[i + 1]! < level) i += 1
  return i
}

/** Land mine damage multiplier after `completedLevels` workshop purchases (0 … 200). */
export function workshopLandMineDamageStatPercent(completedLevels: number): number {
  return workshopToolkitStatValue('Land Mine Damage', completedLevels)!
}

/** In-game workshop card: **`x1.0`** … **`x21.0`** (GOD `valueDisplay` uses two decimals + suffix). */
export function formatWorkshopLandMineDamageMultiplier(mult: number): string {
  return `x${mult.toFixed(1)}`
}

export function workshopLandMineDamageStatDisplay(completedLevels: number): string {
  return formatWorkshopLandMineDamageMultiplier(workshopLandMineDamageStatPercent(completedLevels))
}

/** **Land Mine Damage +** tier when the Workshop Enhancements lab is unlocked (×1 when locked or L0). */
export function workshopDisplayedLandMineDamageEnhancementMultiplier(
  enhanceLandMineDamageLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceLandMineDamageLevel <= 0) return 1
  return workshopEnhanceTier400Multiplier(
    Math.max(0, Math.trunc(enhanceLandMineDamageLevel)),
    'Land Mine Damage +',
  )
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL) return undefined
  if (targetLevel === 1) return ANCHOR_MARGINAL_COINS[0]

  const i = segmentIndex(targetLevel)
  const L0 = ANCHOR_LEVELS[i]!
  const L1 = ANCHOR_LEVELS[i + 1]!
  const v0 = ANCHOR_MARGINAL_COINS[i]!
  const v1 = ANCHOR_MARGINAL_COINS[i + 1]!
  if (targetLevel === L0) return v0
  if (targetLevel === L1) return v1
  if (L1 <= L0) return v0
  const t = (targetLevel - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

export function workshopLandMineDamageNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Land Mine Damage', completedLevels)
}
