import { describe, expect, it } from 'vitest'
import { formatCoinAbbrev, formatCoinAbbrevPreferT } from '../labCosts'
import { workshopToolkitMarginalCoins } from '../workshopCosts'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import {
  workshopEnhanceUtilityCategorySpentCoins,
  workshopEnhanceUtilityIsUnlocked,
  workshopEnhanceUtilityUnlockRemainingCoins,
  workshopEnhanceUtilityUnlockRequiredCoins,
} from './workshopEnhanceUnlock'
import {
  WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL,
  workshopEnhanceTier400Multiplier,
} from './workshopEnhanceTier400Ladder'
import { WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES } from './workshopEnhanceTier400WikiDecades'
import { workshopEnhanceEnemyLevelSkipMultiplier } from './workshopEnhanceEnemyLevelSkip'
import { WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_WIKI_DECADES } from './workshopEnhanceEnemyLevelSkipWikiDecades'
import { workshopEnhanceFreeUpgradesMultiplier } from './workshopEnhanceFreeUpgrades'
import { WORKSHOP_ENHANCE_FREE_UPGRADES_WIKI_DECADES } from './workshopEnhanceFreeUpgradesWikiDecades'
import { WORKSHOP_ENHANCE_RECOVERY_PACKAGE_WIKI_DECADES } from './workshopEnhanceRecoveryPackageWikiDecades'
import { workshopEnhanceUtilityTier200Multiplier } from './workshopEnhanceUtilityTier200'
import { WORKSHOP_ENHANCE_UTILITY_TIER_200_WIKI_DECADES } from './workshopEnhanceUtilityTier200WikiDecades'
import {
  WORKSHOP_ENHANCE_CELLS_KILL_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_COIN_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL,
  WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL,
  WORKSHOP_ENHANCE_FREE_UPGRADES_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_RECOVERY_PACKAGE_MAX_LEVEL,
  WORKSHOP_ENHANCE_RECOVERY_PACKAGE_UNLOCK_UTILITY_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL,
  workshopEnhanceUtilityNextMarginalCoins,
  workshopEnhanceUtilityStatDisplay,
} from './workshopEnhanceUtility'

describe('workshopEnhanceUtility', () => {
  it('cash bonus enhancement matches wiki value and coin milestones (L1–L400)', () => {
    expect(WORKSHOP_ENHANCE_TIER_400_MAX_LEVEL).toBe(400)
    expect(workshopEnhanceTier400Multiplier(0, 'Cash Bonus +')).toBe(1)
    expect(workshopEnhanceUtilityStatDisplay('enhanceCashBonusLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_TIER_400_WIKI_DECADES) {
      expect(workshopEnhanceTier400Multiplier(level, 'Cash Bonus +')).toBe(value)
      expect(workshopEnhanceUtilityStatDisplay('enhanceCashBonusLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCashBonusLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Cash Bonus +', level - 1),
      )
    }
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCashBonusLevel', 400)).toBeUndefined()
  })

  it('cash bonus L62→63 matches in-game ~92.14T display', () => {
    const raw = workshopEnhanceUtilityNextMarginalCoins('enhanceCashBonusLevel', 62)!
    expect(formatCoinAbbrev(raw)).toBe('92.14T')
  })

  it('enemy level skip locked card shows wiki 500T gate', () => {
    expect(
      workshopEnhanceUtilityUnlockRequiredCoins('enhanceEnemyLevelSkipLevel'),
    ).toBe(500e12)
    expect(
      formatCoinAbbrevPreferT(
        workshopEnhanceUtilityUnlockRemainingCoins('enhanceEnemyLevelSkipLevel', 0),
      ),
    ).toBe('500.00T')
  })

  it('enemy level skip unlocks at cash bonus L62 (GOD cumulative spend crosses 500T gate)', () => {
    const ws = { ...defaultWorkshopPersisted(), enhanceCashBonusLevel: 62 }
    const spent = workshopEnhanceUtilityCategorySpentCoins(ws)
    expect(spent).toBeGreaterThanOrEqual(500e12)
    expect(workshopEnhanceUtilityIsUnlocked('enhanceEnemyLevelSkipLevel', spent)).toBe(true)
    const ws61 = { ...defaultWorkshopPersisted(), enhanceCashBonusLevel: 61 }
    expect(
      workshopEnhanceUtilityIsUnlocked(
        'enhanceEnemyLevelSkipLevel',
        workshopEnhanceUtilityCategorySpentCoins(ws61),
      ),
    ).toBe(false)
  })

  it('coin bonus enhancement matches wiki decades and per-level coins (L1–L200)', () => {
    expect(WORKSHOP_ENHANCE_COIN_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS).toBe(50e9)
    expect(WORKSHOP_ENHANCE_UTILITY_TIER_200_MAX_LEVEL).toBe(200)
    expect(workshopEnhanceUtilityTier200Multiplier(0, 'Coin Bonus +')).toBe(1)
    expect(workshopEnhanceUtilityStatDisplay('enhanceCoinBonusLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_UTILITY_TIER_200_WIKI_DECADES) {
      expect(workshopEnhanceUtilityTier200Multiplier(level, 'Coin Bonus +')).toBe(value)
      expect(workshopEnhanceUtilityStatDisplay('enhanceCoinBonusLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCoinBonusLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Coin Bonus +', level - 1),
      )
    }
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCoinBonusLevel', 200)).toBeUndefined()

    for (const level of [1, 17, 52, 198, 199]) {
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCoinBonusLevel', level)).toBe(
        workshopToolkitMarginalCoins('Coin Bonus +', level),
      )
    }
  })

  it('cells/kill bonus enhancement matches wiki decades and per-level coins (L1–L200)', () => {
    expect(WORKSHOP_ENHANCE_CELLS_KILL_BONUS_UNLOCK_UTILITY_ENHANCE_SPENT_COINS).toBe(500e9)
    expect(workshopEnhanceUtilityStatDisplay('enhanceCellsKillBonusLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_UTILITY_TIER_200_WIKI_DECADES) {
      expect(workshopEnhanceUtilityStatDisplay('enhanceCellsKillBonusLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCellsKillBonusLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Cells - Kill Bonus', level - 1),
      )
    }
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCellsKillBonusLevel', 200)).toBeUndefined()

    for (const level of [1, 17, 52, 198, 199]) {
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceCellsKillBonusLevel', level)).toBe(
        workshopToolkitMarginalCoins('Cells - Kill Bonus', level),
      )
    }
  })

  it('free upgrades enhancement matches wiki decades and per-level coins (L1–L100)', () => {
    expect(WORKSHOP_ENHANCE_FREE_UPGRADES_UNLOCK_UTILITY_ENHANCE_SPENT_COINS).toBe(5e12)
    expect(WORKSHOP_ENHANCE_FREE_UPGRADES_MAX_LEVEL).toBe(100)
    expect(workshopEnhanceFreeUpgradesMultiplier(0)).toBe(1)
    expect(workshopEnhanceUtilityStatDisplay('enhanceFreeUpgradesLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_FREE_UPGRADES_WIKI_DECADES) {
      expect(workshopEnhanceFreeUpgradesMultiplier(level)).toBe(value)
      expect(workshopEnhanceUtilityStatDisplay('enhanceFreeUpgradesLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceFreeUpgradesLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Free Upgrades +', level - 1),
      )
    }
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceFreeUpgradesLevel', 100)).toBeUndefined()

    for (const level of [1, 2, 17, 98, 99]) {
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceFreeUpgradesLevel', level)).toBe(
        workshopToolkitMarginalCoins('Free Upgrades +', level),
      )
    }
  })

  it('recovery package (packages) matches wiki decades and coins (L1–L300)', () => {
    expect(WORKSHOP_ENHANCE_RECOVERY_PACKAGE_UNLOCK_UTILITY_ENHANCE_SPENT_COINS).toBe(50e12)
    expect(WORKSHOP_ENHANCE_RECOVERY_PACKAGE_MAX_LEVEL).toBe(300)
    expect(WORKSHOP_ENHANCE_RECOVERY_PACKAGE_WIKI_DECADES).toHaveLength(31)
    expect(workshopEnhanceUtilityStatDisplay('enhanceRecoveryPackageLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_RECOVERY_PACKAGE_WIKI_DECADES) {
      expect(workshopEnhanceTier400Multiplier(level, 'Recovery Package +')).toBe(value)
      expect(workshopEnhanceUtilityStatDisplay('enhanceRecoveryPackageLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceRecoveryPackageLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Recovery Package +', level - 1),
      )
    }
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceRecoveryPackageLevel', 300)).toBeUndefined()
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceRecoveryPackageLevel', 299)).toBe(
      workshopToolkitMarginalCoins('Recovery Package +', 299),
    )
  })

  it('enemy level skip enhancement matches wiki decades and per-level coins (L1–L60)', () => {
    expect(WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_UNLOCK_UTILITY_ENHANCE_SPENT_COINS).toBe(500e12)
    expect(WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_MAX_LEVEL).toBe(60)
    expect(workshopEnhanceEnemyLevelSkipMultiplier(0)).toBe(1)
    expect(workshopEnhanceUtilityStatDisplay('enhanceEnemyLevelSkipLevel', 0)).toBe('x1.00')

    for (const { level, value } of WORKSHOP_ENHANCE_ENEMY_LEVEL_SKIP_WIKI_DECADES) {
      expect(workshopEnhanceEnemyLevelSkipMultiplier(level)).toBe(value)
      expect(workshopEnhanceUtilityStatDisplay('enhanceEnemyLevelSkipLevel', level)).toBe(
        `x${value.toFixed(2)}`,
      )
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceEnemyLevelSkipLevel', level - 1)).toBe(
        workshopToolkitMarginalCoins('Enemy Level Skip +', level - 1),
      )
    }
    expect(workshopEnhanceUtilityNextMarginalCoins('enhanceEnemyLevelSkipLevel', 60)).toBeUndefined()

    for (const level of [1, 2, 17, 58, 59]) {
      expect(workshopEnhanceUtilityNextMarginalCoins('enhanceEnemyLevelSkipLevel', level)).toBe(
        workshopToolkitMarginalCoins('Enemy Level Skip +', level),
      )
    }
  })
})
