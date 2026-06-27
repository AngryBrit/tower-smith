import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_HEALTH_REGEN_MAX_LEVEL,
  workshopHealthRegenNextMarginalCoins,
  workshopHealthRegenStatDisplay,
  workshopHealthRegenStatValue,
} from './workshopHealthRegen'

describe('workshopHealthRegen', () => {
  it('matches wiki milestone Value and marginal Cost', () => {
    expect(workshopHealthRegenStatValue(0)).toBe(0.0005)
    expect(workshopHealthRegenStatDisplay(0)).toBe('0.00/sec')
    expect(workshopHealthRegenStatDisplay(100)).toBe('269/sec')
    expect(workshopHealthRegenStatValue(1)).toBeCloseTo(0.04, 2)
    expect(workshopHealthRegenStatValue(100)).toBeCloseTo(269.11240234375, 3)
    expect(workshopHealthRegenStatValue(6000)).toBeCloseTo(10_170_855_374.9115, -6)

    expect(workshopHealthRegenNextMarginalCoins(0)).toBe(30)
    expect(workshopHealthRegenNextMarginalCoins(99)).toBeCloseTo(77_219.0943483354, 0)
    expect(workshopHealthRegenNextMarginalCoins(5099)).toBeCloseTo(1_250_180_971.15143, 0)
    expect(workshopHealthRegenNextMarginalCoins(5999)).toBeCloseTo(387_998_963_984.809, 0)
  })

  it('max level is 6000', () => {
    expect(WORKSHOP_HEALTH_REGEN_MAX_LEVEL).toBe(6000)
    expect(workshopHealthRegenNextMarginalCoins(6000)).toBeUndefined()
  })
})
