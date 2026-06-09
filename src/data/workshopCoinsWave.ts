/**
 * Workshop **Coins / Wave** from `tables/workshop/utility/coins-wave.json`.
 * One-time unlock: **100** coins after **Coins / Kill Bonus**.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_COINS_WAVE_MAX_LEVEL = 149 as const

/** One-time workshop unlock cost (before level purchases). */
export const WORKSHOP_COINS_WAVE_UNLOCK_COINS = 100 as const

/** Coins per wave with zero workshop level purchases. */
export const WORKSHOP_COINS_WAVE_BASE_AMOUNT = 1 as const

/** Coins per wave after `completedLevels` workshop purchases (exact **1 + level**). */
export function workshopCoinsWaveStatAmount(completedLevels: number): number {
  return workshopToolkitStatValue('Coins - Wave', completedLevels)!
}

export function workshopCoinsWaveStatDisplay(completedLevels: number): string {
  return String(workshopCoinsWaveStatAmount(completedLevels))
}


export function workshopCoinsWaveNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Coins - Wave', completedLevels)
}
