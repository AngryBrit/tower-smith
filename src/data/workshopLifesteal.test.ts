import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_LIFESTEAL_MAX_LEVEL,
  workshopLifestealNextMarginalCoins,
  workshopLifestealStatDisplay,
  workshopLifestealStatPercentPoints,
} from './workshopLifesteal'

describe('workshopLifesteal', () => {
  it('has 80 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_LIFESTEAL_MAX_LEVEL; k += 1) {
      const c = workshopLifestealNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(1_476_722)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopLifestealStatPercentPoints(0)).toBe(0)
    expect(workshopLifestealStatDisplay(1)).toBe('0.10%')
    expect(workshopLifestealStatDisplay(3)).toBe('0.29%')
    expect(workshopLifestealStatDisplay(80)).toBe('4.46%')
    expect(workshopLifestealNextMarginalCoins(0)).toBe(60)
    expect(workshopLifestealNextMarginalCoins(11)).toBe(937)
    expect(workshopLifestealNextMarginalCoins(75)).toBe(54_630)
    expect(workshopLifestealNextMarginalCoins(79)).toBe(61_320)
    expect(workshopLifestealNextMarginalCoins(80)).toBeUndefined()
  })
})
