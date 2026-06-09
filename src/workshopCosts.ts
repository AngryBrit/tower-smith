/**
 * Workshop upgrade coins and stat values from `tables/workshop/` GOD JSON
 * (see {@link getWorkshopGodTables}). Lab/relic/submodule display overlays stay in `src/data/workshop*.ts`.
 */

import {
  getWorkshopGodTables,
  getWorkshopGodUpgradeNames,
  workshopGodLevelEntry,
  workshopGodMarginalCoins,
} from './data/workshopGodTables'
import type { WorkshopDefenseUpgradeKey } from './data/workshopDefense'
import type { WorkshopEnhanceAttackUpgradeKey } from './data/workshopEnhanceAttack'
import type { WorkshopEnhanceDefenseUpgradeKey } from './data/workshopEnhanceDefense'
import type { WorkshopEnhanceUtilityUpgradeKey } from './data/workshopEnhanceUtility'
import type { WorkshopUtilityUpgradeKey } from './data/workshopUtility'

/** Calculator export name → GOD table key aliases. */
export const WORKSHOP_GOD_NAME_ALIASES: Record<string, string> = {
  'Cash / Wave': 'Cash - Wave',
  'Coins / Kill Bonus': 'Coins - Kill Bonus',
  'Coins / Wave': 'Coins - Wave',
  'Defense %': 'Defense Percent',
  'Damage / Meter': 'Damage - Meter',
  'Interest / Wave': 'Interest - Wave',
  'Thorn Damage': 'Thorns',
}

export const WORKSHOP_DEFENSE_GOD_NAMES: Record<WorkshopDefenseUpgradeKey, string> = {
  healthLevel: 'Health',
  healthRegenLevel: 'Health Regen',
  defensePercentLevel: 'Defense Percent',
  defenseAbsoluteLevel: 'Defense Absolute',
  thornDamageLevel: 'Thorns',
  lifestealLevel: 'Lifesteal',
  knockbackChanceLevel: 'Knockback Chance',
  knockbackForceLevel: 'Knockback Force',
  orbSpeedLevel: 'Orb Speed',
  orbsLevel: 'Orbs',
  shockwaveSizeLevel: 'Shockwave Size',
  shockwaveFrequencyLevel: 'Shockwave Frequency',
  landMineChanceLevel: 'Land Mine Chance',
  landMineDamageLevel: 'Land Mine Damage',
  landMineRadiusLevel: 'Land Mine Radius',
  deathDefyLevel: 'Death Defy',
  wallHealthLevel: 'Wall Health',
  wallRebuildLevel: 'Wall Rebuild',
}

export const WORKSHOP_UTILITY_GOD_NAMES: Record<WorkshopUtilityUpgradeKey, string> = {
  cashBonusLevel: 'Cash Bonus',
  cashPerWaveLevel: 'Cash - Wave',
  coinsKillBonusLevel: 'Coins - Kill Bonus',
  coinsWaveLevel: 'Coins - Wave',
  freeAttackUpgradeLevel: 'Free Attack Upgrade',
  freeDefenseUpgradeLevel: 'Free Defense Upgrade',
  freeUtilityUpgradeLevel: 'Free Utility Upgrade',
  interestPerWaveLevel: 'Interest - Wave',
  recoveryAmountLevel: 'Recovery Amount',
  maxRecoveryLevel: 'Max Recovery',
  packageChanceLevel: 'Package Chance',
  enemyAttackLevelSkipLevel: 'Enemy Attack Level Skip',
  enemyHealthLevelSkipLevel: 'Enemy Health Level Skip',
}

export const WORKSHOP_ENHANCE_ATTACK_GOD_NAMES: Record<WorkshopEnhanceAttackUpgradeKey, string> = {
  enhanceDamageLevel: 'Damage +',
  enhanceRendArmorLevel: 'Rend Armor Max',
  enhanceCritFactorLevel: 'Critical Factor +',
  enhanceDamagePerMeterLevel: 'Damage - Meter +',
  enhanceSuperCritMultLevel: 'Super Crit Mult +',
  enhanceAttackSpeedLevel: 'Attack Speed +',
}

export const WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES: Record<WorkshopEnhanceDefenseUpgradeKey, string> = {
  enhanceHealthLevel: 'Health +',
  enhanceHealthRegenLevel: 'Health Regen +',
  enhanceDefenseAbsoluteLevel: 'Defense Absolute +',
  enhanceLandMineDamageLevel: 'Land Mine Damage +',
  enhanceWallHealthLevel: 'Wall Health +',
  enhanceOrbSizeLevel: 'Orb Size',
}

export const WORKSHOP_ENHANCE_UTILITY_GOD_NAMES: Record<WorkshopEnhanceUtilityUpgradeKey, string> = {
  enhanceCashBonusLevel: 'Cash Bonus +',
  enhanceCoinBonusLevel: 'Coin Bonus +',
  enhanceCellsKillBonusLevel: 'Cells - Kill Bonus',
  enhanceFreeUpgradesLevel: 'Free Upgrades +',
  enhanceRecoveryPackageLevel: 'Recovery Package +',
  enhanceEnemyLevelSkipLevel: 'Enemy Level Skip +',
}

function resolveGodTableName(upgradeDisplayName: string): string {
  const trimmed = upgradeDisplayName.trim()
  return WORKSHOP_GOD_NAME_ALIASES[trimmed] ?? trimmed
}

/** Max workshop level for a GOD table, if present. */
export function workshopGodTableMaxLevel(upgradeDisplayName: string): number | undefined {
  const name = resolveGodTableName(upgradeDisplayName)
  return getWorkshopGodTables()[name]?.maxLevel
}

/**
 * Coins for the next purchase when `completedLevels` upgrades are done.
 * `undefined` when maxed, out of range, or no GOD table.
 */
export function workshopToolkitMarginalCoins(
  upgradeDisplayName: string,
  completedLevels: number,
): number | undefined {
  const name = resolveGodTableName(upgradeDisplayName)
  const max = workshopGodTableMaxLevel(name)
  if (max === undefined) return undefined
  if (completedLevels < 0 || completedLevels >= max) return undefined
  return workshopGodMarginalCoins(name, completedLevels + 1)
}

export function workshopHasGodTable(upgradeDisplayName: string): boolean {
  return getWorkshopGodUpgradeNames().has(resolveGodTableName(upgradeDisplayName))
}

/**
 * Stat **Value** at workshop level `completedLevels` (GOD row `level === completedLevels`).
 * Returns `undefined` when no table/row or value is null/maxed.
 */
export function workshopToolkitStatValue(
  upgradeDisplayName: string,
  completedLevels: number,
): number | undefined {
  const name = resolveGodTableName(upgradeDisplayName)
  const table = getWorkshopGodTables()[name]
  if (!table) return undefined
  const L = Math.min(Math.max(0, Math.trunc(completedLevels)), table.maxLevel)
  const row = workshopGodLevelEntry(name, L)
  const value = row?.value
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}
