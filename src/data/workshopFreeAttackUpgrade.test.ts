import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL,
  workshopFreeAttackUpgradeNextMarginalCoins,
  workshopFreeAttackUpgradeStatDisplay,
  workshopFreeAttackUpgradeStatPercentPoints,
} from './workshopFreeAttackUpgrade'

describe('workshopFreeAttackUpgrade', () => {
  it('matches wiki Value and marginal Cost per level', () => {
    expect(workshopFreeAttackUpgradeStatPercentPoints(0)).toBe(0)
    expect(workshopFreeAttackUpgradeStatPercentPoints(1)).toBe(0.5)
    expect(workshopFreeAttackUpgradeStatPercentPoints(99)).toBe(49.5)
    expect(workshopFreeAttackUpgradeStatDisplay(1)).toBe('0.50%')
    expect(workshopFreeAttackUpgradeStatDisplay(99)).toBe('49.50%')

    expect(workshopFreeAttackUpgradeNextMarginalCoins(0)).toBe(75)
    expect(workshopFreeAttackUpgradeNextMarginalCoins(9)).toBe(941)
    expect(workshopFreeAttackUpgradeNextMarginalCoins(98)).toBe(133_870)
    expect(workshopFreeAttackUpgradeNextMarginalCoins(99)).toBeUndefined()
  })

  it('max level is 99', () => {
    expect(WORKSHOP_FREE_ATTACK_UPGRADE_MAX_LEVEL).toBe(99)
  })
})
