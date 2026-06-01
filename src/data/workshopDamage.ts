/**
 * Workshop **Damage**: flat damage per projectile (base for towers, mines, UWs).
 * Max **6000** levels; milestone **Value** and marginal **Cost** ((L−1)→L) from published tables;
 * between milestones, values and costs use log-linear interpolation.
 *
 * Wiki **Attack Upgrades → Workshop Damage** rows also show **Total** cumulative spend; that is
 * not the same as marginal **Cost** on the same row (e.g. Lv. **5900**: Value **65.80M**, Cost **1.97T**,
 * Total **315.16T**). This module implements marginal coins for the next upgrade (what the workshop UI shows).
 */

import { formatCoinAbbrev } from '../labCosts'
import {
  workshopDisplayedDamageFromWorkshopLevel,
  type WorkshopDamageDisplayOpts,
} from './workshopDisplayedDamage'

export type { WorkshopDamageDisplayOpts } from './workshopDisplayedDamage'
export {
  computeWorkshopDisplayedDamage,
  formatWorkshopDisplayedDamageBreakdown,
  workshopDisplayedDamagePerkMultiplier,
} from './workshopDisplayedDamage'

export const WORKSHOP_DAMAGE_MAX_LEVEL = 6000 as const

/** Milestone workshop levels (must stay sorted ascending). */
const ANCHOR_LEVELS: readonly number[] = [
  1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500,
  3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200,
  5300, 5400, 5500, 5600, 5700, 5800, 5900, 6000,
]

/** Damage stat at each anchor level (after that many workshop levels). */
const ANCHOR_STAT: readonly number[] = [
  6, 1050, 3640, 7770, 13440, 20650, 29400, 39690, 51520, 64890, 79800, 97550, 119740, 146600, 178270,
  214840, 257990, 309860, 370860, 441240, 521190, 613220, 720920, 845270, 986890, 1.15e6, 1.33e6, 1.53e6,
  1.77e6, 2.04e6, 2.34e6, 2.68e6, 3.07e6, 3.52e6, 4.02e6, 4.59e6, 5.24e6, 5.97e6, 6.82e6, 7.77e6, 8.85e6,
  10.05e6, 11.42e6, 12.95e6, 14.66e6, 16.55e6, 18.64e6, 20.93e6, 23.42e6, 26.13e6, 29.05e6, 32.19e6,
  35.56e6, 39.16e6, 42.99e6, 47.06e6, 51.37e6, 55.93e6, 60.74e6, 65.8e6, 71.11e6,
]

/**
 * Marginal coin cost for the upgrade that ends at `targetLevel` (i.e. (targetLevel−1) → targetLevel),
 * matching the wiki **Cost** on the row for that level.
 */
const ANCHOR_MARGINAL_COINS: readonly number[] = [
  30, 80730, 643070, 1.59e6, 3.03e6, 5e6, 7.52e6, 10.61e6, 14.32e6, 18.64e6, 23.6e6, 29.21e6, 35.5e6,
  42.47e6, 50.14e6, 58.53e6, 67.63e6, 77.47e6, 88.05e6, 99.39e6, 111.49e6, 124.36e6, 138.02e6,
  152.48e6, 167.73e6, 183.79e6, 200.67e6, 218.37e6, 236.91e6, 256.28e6, 276.51e6, 297.58e6, 319.52e6,
  342.32e6, 365.99e6, 390.55e6, 415.99e6, 442.32e6, 469.55e6, 497.69e6, 526.73e6, 556.69e6, 587.56e6,
  619.37e6, 652.1e6, 685.77e6, 720.38e6, 755.93e6, 792.44e6, 829.9e6, 868.32e6, 1.82e9, 3.79e9, 7.92e9,
  16.51e9, 43e9, 111.93e9, 291.14e9, 756.76e9, 1.97e12, 5.1e12,
]

function logLerp(a: number, b: number, t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (a <= 0 || b <= 0) return a + u * (b - a)
  return Math.exp(Math.log(a) + u * (Math.log(b) - Math.log(a)))
}

function segmentIndex(level: number): number {
  if (level <= ANCHOR_LEVELS[0]) return 0
  let i = 0
  while (i < ANCHOR_LEVELS.length - 1 && ANCHOR_LEVELS[i + 1] < level) i += 1
  return i
}

/** Damage stat after `completedLevels` workshop upgrades (0 … 6000). */
export function workshopDamageStatAtLevel(completedLevels: number): number {
  const L = Math.min(Math.max(0, completedLevels), WORKSHOP_DAMAGE_MAX_LEVEL)
  if (L === 0) return 0
  if (L <= 1) return 6 * L

  const i = segmentIndex(L)
  const L0 = ANCHOR_LEVELS[i]
  const L1 = ANCHOR_LEVELS[i + 1]
  const v0 = ANCHOR_STAT[i]
  const v1 = ANCHOR_STAT[i + 1]
  if (L1 <= L0) return v0
  const t = (L - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

/**
 * Abbreviated displayed damage (wiki formula when {@link WorkshopDamageDisplayOpts} passed;
 * legacy: a bare `number` is treated as **labMultiplier** only).
 */
export function workshopDamageStatDisplay(
  completedLevels: number,
  opts?: WorkshopDamageDisplayOpts | number,
): string {
  return formatCoinAbbrev(workshopDisplayedDamageFromWorkshopLevel(completedLevels, opts))
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_DAMAGE_MAX_LEVEL) return undefined
  if (targetLevel === 1) return ANCHOR_MARGINAL_COINS[0]

  const i = segmentIndex(targetLevel)
  const L0 = ANCHOR_LEVELS[i]
  const L1 = ANCHOR_LEVELS[i + 1]
  const v0 = ANCHOR_MARGINAL_COINS[i]
  const v1 = ANCHOR_MARGINAL_COINS[i + 1]
  if (targetLevel === L0) return v0
  if (targetLevel === L1) return v1
  if (L1 <= L0) return v0
  const t = (targetLevel - L0) / (L1 - L0)
  return logLerp(v0, v1, t)
}

/**
 * Coins for the next workshop damage upgrade when `completedLevels` purchases are already done.
 * Returns `undefined` when maxed (6000) or out of range.
 */
export function workshopDamageNextMarginalCoins(completedLevels: number): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_DAMAGE_MAX_LEVEL) return undefined
  return marginalCoinsPurchaseEndingAt(completedLevels + 1)
}
