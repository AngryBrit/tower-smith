import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL,
  workshopKnockbackChanceNextMarginalCoins,
  workshopKnockbackChanceStatDisplay,
  workshopKnockbackChanceStatPercentPoints,
} from './workshopKnockbackChance'

describe('workshopKnockbackChance', () => {
  it('has 80 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL; k += 1) {
      const c = workshopKnockbackChanceNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(1_604_460)
  })

  it('matches wiki spot checks', () => {
    expect(workshopKnockbackChanceStatPercentPoints(0)).toBe(0)
    expect(workshopKnockbackChanceStatDisplay(1)).toBe('1.00%')
    expect(workshopKnockbackChanceStatDisplay(50)).toBe('50.00%')
    expect(workshopKnockbackChanceNextMarginalCoins(0)).toBe(80)
    expect(workshopKnockbackChanceNextMarginalCoins(11)).toBe(1080)
    expect(workshopKnockbackChanceNextMarginalCoins(75)).toBe(59_120)
    expect(workshopKnockbackChanceNextMarginalCoins(79)).toBe(66_330)
    expect(workshopKnockbackChanceNextMarginalCoins(80)).toBeUndefined()
  })
})
