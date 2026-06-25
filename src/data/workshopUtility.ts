/**
 * Workshop **utility** upgrades: coin rows through **Coins / Wave** use dedicated wiki ladders;
 * other coin rows reuse the damage workshop curve until per-stat tables exist. **Value** lines reuse
 * lab calculator helpers from `types/research.ts` where the utility lab matches; **Free * Upgrade** rows
 * use interim % placeholders (no matching lab export here).
 */

import {
  WORKSHOP_CASH_BONUS_MAX_LEVEL,
  workshopCashBonusStatDisplay,
} from './workshopCashBonus'
import {
  WORKSHOP_CASH_PER_WAVE_MAX_LEVEL,
  workshopCashPerWaveStatDisplay,
} from './workshopCashPerWave'
import {
  WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL,
  workshopCoinsKillBonusStatDisplay,
} from './workshopCoinsKillBonus'
import {
  WORKSHOP_COINS_WAVE_MAX_LEVEL,
  workshopCoinsWaveStatDisplay,
} from './workshopCoinsWave'
import { workshopUtilityFormulaStatDisplay } from './workshopFormulaContext'
import {
  WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL,
  workshopFreeAttackUpgradeStatDisplay,
} from './workshopFreeAttackUpgrade'
import {
  WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL,
  workshopFreeDefenseUpgradeStatDisplay,
} from './workshopFreeDefenseUpgrade'
import {
  WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL,
  workshopFreeUtilityUpgradeStatDisplay,
} from './workshopFreeUtilityUpgrade'
import {
  WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL,
  workshopInterestPerWaveStatDisplay,
} from './workshopInterestPerWave'
import {
  WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL,
  workshopRecoveryAmountStatDisplay,
} from './workshopRecoveryAmount'
import {
  WORKSHOP_MAX_RECOVERY_MAX_LEVEL,
  workshopMaxRecoveryStatDisplay,
} from './workshopMaxRecovery'
import {
  WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL,
  workshopPackageChanceStatDisplay,
} from './workshopPackageChance'
export { WORKSHOP_RECOVERY_UNLOCK_COINS } from './workshopRecoveryShared'
export { WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS } from './workshopEnemyLevelSkipShared'
import {
  WORKSHOP_ENEMY_ATTACK_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyAttackLevelSkipStatDisplay,
} from './workshopEnemyAttackLevelSkip'
import {
  WORKSHOP_ENEMY_HEALTH_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyHealthLevelSkipStatDisplay,
} from './workshopEnemyHealthLevelSkip'
import type { WorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { WORKSHOP_UTILITY_GOD_NAMES, workshopToolkitMarginalCoins } from '../workshopCosts'

export type { WorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'

export type WorkshopUtilityUpgradeKey =
  | 'cashBonusLevel'
  | 'cashPerWaveLevel'
  | 'coinsKillBonusLevel'
  | 'coinsWaveLevel'
  | 'freeAttackUpgradeLevel'
  | 'freeDefenseUpgradeLevel'
  | 'freeUtilityUpgradeLevel'
  | 'interestPerWaveLevel'
  | 'recoveryAmountLevel'
  | 'maxRecoveryLevel'
  | 'packageChanceLevel'
  | 'enemyAttackLevelSkipLevel'
  | 'enemyHealthLevelSkipLevel'

export const WORKSHOP_UTILITY_UPGRADE_ORDER: readonly WorkshopUtilityUpgradeKey[] = [
  'cashBonusLevel',
  'cashPerWaveLevel',
  'coinsKillBonusLevel',
  'coinsWaveLevel',
  'freeAttackUpgradeLevel',
  'freeDefenseUpgradeLevel',
  'freeUtilityUpgradeLevel',
  'interestPerWaveLevel',
  'recoveryAmountLevel',
  'maxRecoveryLevel',
  'packageChanceLevel',
  'enemyAttackLevelSkipLevel',
  'enemyHealthLevelSkipLevel',
]

function cap(level: number, max: number): number {
  if (!Number.isFinite(level)) return 0
  return Math.min(Math.max(0, Math.trunc(level)), max)
}

export function workshopUtilityMaxLevel(key: WorkshopUtilityUpgradeKey): number {
  switch (key) {
    case 'cashBonusLevel':
      return WORKSHOP_CASH_BONUS_MAX_LEVEL
    case 'cashPerWaveLevel':
      return WORKSHOP_CASH_PER_WAVE_MAX_LEVEL
    case 'coinsKillBonusLevel':
      return WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL
    case 'coinsWaveLevel':
      return WORKSHOP_COINS_WAVE_MAX_LEVEL
    case 'interestPerWaveLevel':
      return WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL
    case 'freeAttackUpgradeLevel':
      return WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL
    case 'freeDefenseUpgradeLevel':
      return WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL
    case 'freeUtilityUpgradeLevel':
      return WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL
    case 'recoveryAmountLevel':
      return WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL
    case 'maxRecoveryLevel':
      return WORKSHOP_MAX_RECOVERY_MAX_LEVEL
    case 'packageChanceLevel':
      return WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL
    case 'enemyAttackLevelSkipLevel':
      return WORKSHOP_ENEMY_ATTACK_LEVEL_SKIP_MAX_LEVEL
    case 'enemyHealthLevelSkipLevel':
      return WORKSHOP_ENEMY_HEALTH_LEVEL_SKIP_MAX_LEVEL
  }
}

export function workshopUtilityClampLevel(key: WorkshopUtilityUpgradeKey, n: number): number {
  return cap(n, workshopUtilityMaxLevel(key))
}

function utilityFormulaDisplay(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  fallback: () => string,
): string {
  return workshopUtilityFormulaStatDisplay(key, completedLevels, opts) ?? fallback()
}

export function workshopUtilityStatDisplay(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
  opts?: WorkshopUtilityLabDisplayOpts,
): string {
  switch (key) {
    case 'cashBonusLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopCashBonusStatDisplay(completedLevels),
      )
    case 'cashPerWaveLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopCashPerWaveStatDisplay(completedLevels),
      )
    case 'coinsKillBonusLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopCoinsKillBonusStatDisplay(completedLevels),
      )
    case 'coinsWaveLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopCoinsWaveStatDisplay(completedLevels),
      )
    case 'interestPerWaveLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopInterestPerWaveStatDisplay(completedLevels),
      )
    case 'freeAttackUpgradeLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopFreeAttackUpgradeStatDisplay(completedLevels),
      )
    case 'freeDefenseUpgradeLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopFreeDefenseUpgradeStatDisplay(completedLevels),
      )
    case 'freeUtilityUpgradeLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopFreeUtilityUpgradeStatDisplay(completedLevels),
      )
    case 'recoveryAmountLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopRecoveryAmountStatDisplay(completedLevels),
      )
    case 'maxRecoveryLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopMaxRecoveryStatDisplay(completedLevels),
      )
    case 'packageChanceLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopPackageChanceStatDisplay(completedLevels),
      )
    case 'enemyAttackLevelSkipLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopEnemyAttackLevelSkipStatDisplay(completedLevels),
      )
    case 'enemyHealthLevelSkipLevel':
      return utilityFormulaDisplay(key, completedLevels, opts, () =>
        workshopEnemyHealthLevelSkipStatDisplay(completedLevels),
      )
  }
}

export function workshopUtilityNextMarginalCoins(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins(WORKSHOP_UTILITY_GOD_NAMES[key], completedLevels)
}
