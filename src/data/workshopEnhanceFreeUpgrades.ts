/**
 * Utility **Free Upgrades +**: **100** levels, +0.01x per level to x2.00.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL = 100 as const

/** Free Attack/Defense/Utility workshop rows add +0.50% per level (wiki). */
export const WORKSHOP_FREE_UPGRADE_WORKSHOP_PERCENT_STEP = 0.5 as const

export function workshopEnhanceFreeUpgradesMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Free Upgrades +', completedLevels)!
}

export function workshopEnhanceFreeUpgradesStatDisplay(completedLevels: number): string {
  return formatWorkshopEnhanceMultiplierDisplay(
    workshopEnhanceFreeUpgradesMultiplier(completedLevels),
  )
}

export function workshopEnhanceFreeUpgradesNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Free Upgrades +', completedLevels)
}

/**
 * **Free Upgrades +** additive % on each free-upgrade workshop row.
 *
 * Calibrated (enhance L10, workshop L99, Free Upgrades card +10%):
 * - Uses completed tier **L − 1** on a workshop-derived base (same pattern as **Cash Bonus +**).
 * - When relic-only ≤ submodule, also adds the current tier marginal on
 *   `workshop × workshop / (workshop + card)`.
 * - When relic-only exceeds submodule, the tier base is reduced by
 *   `excess × (submodule + 0.5) / relic-only` (0.5 = wiki workshop step).
 */
export function workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(
  enhanceFreeUpgradesLevel: number,
  workshopPercentPoints: number,
  cardPercentPoints: number,
  relicRelicPercentPoints: number,
  submodulePercentPoints: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceFreeUpgradesLevel <= 0 || workshopPercentPoints <= 0) {
    return 0
  }
  const level = Math.max(0, Math.trunc(enhanceFreeUpgradesLevel))
  if (level <= 0) return 0

  const multCompleted = workshopEnhanceFreeUpgradesMultiplier(level - 1)
  const multCurrent = workshopEnhanceFreeUpgradesMultiplier(level)
  const tierDelta = multCompleted - 1
  const marginalPerLevel = multCurrent - multCompleted

  const excessOverSubmodule = Math.max(
    0,
    relicRelicPercentPoints - submodulePercentPoints,
  )

  let tierBase = workshopPercentPoints
  if (excessOverSubmodule > 0 && relicRelicPercentPoints > 0) {
    tierBase =
      workshopPercentPoints -
      (excessOverSubmodule *
        (submodulePercentPoints + WORKSHOP_FREE_UPGRADE_WORKSHOP_PERCENT_STEP)) /
        relicRelicPercentPoints
  }

  const tierEnhance = tierDelta * Math.max(0, tierBase)

  const marginalEnhance =
    excessOverSubmodule <= 0 && marginalPerLevel > 0
      ? marginalPerLevel *
        workshopPercentPoints *
        (workshopPercentPoints /
          (workshopPercentPoints + Math.max(0, cardPercentPoints)))
      : 0

  return tierEnhance + marginalEnhance
}
