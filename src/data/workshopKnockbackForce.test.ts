import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL,
  workshopKnockbackForceNextMarginalCoins,
  workshopKnockbackForceStatDisplay,
  workshopKnockbackForceStatMultiplier,
} from './workshopKnockbackForce'

describe('workshopKnockbackForce', () => {
  it('has 40 marginal costs', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL; k += 1) {
      const c = workshopKnockbackForceNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(184_342)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopKnockbackForceStatMultiplier(0)).toBe(0.4)
    expect(workshopKnockbackForceStatDisplay(0)).toBe('0.40')
    expect(workshopKnockbackForceStatDisplay(1)).toBe('0.55')
    expect(workshopKnockbackForceStatMultiplier(30)).toBe(4.66)
    expect(workshopKnockbackForceStatDisplay(40)).toBe('6.08')
    expect(workshopKnockbackForceNextMarginalCoins(0)).toBe(80)
    expect(workshopKnockbackForceNextMarginalCoins(11)).toBe(1110)
    expect(workshopKnockbackForceNextMarginalCoins(39)).toBe(14_010)
    expect(workshopKnockbackForceNextMarginalCoins(40)).toBeUndefined()
  })
})
