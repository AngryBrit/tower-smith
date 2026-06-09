import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL,
  workshopFreeUtilityUpgradeNextMarginalCoins,
  workshopFreeUtilityUpgradeStatDisplay,
  workshopFreeUtilityUpgradeStatPercentPoints,
} from './workshopFreeUtilityUpgrade'

describe('workshopFreeUtilityUpgrade', () => {
  it('matches wiki Value and marginal Cost per level', () => {
    expect(workshopFreeUtilityUpgradeStatPercentPoints(0)).toBe(0)
    expect(workshopFreeUtilityUpgradeStatPercentPoints(1)).toBe(0.5)
    expect(workshopFreeUtilityUpgradeStatPercentPoints(99)).toBe(49.5)
    expect(workshopFreeUtilityUpgradeStatDisplay(1)).toBe('0.50%')
    expect(workshopFreeUtilityUpgradeStatDisplay(99)).toBe('49.50%')

    expect(workshopFreeUtilityUpgradeNextMarginalCoins(0)).toBe(100)
    expect(workshopFreeUtilityUpgradeNextMarginalCoins(9)).toBe(966)
    expect(workshopFreeUtilityUpgradeNextMarginalCoins(98)).toBe(133_900)
    expect(workshopFreeUtilityUpgradeNextMarginalCoins(99)).toBeUndefined()
  })

  it('max level is 99', () => {
    expect(WORKSHOP_FREE_UTILITY_UPGRADE_MAX_LEVEL).toBe(99)
  })
})
