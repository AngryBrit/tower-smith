import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_THORN_DAMAGE_MAX_LEVEL,
  workshopThornDamageNextMarginalCoins,
  workshopThornDamageStatDisplay,
  workshopThornDamageStatPercentPoints,
} from './workshopThornDamage'

describe('workshopThornDamage', () => {
  it('has 99 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_THORN_DAMAGE_MAX_LEVEL; k += 1) {
      const c = workshopThornDamageNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(2_325_427)
  })

  it('matches wiki spot checks', () => {
    expect(workshopThornDamageStatPercentPoints(0)).toBe(0)
    expect(workshopThornDamageStatDisplay(1)).toBe('1%')
    expect(workshopThornDamageStatDisplay(50)).toBe('50%')
    expect(workshopThornDamageNextMarginalCoins(0)).toBe(60)
    expect(workshopThornDamageNextMarginalCoins(10)).toBe(706)
    expect(workshopThornDamageNextMarginalCoins(75)).toBe(42_160)
    expect(workshopThornDamageNextMarginalCoins(98)).toBe(75_550)
    expect(workshopThornDamageNextMarginalCoins(99)).toBeUndefined()
  })
})
