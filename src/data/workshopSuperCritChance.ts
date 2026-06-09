/**
 * Workshop **Super Crit Chance**: **+0.20%** per purchase, **100** purchases → **20.00%**.
 * **Cost** is marginal coins per wiki row (1…100).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL = 100 as const

const MARGINAL_COINS: readonly number[] = [
  50000, 125010, 200230, 277070, 359810, 457720, 587580, 776320, 1060000, 1510000,
  2180000, 3190000, 4650000, 6720000, 9600000, 13510000, 18730000, 25580000, 34420000, 45700000,
  59880000, 77540000, 99300000, 125850000, 157990000, 196570000, 242560000, 297010000, 361090000, 436050000,
  523280000, 624270000, 740650000, 874170000, 1030000000, 1200000000, 1400000000, 1620000000, 1870000000,
  2150000000, 2470000000, 2820000000, 3210000000, 3640000000, 4120000000, 4660000000, 5240000000, 5890000000,
  6600000000, 7370000000, 8470000000, 9420000000, 10470000000, 11600000000, 12830000000, 14170000000,
  15610000000, 17180000000, 18870000000, 20700000000, 22660000000, 24780000000, 27050000000, 29490000000,
  32110000000, 34910000000, 37910000000, 41120000000, 44550000000, 48200000000, 52090000000, 56240000000,
  60650000000, 65340000000, 70320000000, 79390000000, 85270000000, 91510000000, 98110000000, 105100000000,
  112490000000, 120290000000, 128530000000, 137220000000, 146390000000, 156050000000, 166230000000,
  176930000000, 188200000000, 200040000000, 212480000000, 225540000000, 239250000000, 253640000000,
  268720000000, 284520000000, 301070000000, 318400000000, 336530000000, 355490000000,
]

/** Chance percent (0 … 20) after `completedLevels` purchases (0 … 100). */
export function workshopSuperCritChancePercent(completedLevels: number): number {
  return workshopToolkitStatValue('Super Crit Chance', completedLevels)!
}

/** Two decimals + `%` (e.g. `0.20%`, `20.00%`). */
export function workshopSuperCritChanceStatDisplay(
  completedLevels: number,
  labPercentPoints?: number,
): string {
  let pct = workshopSuperCritChancePercent(completedLevels)
  if (labPercentPoints != null && Number.isFinite(labPercentPoints) && labPercentPoints > 0) {
    pct += labPercentPoints
  }
  return `${pct.toFixed(2)}%`
}

function marginalCoinsPurchaseEndingAt(targetLevel: number): number | undefined {
  if (targetLevel < 1 || targetLevel > WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL) return undefined
  return MARGINAL_COINS[targetLevel - 1]
}

export function workshopSuperCritChanceNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Super Crit Chance', completedLevels)
}
