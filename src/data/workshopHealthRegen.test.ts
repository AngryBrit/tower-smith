import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_HEALTH_REGEN_MAX_LEVEL,
  workshopHealthRegenNextMarginalCoins,
  workshopHealthRegenStatDisplay,
  workshopHealthRegenStatValue,
} from './workshopHealthRegen'

describe('workshopHealthRegen', () => {
  it('matches wiki milestone Value and marginal Cost', () => {
    expect(workshopHealthRegenStatValue(0)).toBe(0)
    expect(workshopHealthRegenStatDisplay(0)).toBe('0/sec')
    expect(workshopHealthRegenStatDisplay(100)).toBe('269/sec')
    expect(workshopHealthRegenStatValue(1)).toBe(0)
    expect(workshopHealthRegenStatValue(100)).toBe(269)
    expect(workshopHealthRegenStatValue(6000)).toBe(10.17e9)

    expect(workshopHealthRegenNextMarginalCoins(0)).toBe(30)
    expect(workshopHealthRegenNextMarginalCoins(99)).toBe(77_220)
    expect(workshopHealthRegenNextMarginalCoins(5099)).toBe(1.25e9)
    expect(workshopHealthRegenNextMarginalCoins(5999)).toBe(388e9)
  })

  it('max level is 6000', () => {
    expect(WORKSHOP_HEALTH_REGEN_MAX_LEVEL).toBe(6000)
    expect(workshopHealthRegenNextMarginalCoins(6000)).toBeUndefined()
  })
})
