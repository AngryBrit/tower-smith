import { describe, expect, it } from 'vitest'
import { formatCoinAbbrev } from '../labCosts'
import {
  WORKSHOP_ENHANCE_ATTACK_SPEED_MAX_LEVEL,
  WORKSHOP_ENHANCE_ATTACK_SPEED_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_ATTACK_TIER_MAX_LEVEL,
  WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_DAMAGE_MAX_LEVEL,
  WORKSHOP_ENHANCE_DAMAGE_PER_METER_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS,
  WORKSHOP_ENHANCE_SUPER_CRIT_MULT_UNLOCK_ATTACK_ENHANCE_SPENT_COINS,
  workshopEnhanceAttackNextMarginalCoins,
  workshopEnhanceAttackSpeedMultiplier,
  workshopEnhanceAttackStatDisplay,
} from './workshopEnhanceAttack'
import { workshopEnhanceAttackTierMultiplier } from './workshopEnhanceAttackShared'

describe('workshopEnhanceAttack unlock thresholds', () => {
  it('matches wiki cumulative spend gates', () => {
    expect(WORKSHOP_ENHANCE_REND_ARMOR_UNLOCK_DAMAGE_ENHANCE_SPENT_COINS).toBe(50e9)
    expect(WORKSHOP_ENHANCE_CRIT_FACTOR_UNLOCK_ATTACK_ENHANCE_SPENT_COINS).toBe(500e9)
    expect(WORKSHOP_ENHANCE_DAMAGE_PER_METER_UNLOCK_ATTACK_ENHANCE_SPENT_COINS).toBe(5e12)
    expect(WORKSHOP_ENHANCE_SUPER_CRIT_MULT_UNLOCK_ATTACK_ENHANCE_SPENT_COINS).toBe(50e12)
    expect(WORKSHOP_ENHANCE_ATTACK_SPEED_UNLOCK_ATTACK_ENHANCE_SPENT_COINS).toBe(500e12)
  })
})

describe('workshopEnhanceAttack tier stats', () => {
  it('damage enhancement multiplier matches wiki milestones', () => {
    expect(workshopEnhanceAttackTierMultiplier(0)).toBe(1)
    expect(workshopEnhanceAttackTierMultiplier(1)).toBe(1.01)
    expect(workshopEnhanceAttackTierMultiplier(10)).toBe(1.1)
    expect(workshopEnhanceAttackTierMultiplier(300)).toBe(4)
    expect(workshopEnhanceAttackTierMultiplier(400)).toBe(5)
    expect(workshopEnhanceAttackStatDisplay('enhanceDamageLevel', 100)).toBe('x2.00')
    expect(workshopEnhanceAttackStatDisplay('enhanceDamageLevel', 400)).toBe('x5.00')
  })

  it('attack speed enhancement caps at 75 / ×1.75', () => {
    expect(workshopEnhanceAttackSpeedMultiplier(0)).toBe(1)
    expect(workshopEnhanceAttackSpeedMultiplier(50)).toBe(1.5)
    expect(workshopEnhanceAttackSpeedMultiplier(75)).toBe(1.75)
    expect(workshopEnhanceAttackStatDisplay('enhanceAttackSpeedLevel', 75)).toBe('x1.75')
    expect(WORKSHOP_ENHANCE_ATTACK_SPEED_MAX_LEVEL).toBe(75)
    expect(WORKSHOP_ENHANCE_DAMAGE_MAX_LEVEL).toBe(400)
    expect(WORKSHOP_ENHANCE_ATTACK_TIER_MAX_LEVEL).toBe(400)
  })
})

describe('workshopEnhanceAttack marginal coins', () => {
  it('damage enhancement L40→41 matches in-game ~2.97T display', () => {
    const raw = workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 40)!
    expect(raw).toBeGreaterThanOrEqual(2.965e12)
    expect(raw).toBeLessThan(2.975e12)
    expect(formatCoinAbbrev(raw)).toBe('2.97T')
  })

  it('damage enhancement uses extended ladder through L400', () => {
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 0)).toBe(5e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 9)).toBe(6.53e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 299)).toBe(34.88e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 309)).toBe(45.82e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 399)).toBe(330.8e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamageLevel', 400)).toBeUndefined()
  })

  it('rend armor enhancement uses extended ladder through L400', () => {
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceRendArmorLevel', 0)).toBe(5e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceRendArmorLevel', 399)).toBe(330.8e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceRendArmorLevel', 400)).toBeUndefined()
    expect(workshopEnhanceAttackStatDisplay('enhanceRendArmorLevel', 400)).toBe('x5.00')
  })

  it('critical factor enhancement uses extended ladder through L400', () => {
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceCritFactorLevel', 9)).toBe(6.53e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceCritFactorLevel', 399)).toBe(330.8e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceCritFactorLevel', 400)).toBeUndefined()
    expect(workshopEnhanceAttackStatDisplay('enhanceCritFactorLevel', 400)).toBe('x5.00')
  })

  it('damage per meter enhancement uses extended ladder through L400', () => {
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamagePerMeterLevel', 0)).toBe(5e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamagePerMeterLevel', 399)).toBe(
      330.8e18,
    )
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceDamagePerMeterLevel', 400)).toBeUndefined()
    expect(workshopEnhanceAttackStatDisplay('enhanceDamagePerMeterLevel', 400)).toBe('x5.00')
  })

  it('super crit mult enhancement uses extended ladder through L400', () => {
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceSuperCritMultLevel', 0)).toBe(5e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceSuperCritMultLevel', 399)).toBe(
      330.8e18,
    )
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceSuperCritMultLevel', 400)).toBeUndefined()
    expect(workshopEnhanceAttackStatDisplay('enhanceSuperCritMultLevel', 400)).toBe('x5.00')
  })

  it('attack speed enhancement uses per-level wiki costs', () => {
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceAttackSpeedLevel', 0)).toBe(5e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceAttackSpeedLevel', 1)).toBe(6.1e9)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceAttackSpeedLevel', 48)).toBe(1.75e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceAttackSpeedLevel', 49)).toBe(2.05e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceAttackSpeedLevel', 74)).toBe(188.63e18)
    expect(workshopEnhanceAttackNextMarginalCoins('enhanceAttackSpeedLevel', 75)).toBeUndefined()
  })
})
