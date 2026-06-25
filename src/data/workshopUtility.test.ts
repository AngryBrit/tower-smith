import { describe, expect, it } from 'vitest'
import { WORKSHOP_CASH_BONUS_MAX_LEVEL, workshopCashBonusNextMarginalCoins } from './workshopCashBonus'
import { WORKSHOP_CASH_PER_WAVE_MAX_LEVEL, workshopCashPerWaveNextMarginalCoins } from './workshopCashPerWave'
import {
  WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL,
  WORKSHOP_COINS_KILL_BONUS_UNLOCK_COINS,
  workshopCoinsKillBonusNextMarginalCoins,
} from './workshopCoinsKillBonus'
import {
  WORKSHOP_COINS_WAVE_MAX_LEVEL,
  WORKSHOP_COINS_WAVE_UNLOCK_COINS,
  workshopCoinsWaveNextMarginalCoins,
} from './workshopCoinsWave'
import {
  WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL,
  workshopFreeAttackUpgradeNextMarginalCoins,
} from './workshopFreeAttackUpgrade'
import {
  WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL,
  workshopFreeDefenseUpgradeNextMarginalCoins,
} from './workshopFreeDefenseUpgrade'
import {
  WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL,
  workshopFreeUtilityUpgradeNextMarginalCoins,
} from './workshopFreeUtilityUpgrade'
import {
  WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL,
  WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS,
  workshopInterestPerWaveNextMarginalCoins,
} from './workshopInterestPerWave'
import {
  WORKSHOP_MAX_RECOVERY_MAX_LEVEL,
  workshopMaxRecoveryNextMarginalCoins,
} from './workshopMaxRecovery'
import {
  WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL,
  workshopPackageChanceNextMarginalCoins,
} from './workshopPackageChance'
import {
  WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL,
  workshopRecoveryAmountNextMarginalCoins,
  workshopDisplayedRecoveryAmountEnhancementMultiplier,
} from './workshopRecoveryAmount'
import {
  WORKSHOP_ENEMY_ATTACK_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyAttackLevelSkipNextMarginalCoins,
} from './workshopEnemyAttackLevelSkip'
import { WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS } from './workshopEnemyLevelSkipShared'
import {
  WORKSHOP_ENEMY_HEALTH_LEVEL_SKIP_MAX_LEVEL,
  workshopEnemyHealthLevelSkipNextMarginalCoins,
} from './workshopEnemyHealthLevelSkip'
import { WORKSHOP_RECOVERY_UNLOCK_COINS } from './workshopRecoveryShared'
import {
  workshopUtilityMaxLevel,
  workshopUtilityNextMarginalCoins,
  workshopUtilityStatDisplay,
} from './workshopUtility'

describe('workshopUtility', () => {
  it('Cash Bonus uses workshop wiki ladder (149 levels)', () => {
    expect(workshopUtilityMaxLevel('cashBonusLevel')).toBe(WORKSHOP_CASH_BONUS_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('cashBonusLevel', 0)).toBe(30)
    expect(workshopUtilityNextMarginalCoins('cashBonusLevel', 148)).toBe(352_360)
    expect(workshopUtilityNextMarginalCoins('cashBonusLevel', 148)).toBe(
      workshopCashBonusNextMarginalCoins(148),
    )
    expect(workshopUtilityStatDisplay('cashBonusLevel', 0)).toBe('x1.00')
    expect(workshopUtilityStatDisplay('cashBonusLevel', 1)).toBe('x1.01')
    expect(workshopUtilityStatDisplay('cashBonusLevel', 149)).toBe('x2.49')
  })

  it('applies Cash Bonus + enhancement multiplicatively on the workshop card', () => {
    // workshop x2.49 (L149) × lab+relics x1.925 (1.54 × 1.25) × Cash Bonus+ x1.40 → x6.71.
    expect(
      workshopUtilityStatDisplay('cashBonusLevel', 149, {
        cashBonusLabMultiplier: 1.925,
        cashBonusEnhanceMultiplier: 1.4,
      }),
    ).toBe('x6.71')
    expect(workshopUtilityNextMarginalCoins('cashBonusLevel', 149)).toBeUndefined()
  })

  it('Cash / Wave uses workshop wiki ladder (149 levels)', () => {
    expect(workshopUtilityMaxLevel('cashPerWaveLevel')).toBe(WORKSHOP_CASH_PER_WAVE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('cashPerWaveLevel', 0)).toBe(30)
    expect(workshopUtilityNextMarginalCoins('cashPerWaveLevel', 148)).toBe(352_360)
    expect(workshopUtilityNextMarginalCoins('cashPerWaveLevel', 148)).toBe(
      workshopCashPerWaveNextMarginalCoins(148),
    )
    expect(workshopUtilityStatDisplay('cashPerWaveLevel', 0)).toBe('0')
    expect(workshopUtilityStatDisplay('cashPerWaveLevel', 1)).toBe('4')
    expect(workshopUtilityStatDisplay('cashPerWaveLevel', 149)).toBe('596')
    expect(workshopUtilityNextMarginalCoins('cashPerWaveLevel', 149)).toBeUndefined()
  })

  it('applies Cash / Wave research lab only (no cash relic on workshop card)', () => {
    expect(
      workshopUtilityStatDisplay('cashPerWaveLevel', 149, {
        cashPerWaveLabMultiplier: 1.1,
      }),
    ).toBe('656')
  })

  it('Coins / Kill Bonus uses workshop wiki ladder (149 levels)', () => {
    expect(WORKSHOP_COINS_KILL_BONUS_UNLOCK_COINS).toBe(100)
    expect(workshopUtilityMaxLevel('coinsKillBonusLevel')).toBe(WORKSHOP_COINS_KILL_BONUS_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('coinsKillBonusLevel', 0)).toBe(50)
    expect(workshopUtilityNextMarginalCoins('coinsKillBonusLevel', 148)).toBe(467_980)
    expect(workshopUtilityNextMarginalCoins('coinsKillBonusLevel', 148)).toBe(
      workshopCoinsKillBonusNextMarginalCoins(148),
    )
    expect(workshopUtilityStatDisplay('coinsKillBonusLevel', 0)).toBe('x1.00')
    expect(workshopUtilityStatDisplay('coinsKillBonusLevel', 1)).toBe('x1.01')
    expect(workshopUtilityStatDisplay('coinsKillBonusLevel', 149)).toBe('x2.49')
    expect(workshopUtilityNextMarginalCoins('coinsKillBonusLevel', 149)).toBeUndefined()
  })

  it('applies Coins / Kill Bonus research lab × Coin Bonus+ enhancement on workshop card', () => {
    expect(
      workshopUtilityStatDisplay('coinsKillBonusLevel', 149, {
        coinsKillBonusLabMultiplier: 2.78,
        coinsKillBonusEnhanceMultiplier: 1.26,
      }),
    ).toBe('x8.72')
  })

  it('Coins / Wave uses workshop wiki ladder (149 levels)', () => {
    expect(WORKSHOP_COINS_WAVE_UNLOCK_COINS).toBe(100)
    expect(workshopUtilityMaxLevel('coinsWaveLevel')).toBe(WORKSHOP_COINS_WAVE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('coinsWaveLevel', 0)).toBe(50)
    expect(workshopUtilityNextMarginalCoins('coinsWaveLevel', 148)).toBe(467_980)
    expect(workshopUtilityNextMarginalCoins('coinsWaveLevel', 148)).toBe(
      workshopCoinsWaveNextMarginalCoins(148),
    )
    expect(workshopUtilityStatDisplay('coinsWaveLevel', 0)).toBe('1')
    expect(workshopUtilityStatDisplay('coinsWaveLevel', 1)).toBe('2')
    expect(workshopUtilityStatDisplay('coinsWaveLevel', 149)).toBe('150')
    expect(workshopUtilityNextMarginalCoins('coinsWaveLevel', 149)).toBeUndefined()
  })

  it('applies Coins / Wave research lab only on workshop card', () => {
    expect(
      workshopUtilityStatDisplay('coinsWaveLevel', 149, {
        coinsWaveLabMultiplier: 1.52,
      }),
    ).toBe('228')
  })

  it('Free Attack Upgrade uses workshop wiki ladder (99 levels)', () => {
    expect(workshopUtilityMaxLevel('freeAttackUpgradeLevel')).toBe(WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('freeAttackUpgradeLevel', 0)).toBe(75)
    expect(workshopUtilityNextMarginalCoins('freeAttackUpgradeLevel', 98)).toBe(133_870)
    expect(workshopUtilityNextMarginalCoins('freeAttackUpgradeLevel', 98)).toBe(
      workshopFreeAttackUpgradeNextMarginalCoins(98),
    )
    expect(workshopUtilityStatDisplay('freeAttackUpgradeLevel', 0)).toBe('0.00%')
    expect(workshopUtilityStatDisplay('freeAttackUpgradeLevel', 1)).toBe('0.50%')
    expect(workshopUtilityStatDisplay('freeAttackUpgradeLevel', 99)).toBe('49.50%')
    expect(workshopUtilityNextMarginalCoins('freeAttackUpgradeLevel', 99)).toBeUndefined()
  })

  it('applies Free Upgrades + enhancement and stacked relic/submodule on free attack row', () => {
    // (workshop 49.5 + card 10 + submodule 6) × Free Upgrades+ x1.10 (L10) × (1 + relic 6%) = 76.37%.
    expect(
      workshopUtilityStatDisplay('freeAttackUpgradeLevel', 99, {
        freeUpgradesCardPercentPoints: 10,
        freeAttackUpgradeRelicPercentPoints: 6,
        submodule: { freeAttackUpgradePercentPoints: 6 },
        enhanceFreeUpgradesLevel: 10,
        workshopEnhancementsLabUnlocked: true,
      }),
    ).toBe('76.37%')
  })

  it('Free Defense Upgrade uses workshop wiki ladder (99 levels)', () => {
    expect(workshopUtilityMaxLevel('freeDefenseUpgradeLevel')).toBe(WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('freeDefenseUpgradeLevel', 0)).toBe(75)
    expect(workshopUtilityNextMarginalCoins('freeDefenseUpgradeLevel', 98)).toBe(133_870)
    expect(workshopUtilityNextMarginalCoins('freeDefenseUpgradeLevel', 98)).toBe(
      workshopFreeDefenseUpgradeNextMarginalCoins(98),
    )
    expect(workshopUtilityStatDisplay('freeDefenseUpgradeLevel', 0)).toBe('0.00%')
    expect(workshopUtilityStatDisplay('freeDefenseUpgradeLevel', 1)).toBe('0.50%')
    expect(workshopUtilityStatDisplay('freeDefenseUpgradeLevel', 99)).toBe('49.50%')
    expect(workshopUtilityNextMarginalCoins('freeDefenseUpgradeLevel', 99)).toBeUndefined()
  })

  it('Free Utility Upgrade uses workshop wiki ladder (99 levels)', () => {
    expect(workshopUtilityMaxLevel('freeUtilityUpgradeLevel')).toBe(WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('freeUtilityUpgradeLevel', 0)).toBe(100)
    expect(workshopUtilityNextMarginalCoins('freeUtilityUpgradeLevel', 98)).toBe(133_900)
    expect(workshopUtilityNextMarginalCoins('freeUtilityUpgradeLevel', 98)).toBe(
      workshopFreeUtilityUpgradeNextMarginalCoins(98),
    )
    expect(workshopUtilityStatDisplay('freeUtilityUpgradeLevel', 0)).toBe('0.00%')
    expect(workshopUtilityStatDisplay('freeUtilityUpgradeLevel', 1)).toBe('0.50%')
    expect(workshopUtilityStatDisplay('freeUtilityUpgradeLevel', 99)).toBe('49.50%')
    expect(workshopUtilityNextMarginalCoins('freeUtilityUpgradeLevel', 99)).toBeUndefined()
  })

  it('Interest / Wave uses workshop wiki ladder (99 levels)', () => {
    expect(WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS).toBe(5000)
    expect(workshopUtilityMaxLevel('interestPerWaveLevel')).toBe(WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('interestPerWaveLevel', 0)).toBe(125)
    expect(workshopUtilityNextMarginalCoins('interestPerWaveLevel', 98)).toBe(252_470)
    expect(workshopUtilityNextMarginalCoins('interestPerWaveLevel', 98)).toBe(
      workshopInterestPerWaveNextMarginalCoins(98),
    )
    expect(workshopUtilityStatDisplay('interestPerWaveLevel', 0)).toBe('0.00%')
    expect(workshopUtilityStatDisplay('interestPerWaveLevel', 1)).toBe('0.06%')
    expect(workshopUtilityStatDisplay('interestPerWaveLevel', 99)).toBe('5.94%')
    expect(
      workshopUtilityStatDisplay('interestPerWaveLevel', 99, {
        cashBonusEnhanceMultiplier: 1.4,
      }),
    ).toBe('8.32%')
    expect(workshopUtilityNextMarginalCoins('interestPerWaveLevel', 99)).toBeUndefined()
  })

  it('Recovery Amount uses workshop wiki ladder (300 levels)', () => {
    expect(WORKSHOP_RECOVERY_UNLOCK_COINS).toBe(1_500_000)
    expect(workshopUtilityMaxLevel('recoveryAmountLevel')).toBe(WORKSHOP_RECOVERY_AMOUNT_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('recoveryAmountLevel', 0)).toBe(1000)
    expect(workshopUtilityNextMarginalCoins('recoveryAmountLevel', 299)).toBe(21_590_000_000)
    expect(workshopUtilityNextMarginalCoins('recoveryAmountLevel', 299)).toBe(
      workshopRecoveryAmountNextMarginalCoins(299),
    )
    expect(workshopUtilityStatDisplay('recoveryAmountLevel', 0)).toBe('14.00%')
    expect(workshopUtilityStatDisplay('recoveryAmountLevel', 1)).toBe('14.40%')
    expect(workshopUtilityStatDisplay('recoveryAmountLevel', 300)).toBe('134.00%')
    const recoveryEnhMult = workshopDisplayedRecoveryAmountEnhancementMultiplier(40, 10, true)
    expect(
      workshopUtilityStatDisplay('recoveryAmountLevel', 300, {
        recoveryAmountLabPercentPoints: 18,
        recoveryAmountEnhancementsMultiplier: recoveryEnhMult,
      }),
    ).toBe('220.86%')
    expect(workshopUtilityNextMarginalCoins('recoveryAmountLevel', 300)).toBeUndefined()
  })

  it('Max Recovery uses workshop wiki ladder (500 levels)', () => {
    expect(workshopUtilityMaxLevel('maxRecoveryLevel')).toBe(WORKSHOP_MAX_RECOVERY_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('maxRecoveryLevel', 0)).toBe(1000)
    expect(workshopUtilityNextMarginalCoins('maxRecoveryLevel', 499)).toBe(151_170_000_000)
    expect(workshopUtilityNextMarginalCoins('maxRecoveryLevel', 499)).toBe(
      workshopMaxRecoveryNextMarginalCoins(499),
    )
    expect(workshopUtilityStatDisplay('maxRecoveryLevel', 0)).toBe('x1.50')
    expect(workshopUtilityStatDisplay('maxRecoveryLevel', 1)).toBe('x1.53')
    expect(workshopUtilityStatDisplay('maxRecoveryLevel', 500)).toBe('x16.50')
    expect(
      workshopUtilityStatDisplay('maxRecoveryLevel', 500, {
        maxRecoveryEnhancementsMultiplier: 1.4,
      }),
    ).toBe('x23.10')
    expect(workshopUtilityNextMarginalCoins('maxRecoveryLevel', 500)).toBeUndefined()
  })

  it('Package Chance uses workshop wiki ladder (60 levels)', () => {
    expect(workshopUtilityMaxLevel('packageChanceLevel')).toBe(WORKSHOP_PACKAGE_CHANCE_MAX_LEVEL)
    expect(workshopUtilityNextMarginalCoins('packageChanceLevel', 0)).toBe(1000)
    expect(workshopUtilityNextMarginalCoins('packageChanceLevel', 59)).toBe(25_400_000)
    expect(workshopUtilityNextMarginalCoins('packageChanceLevel', 59)).toBe(
      workshopPackageChanceNextMarginalCoins(59),
    )
    expect(workshopUtilityStatDisplay('packageChanceLevel', 0)).toBe('6.00%')
    expect(workshopUtilityStatDisplay('packageChanceLevel', 1)).toBe('6.40%')
    expect(workshopUtilityStatDisplay('packageChanceLevel', 60)).toBe('30.00%')
    expect(workshopUtilityNextMarginalCoins('packageChanceLevel', 60)).toBeUndefined()
  })

  it('Enemy Attack Level Skip uses workshop wiki ladder (699 levels)', () => {
    expect(WORKSHOP_ENEMY_LEVEL_SKIP_UNLOCK_COINS).toBe(1_000_000_000)
    expect(workshopUtilityMaxLevel('enemyAttackLevelSkipLevel')).toBe(
      WORKSHOP_ENEMY_ATTACK_LEVEL_SKIP_MAX_LEVEL,
    )
    expect(workshopUtilityNextMarginalCoins('enemyAttackLevelSkipLevel', 0)).toBe(300_000_000)
    expect(workshopUtilityNextMarginalCoins('enemyAttackLevelSkipLevel', 698)).toBe(
      4_559_999_999_999_999_500,
    )
    expect(workshopUtilityNextMarginalCoins('enemyAttackLevelSkipLevel', 698)).toBe(
      workshopEnemyAttackLevelSkipNextMarginalCoins(698),
    )
    expect(workshopUtilityStatDisplay('enemyAttackLevelSkipLevel', 0)).toBe('0.05%')
    expect(workshopUtilityStatDisplay('enemyAttackLevelSkipLevel', 1)).toBe('0.10%')
    expect(workshopUtilityStatDisplay('enemyAttackLevelSkipLevel', 699)).toBe('35.00%')
    expect(workshopUtilityNextMarginalCoins('enemyAttackLevelSkipLevel', 699)).toBeUndefined()
  })

  it('Enemy Health Level Skip uses workshop wiki ladder (699 levels)', () => {
    expect(workshopUtilityMaxLevel('enemyHealthLevelSkipLevel')).toBe(
      WORKSHOP_ENEMY_HEALTH_LEVEL_SKIP_MAX_LEVEL,
    )
    expect(workshopUtilityNextMarginalCoins('enemyHealthLevelSkipLevel', 0)).toBe(300_000_000)
    expect(workshopUtilityNextMarginalCoins('enemyHealthLevelSkipLevel', 698)).toBe(
      4_559_999_999_999_999_500,
    )
    expect(workshopUtilityNextMarginalCoins('enemyHealthLevelSkipLevel', 698)).toBe(
      workshopEnemyHealthLevelSkipNextMarginalCoins(698),
    )
    expect(workshopUtilityStatDisplay('enemyHealthLevelSkipLevel', 0)).toBe('0.05%')
    expect(workshopUtilityStatDisplay('enemyHealthLevelSkipLevel', 699)).toBe('35.00%')
    expect(workshopUtilityNextMarginalCoins('enemyHealthLevelSkipLevel', 699)).toBeUndefined()
  })
})
