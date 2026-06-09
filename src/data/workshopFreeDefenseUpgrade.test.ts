import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL,
  workshopFreeDefenseUpgradeNextMarginalCoins,
  workshopFreeDefenseUpgradeStatDisplay,
  workshopFreeDefenseUpgradeStatPercentPoints,
} from './workshopFreeDefenseUpgrade'

describe('workshopFreeDefenseUpgrade', () => {
  it('matches wiki Value and marginal Cost per level', () => {
    expect(workshopFreeDefenseUpgradeStatPercentPoints(0)).toBe(0)
    expect(workshopFreeDefenseUpgradeStatPercentPoints(1)).toBe(0.5)
    expect(workshopFreeDefenseUpgradeStatPercentPoints(99)).toBe(49.5)
    expect(workshopFreeDefenseUpgradeStatDisplay(1)).toBe('0.50%')
    expect(workshopFreeDefenseUpgradeStatDisplay(99)).toBe('49.50%')

    expect(workshopFreeDefenseUpgradeNextMarginalCoins(0)).toBe(75)
    expect(workshopFreeDefenseUpgradeNextMarginalCoins(9)).toBe(941)
    expect(workshopFreeDefenseUpgradeNextMarginalCoins(98)).toBe(133_870)
    expect(workshopFreeDefenseUpgradeNextMarginalCoins(99)).toBeUndefined()
  })

  it('max level is 99', () => {
    expect(WORKSHOP_FREE_DEFENSE_UPGRADE_MAX_LEVEL).toBe(99)
  })
})
