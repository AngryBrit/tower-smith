/**
 * Utility **Coin Bonus +** / **Cells/Kill Bonus**: **200** levels, +0.01x per level to x3.00.
 * Per-level marginal **Coins** from wiki (decade anchors in `workshopEnhanceUtilityTier200WikiDecades.ts`).
 */

import { workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL = 200 as const

const MARGINAL_COINS: readonly number[] = [
  5e9, 6.25e9, 12.46e9, 27.42e9, 54.5e9, 96.85e9, 157.45e9, 239.17e9,
  344.79e9, 477.01e9, 638.46e9, 831.7e9, 1.06e12, 1.32e12, 1.63e12, 1.97e12,
  2.36e12, 5.59e12, 9.84e12, 15.26e12, 22.02e12, 30.29e12, 40.24e12, 52.08e12,
  65.99e12, 82.19e12, 100.89e12, 122.32e12, 146.71e12, 174.29e12, 205.32e12, 288.06e12,
  390.25e12, 514.7e12, 664.46e12, 842.82e12, 1050e12, 1300e12, 1590e12, 1920e12,
  2300e12, 2730e12, 3220e12, 3780e12, 4410e12, 5110e12, 5900e12, 6770e12,
  7740e12, 8820e12, 10010e12, 13010e12, 16580e12, 20770e12, 25670e12, 31360e12,
  37930e12, 45470e12, 54090e12, 63900e12, 75020e12, 87570e12, 101690e12, 117520e12,
  135220e12, 154950e12, 176870e12, 201180e12, 228070e12, 257740e12, 290410e12, 326300e12,
  365650e12, 408720e12, 455770e12, 507080e12, 562940e12, 623660e12, 689550e12, 760970e12,
  838250e12, 921760e12, 1010e15, 1110000e12, 1210e15, 1330e15, 1450e15, 1580e15,
  1720e15, 1860e15, 2020e15, 2190e15, 2370e15, 2570e15, 2770e15, 2990e15,
  3230e15, 3480e15, 3740e15, 4020000e12, 4310000e12, 4630e15, 4960e15, 5310e15,
  5690e15, 6080e15, 6490e15, 6930e15, 7400e15, 7880e15, 8400e15, 8940e15,
  9510e15, 10100e15, 10730e15, 11390e15, 12090e15, 12820e15, 13580e15, 14380e15,
  15220e15, 16100000e12, 17020e15, 17980e15, 18990e15, 20040e15, 21140e15, 22290e15,
  23490e15, 24750e15, 26060e15, 27420e15, 28850e15, 30330e15, 31880e15, 33490e15,
  35160000e12, 36910e15, 38720e15, 40610e15, 42580e15, 44620e15, 46740e15, 48950e15,
  51240e15, 53610e15, 56080e15, 58640e15, 61300e15, 64050e15, 66910e15, 69870000e12,
  72930000e12, 76110e15, 79400e15, 82810e15, 86330e15, 89980e15, 93760e15, 97660e15,
  101700e15, 105870e15, 110190e15, 114650e15, 119260e15, 124020e15, 128930e15, 134010000e12,
  139240000e12, 144650e15, 150230e15, 155980e15, 161920e15, 168040e15, 174350e15, 180850e15,
  187560e15, 194460e15, 201580e15, 208910e15, 216460e15, 224230e15, 232230e15, 240470e15,
  248940e15, 257660000e12, 266630e15, 275860e15, 285350000e12, 295110e15, 305140e15, 315450e15,
  326040e15, 336930e15, 348120e15, 359620e15, 371420e15, 383540e15, 395990e15, 408770e15,
]

export function workshopEnhanceUtilityTier200Multiplier(
  completedLevels: number,
  godName: string,
): number {
  return workshopToolkitStatValue(godName, completedLevels)!
}

export function workshopEnhanceUtilityTier200StatDisplay(
  completedLevels: number,
  godName: string,
): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceUtilityTier200Multiplier(completedLevels, godName),
  )
}

export function workshopEnhanceUtilityTier200NextMarginalCoins(
  completedLevels: number,
): number | undefined {
  if (completedLevels < 0 || completedLevels >= WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL) {
    return undefined
  }
  return MARGINAL_COINS[completedLevels]
}
