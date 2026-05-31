import type { WorkshopUpgradePersistedKey } from '../towerBuildStorage'

/** Full save ↔ workshop field table: `docs/game-workshop-index-map.csv` (see `scripts/export-game-workshop-index-map.ts`). */

/**
 * Game `upgradeWorkshopLevel` indices → TowerSmith attack workshop fields (20 slots in save, 16 tracked).
 * Do not use `upgradeLevel` (in-round mirror) for import.
 */
export const GAME_WORKSHOP_ATTACK_LEVEL_KEYS = [
  'damageLevel',
  'attackSpeedLevel',
  'critChanceLevel',
  'critFactorLevel',
  'attackRangeLevel',
  'damagePerMeterLevel',
  'multishotChanceLevel',
  'multishotTargetsLevel',
  'rapidFireChanceLevel',
  'rapidFireDurationLevel',
  'bounceShotChanceLevel',
  'bounceShotTargetsLevel',
  'bounceShotRangeLevel',
  'superCritChanceLevel',
  'superCritMultLevel',
  'rendArmorChanceLevel',
  'rendArmorMultLevel',
] as const satisfies readonly WorkshopUpgradePersistedKey[]

/**
 * Game `upgradeWorkshopDefenseLevel` indices → TowerSmith defense workshop fields.
 * Do not use `upgradeDefenseLevel` (in-round mirror) for import.
 */
export const GAME_WORKSHOP_DEFENSE_LEVEL_KEYS = [
  'healthLevel',
  'healthRegenLevel',
  'defensePercentLevel',
  'defenseAbsoluteLevel',
  'thornDamageLevel',
  'lifestealLevel',
  'knockbackChanceLevel',
  'knockbackForceLevel',
  'orbSpeedLevel',
  'orbsLevel',
  'shockwaveSizeLevel',
  'shockwaveFrequencyLevel',
  'landMineChanceLevel',
  'landMineDamageLevel',
  'landMineRadiusLevel',
  'deathDefyLevel',
  'wallHealthLevel',
  'wallRebuildLevel',
] as const satisfies readonly WorkshopUpgradePersistedKey[]

/**
 * Game `upgradeWorkshopUtilityLevel` indices → TowerSmith utility workshop fields.
 * Do not use `upgradeUtilityLevel` (in-round mirror) for import.
 */
export const GAME_WORKSHOP_UTILITY_LEVEL_KEYS = [
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
] as const satisfies readonly WorkshopUpgradePersistedKey[]

export const GAME_ENHANCE_ATTACK_LEVEL_KEYS = [
  'enhanceDamageLevel',
  'enhanceRendArmorLevel',
  'enhanceCritFactorLevel',
  'enhanceDamagePerMeterLevel',
  'enhanceSuperCritMultLevel',
  'enhanceAttackSpeedLevel',
] as const satisfies readonly WorkshopUpgradePersistedKey[]

export const GAME_ENHANCE_DEFENSE_LEVEL_KEYS = [
  'enhanceHealthLevel',
  'enhanceHealthRegenLevel',
  'enhanceDefenseAbsoluteLevel',
  'enhanceLandMineDamageLevel',
  'enhanceWallHealthLevel',
  'enhanceOrbSizeLevel',
] as const satisfies readonly WorkshopUpgradePersistedKey[]

export const GAME_ENHANCE_UTILITY_LEVEL_KEYS = [
  'enhanceCashBonusLevel',
  'enhanceCoinBonusLevel',
  'enhanceCellsKillBonusLevel',
  'enhanceFreeUpgradesLevel',
  'enhanceRecoveryPackageLevel',
  'enhanceEnemyLevelSkipLevel',
] as const satisfies readonly WorkshopUpgradePersistedKey[]

/** Lab.researchLevel length in current game builds. */
export const GAME_RESEARCH_LEVEL_COUNT = 250 as const
