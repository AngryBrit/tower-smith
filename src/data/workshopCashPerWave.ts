/** Workshop **Cash / Wave** from `tables/workshop/utility/cash-wave.json`. */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_CASH_PER_WAVE_MAX_LEVEL = 149 as const

/** Cash per wave at each anchor level (wiki **Value**). */
/** Cash per wave after `completedLevels` workshop purchases (0 before any purchase). */
export function workshopCashPerWaveStatAmount(completedLevels: number): number {
  return workshopToolkitStatValue('Cash - Wave', completedLevels)!
}

export function workshopCashPerWaveStatDisplay(completedLevels: number): string {
  return String(workshopCashPerWaveStatAmount(completedLevels))
}


export function workshopCashPerWaveNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Cash - Wave', completedLevels)
}
