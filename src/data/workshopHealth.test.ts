import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_HEALTH_MAX_LEVEL,
  workshopHealthNextMarginalCoins,
  workshopHealthStatValue,
} from './workshopHealth'

describe('workshopHealth', () => {
  it('matches wiki milestone Value and marginal Cost', () => {
    expect(workshopHealthStatValue(0)).toBe(5)
    expect(workshopHealthStatValue(1)).toBe(10)
    expect(workshopHealthStatValue(100)).toBeCloseTo(21_563.4809248988, 3)
    expect(workshopHealthStatValue(6000)).toBeCloseTo(6_709_183_277.54009, -6)

    expect(workshopHealthNextMarginalCoins(0)).toBe(30)
    expect(workshopHealthNextMarginalCoins(99)).toBeCloseTo(77_219.0943483354, 0)
    expect(workshopHealthNextMarginalCoins(5999)).toBeCloseTo(4_677_842_447_733.98, 0)
  })

  it('max level is 6000', () => {
    expect(WORKSHOP_HEALTH_MAX_LEVEL).toBe(6000)
    expect(workshopHealthNextMarginalCoins(6000)).toBeUndefined()
  })

})
