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

/** Whether column B (workshop unlocked) should be TRUE for Effective Paths sync. */
export function workshopUpgradeUnlockedForEp(key: WorkshopEpUpgradeKey, level: number): boolean {
  if (UTILITY_UNLOCK_GATED.has(key as WorkshopUtilityUpgradeKey)) {
    return level > 0
  }
  return true
}
