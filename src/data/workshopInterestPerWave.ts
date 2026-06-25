/**
 * Workshop **Interest / Wave** from `tables/workshop/utility/interest-wave.json` (or toolkit name
 * `Interest - Wave`). One-time unlock: **5000** coins after free upgrades.
 *
 * In-run formula (wiki): `(Current Cash + Cash/Wave × Cash Bonus) × Interest/Wave %`.
 *
 * **Workshop card display** (`Main::GetOutOfRoundInterestPerWave`, `libil2cpp.so`): workshop **%**
 * × **Cash Bonus +** enhancement (`Main.cashBonusEnhancement`) × `(1 + TechTree Interest_Per_Wave)`
 * × submodule (when equipped). Research **Interest** / **Cash / Wave** labs and the Cash / Wave lab
 * product are **not** used on this card (the old `× Interest-lab × Cash/Wave-lab` calibration was wrong).
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
export const WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL = 99 as const

/** One-time workshop unlock cost (before level purchases). */
export const WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS = 5000 as const


/** Interest per wave (percent points, e.g. 0.06 for +0.06%) after `completedLevels` purchases. */
export function workshopInterestPerWaveStatPercentPoints(completedLevels: number): number {
  return workshopToolkitStatValue('Interest - Wave', completedLevels)!
}

export function workshopInterestPerWaveStatDisplay(completedLevels: number): string {
  const pct = workshopInterestPerWaveStatPercentPoints(completedLevels)
  return `${pct.toFixed(2)}%`
}

export function workshopInterestPerWaveNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Interest - Wave', completedLevels)
}
