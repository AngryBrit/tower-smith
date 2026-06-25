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
import { workshopFreeUpgradeDisplayPercentPoints } from './workshopEnhanceFreeUpgrades'
import {
  WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL,
  workshopFreeAttackUpgradeStatDisplay,
  workshopFreeAttackUpgradeStatPercentPoints,
} from './workshopFreeAttackUpgrade'
import {
  WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL,
  workshopFreeDefenseUpgradeStatDisplay,
  workshopFreeDefenseUpgradeStatPercentPoints,
} from './workshopFreeDefenseUpgrade'
import {
  WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL,
  workshopFreeUtilityUpgradeStatDisplay,
  workshopFreeUtilityUpgradeStatPercentPoints,
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
import {
  formatPercentAfterLabAddition,
  formatPercentAfterLabAdditionAndMultiplier,
  formatWithDamageStyleLabMultiplier,
} from './workshopLabDisplayHelpers'
import type { WorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import type { WorkshopUtilitySubmoduleExtras } from './workshopSubmoduleBonuses'
import { WORKSHOP_UTILITY_GOD_NAMES, workshopToolkitMarginalCoins } from '../workshopCosts'
import { workshopCashBonusStatMultiplier } from './workshopCashBonus'
import { workshopCashPerWaveStatAmount } from './workshopCashPerWave'
import { workshopCoinsKillBonusStatMultiplier } from './workshopCoinsKillBonus'
import { workshopCoinsWaveStatAmount } from './workshopCoinsWave'
import { workshopEnemyAttackLevelSkipStatPercent } from './workshopEnemyAttackLevelSkip'
import { workshopEnemyHealthLevelSkipStatPercent } from './workshopEnemyHealthLevelSkip'
import { workshopInterestPerWaveStatPercentPoints } from './workshopInterestPerWave'
import { workshopMaxRecoveryStatMultiplier } from './workshopMaxRecovery'
import { workshopPackageChanceStatPercent } from './workshopPackageChance'
import { workshopRecoveryAmountStatPercent } from './workshopRecoveryAmount'

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

function utilitySub(opts: WorkshopUtilityLabDisplayOpts | undefined): WorkshopUtilitySubmoduleExtras {
  return opts?.submodule ?? {}
}

/** Returns `displayValue − workshop` so callers can format `workshop + extra` → final value. */
function freeUpgradeDisplayExtraPercentPoints(
  workshopPercentPoints: number,
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  relicRelicPercentPoints: number,
  submodulePercentPoints: number,
): number {
  const card = opts?.freeUpgradesCardPercentPoints ?? 0
  const value = workshopFreeUpgradeDisplayPercentPoints(
    workshopPercentPoints,
    card,
    relicRelicPercentPoints,
    submodulePercentPoints,
    opts?.enhanceFreeUpgradesLevel ?? 0,
    opts?.workshopEnhancementsLabUnlocked ?? false,
  )
  return value - workshopPercentPoints
}

export function workshopUtilityStatDisplay(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
  opts?: WorkshopUtilityLabDisplayOpts,
): string {
  switch (key) {
    case 'cashBonusLevel': {
      const base = workshopCashBonusStatMultiplier(completedLevels)
      const m = opts?.cashBonusLabMultiplier
      const enhanceMult = opts?.cashBonusEnhanceMultiplier ?? 1
      const hasLab = m !== undefined && Number.isFinite(m) && m > 1 + 1e-9
      if (hasLab || enhanceMult > 1 + 1e-9) {
        return `x${(base * (m ?? 1) * enhanceMult).toFixed(2)}`
      }
      return workshopCashBonusStatDisplay(completedLevels)
    }
    case 'cashPerWaveLevel': {
      const sub = utilitySub(opts).cashPerWaveAdd ?? 0
      const base = workshopCashPerWaveStatAmount(completedLevels) + sub
      const m = opts?.cashPerWaveLabMultiplier
      if ((m !== undefined && Number.isFinite(m) && m > 1 + 1e-9) || sub > 0) {
        return formatWithDamageStyleLabMultiplier(
          base,
          m ?? 1,
          (v) => String(Math.round(v)),
        )
      }
      return workshopCashPerWaveStatDisplay(completedLevels)
    }
    case 'coinsKillBonusLevel': {
      const lab = opts?.coinsKillBonusLabMultiplier ?? 1
      const enhanceMult = opts?.coinsKillBonusEnhanceMultiplier ?? 1
      const m = lab * enhanceMult
      if (m > 1 + 1e-9) {
        return formatWithDamageStyleLabMultiplier(
          workshopCoinsKillBonusStatMultiplier(completedLevels),
          m,
          (v) => `x${v.toFixed(2)}`,
        )
      }
      return workshopCoinsKillBonusStatDisplay(completedLevels)
    }
    case 'coinsWaveLevel': {
      const sub = utilitySub(opts).coinsWaveAdd ?? 0
      const base = workshopCoinsWaveStatAmount(completedLevels) + sub
      const m = opts?.coinsWaveLabMultiplier
      if ((m !== undefined && Number.isFinite(m) && m > 1 + 1e-9) || sub > 0) {
        return formatWithDamageStyleLabMultiplier(
          base,
          m ?? 1,
          (v) => String(Math.round(v)),
        )
      }
      return workshopCoinsWaveStatDisplay(completedLevels)
    }
    case 'interestPerWaveLevel': {
      const base = workshopInterestPerWaveStatPercentPoints(completedLevels)
      const enhanceMult = opts?.cashBonusEnhanceMultiplier ?? 1
      if (enhanceMult > 1 + 1e-9) {
        return `${(base * enhanceMult).toFixed(2)}%`
      }
      return workshopInterestPerWaveStatDisplay(completedLevels)
    }
    case 'freeAttackUpgradeLevel': {
      const workshop = workshopFreeAttackUpgradeStatPercentPoints(completedLevels)
      const sub = utilitySub(opts).freeAttackUpgradePercentPoints ?? 0
      const extra = freeUpgradeDisplayExtraPercentPoints(
        workshop,
        opts,
        opts?.freeAttackUpgradeRelicPercentPoints ?? 0,
        sub,
      )
      if (extra > 0) {
        return formatPercentAfterLabAddition(workshop, extra)
      }
      return workshopFreeAttackUpgradeStatDisplay(completedLevels)
    }
    case 'freeDefenseUpgradeLevel': {
      const workshop = workshopFreeDefenseUpgradeStatPercentPoints(completedLevels)
      const sub = utilitySub(opts).freeDefenseUpgradePercentPoints ?? 0
      const extra = freeUpgradeDisplayExtraPercentPoints(
        workshop,
        opts,
        opts?.freeDefenseUpgradeRelicPercentPoints ?? 0,
        sub,
      )
      if (extra > 0) {
        return formatPercentAfterLabAddition(workshop, extra)
      }
      return workshopFreeDefenseUpgradeStatDisplay(completedLevels)
    }
    case 'freeUtilityUpgradeLevel': {
      const workshop = workshopFreeUtilityUpgradeStatPercentPoints(completedLevels)
      const sub = utilitySub(opts).freeUtilityUpgradePercentPoints ?? 0
      const extra = freeUpgradeDisplayExtraPercentPoints(
        workshop,
        opts,
        opts?.freeUtilityUpgradeRelicPercentPoints ?? 0,
        sub,
      )
      if (extra > 0) {
        return formatPercentAfterLabAddition(workshop, extra)
      }
      return workshopFreeUtilityUpgradeStatDisplay(completedLevels)
    }
    case 'recoveryAmountLevel': {
      const base = workshopRecoveryAmountStatPercent(completedLevels)
      const labPts = opts?.recoveryAmountLabPercentPoints ?? 0
      const enhance = opts?.recoveryAmountEnhancementsMultiplier ?? 1
      if (labPts > 0 || enhance > 1 + 1e-9) {
        return formatPercentAfterLabAdditionAndMultiplier(base, labPts, enhance)
      }
      return workshopRecoveryAmountStatDisplay(completedLevels)
    }
    case 'maxRecoveryLevel': {
      const sub = utilitySub(opts).maxRecoveryAdd ?? 0
      const base = workshopMaxRecoveryStatMultiplier(completedLevels) + sub
      const labMult = opts?.maxRecoveryLabMultiplier ?? 1
      const enhanceMult = opts?.maxRecoveryEnhancementsMultiplier ?? 1
      const combined = labMult * enhanceMult
      if (combined > 1 + 1e-9 || sub > 0) {
        return formatWithDamageStyleLabMultiplier(base, combined, (v) => `x${v.toFixed(2)}`)
      }
      return workshopMaxRecoveryStatDisplay(completedLevels)
    }
    case 'packageChanceLevel': {
      const lab = opts?.packageChanceLabPercentPoints ?? 0
      const card = opts?.packageChanceCardPercentPoints ?? 0
      if (lab > 0 || card > 0) {
        return formatPercentAfterLabAddition(
          workshopPackageChanceStatPercent(completedLevels),
          lab + card,
        )
      }
      return workshopPackageChanceStatDisplay(completedLevels)
    }
    case 'enemyAttackLevelSkipLevel': {
      const lab = opts?.enemyAttackLevelSkipLabPercentPoints
      if (lab !== undefined && Number.isFinite(lab) && lab > 0) {
        return formatPercentAfterLabAddition(
          workshopEnemyAttackLevelSkipStatPercent(completedLevels),
          lab,
        )
      }
      return workshopEnemyAttackLevelSkipStatDisplay(completedLevels)
    }
    case 'enemyHealthLevelSkipLevel': {
      const lab = opts?.enemyHealthLevelSkipLabPercentPoints
      if (lab !== undefined && Number.isFinite(lab) && lab > 0) {
        return formatPercentAfterLabAddition(
          workshopEnemyHealthLevelSkipStatPercent(completedLevels),
          lab,
        )
      }
      return workshopEnemyHealthLevelSkipStatDisplay(completedLevels)
    }
  }
}

export function workshopUtilityNextMarginalCoins(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins(WORKSHOP_UTILITY_GOD_NAMES[key], completedLevels)
}
