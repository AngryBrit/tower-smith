/**
 * Utility **Free Upgrades +**: **100** levels, +0.01x per level to x2.00.
 */

import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'
import { formatWorkshopEnhanceMultiplierDisplay } from './workshopEnhanceTier400Ladder'

export const WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL = 100 as const

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
 * **Free Upgrades +** multiplier (`allFreeUpgradesEnhancement`) for the free-upgrade workshop rows.
 * Uses the current level (×1.00 when locked or level 0). See
 * {@link workshopFreeUpgradeDisplayPercentPoints} for the full card formula.
 */
export function workshopFreeUpgradesEnhancementMultiplier(
  enhanceFreeUpgradesLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  if (!enhancementsLabUnlocked || enhanceFreeUpgradesLevel <= 0) return 1
  const level = Math.max(0, Math.trunc(enhanceFreeUpgradesLevel))
  if (level <= 0) return 1
  return workshopEnhanceFreeUpgradesMultiplier(level)
}

/**
 * Final displayed **Free * Upgrade** chance (% points) for a workshop row.
 *
 * Verified against `libil2cpp.so` (`Main::GetOutOfRoundFree{Attack,Defense,Utility}UpgradeChance`):
 *
 *   (workshop% + card + submodule) × allFreeUpgradesEnhancement × (1 + Σrelic%)
 *
 * The enhancement multiplies the **workshop + card + submodule** base (not just workshop), and the
 * owned free-upgrade relics apply as a **multiplier** `(1 + Σrelic%)`, not flat points. The in-run
 * perk/trade-off factor is 1 out of round.
 *
 * Calibrated: workshop **49.5** + card **10** + submodule **6** = 65.5 × **x1.13** (Free Upgrades+ L13)
 * = 74.015 → ×1.08 (relic 8%) = **79.94%** (attack), ×1.09 (relic 9%) = **80.68%** (utility).
 */
export function workshopFreeUpgradeDisplayPercentPoints(
  workshopPercentPoints: number,
  cardPercentPoints: number,
  relicRelicPercentPoints: number,
  submodulePercentPoints: number,
  enhanceFreeUpgradesLevel: number,
  enhancementsLabUnlocked: boolean,
): number {
  const mult = workshopFreeUpgradesEnhancementMultiplier(
    enhanceFreeUpgradesLevel,
    enhancementsLabUnlocked,
  )
  const base = (workshopPercentPoints + cardPercentPoints + submodulePercentPoints) * mult
  return base * (1 + Math.max(0, relicRelicPercentPoints) / 100)
}

