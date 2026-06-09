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
    expect(workshopHealthStatValue(100)).toBe(21_560)
    expect(workshopHealthStatValue(6000)).toBe(6.71e9)

    expect(workshopHealthNextMarginalCoins(0)).toBe(30)
    expect(workshopHealthNextMarginalCoins(99)).toBe(77_220)
    expect(workshopHealthNextMarginalCoins(5999)).toBe(4.68e12)
  })

  it('max level is 6000', () => {
    expect(WORKSHOP_HEALTH_MAX_LEVEL).toBe(6000)
    expect(workshopHealthNextMarginalCoins(6000)).toBeUndefined()
  })
})
