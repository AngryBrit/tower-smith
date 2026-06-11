import type { WorkshopUtilityUpgradeKey } from '../data/workshopUtility'
import type { WorkshopEpUpgradeKey } from './workshopSheetNames'

/** Utility rows that require a one-time coin unlock before leveling. */
const UTILITY_UNLOCK_GATED = new Set<WorkshopUtilityUpgradeKey>([
  'coinsKillBonusLevel',
  'coinsWaveLevel',
  'interestPerWaveLevel',
  'recoveryAmountLevel',
  'maxRecoveryLevel',
  'enemyAttackLevelSkipLevel',
  'enemyHealthLevelSkipLevel',
])

/**
 * EP Master Sheet basics (rows 3–6 attack, 20–21 defense) — always unlocked in-game.
 * Sync farming level (D) only; never write TRUE/FALSE to column B.
 */
const WORKSHOP_EP_SKIP_UNLOCK_COLUMN = new Set<WorkshopEpUpgradeKey>([
  'damageLevel',
  'attackSpeedLevel',
  'critChanceLevel',
  'critFactorLevel',
  'healthLevel',
  'healthRegenLevel',
])

/** Whether Effective Paths export should write column B for this upgrade. */
export function workshopUpgradeWritesUnlockColumn(key: WorkshopEpUpgradeKey): boolean {
  return !WORKSHOP_EP_SKIP_UNLOCK_COLUMN.has(key)
}

/** Whether column B (workshop unlocked) should be TRUE for Effective Paths sync. */
export function workshopUpgradeUnlockedForEp(key: WorkshopEpUpgradeKey, level: number): boolean {
  if (UTILITY_UNLOCK_GATED.has(key as WorkshopUtilityUpgradeKey)) {
    return level > 0
  }
  return true
}
