import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL,
  WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS,
  workshopInterestPerWaveNextMarginalCoins,
  workshopInterestPerWaveStatDisplay,
  workshopInterestPerWaveStatPercentPoints,
} from './workshopInterestPerWave'

describe('workshopInterestPerWave', () => {
  it('uses exact +0.06% per level and wiki marginal Cost', () => {
    expect(WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS).toBe(5000)
    expect(workshopInterestPerWaveStatPercentPoints(0)).toBe(0)
    expect(workshopInterestPerWaveStatPercentPoints(1)).toBe(0.06)
    expect(workshopInterestPerWaveStatPercentPoints(99)).toBe(5.94)
    expect(workshopInterestPerWaveStatDisplay(0)).toBe('0.00%')
    expect(workshopInterestPerWaveStatDisplay(1)).toBe('0.06%')
    expect(workshopInterestPerWaveStatDisplay(99)).toBe('5.94%')

    expect(workshopInterestPerWaveNextMarginalCoins(0)).toBe(125)
    expect(workshopInterestPerWaveNextMarginalCoins(9)).toBe(1320)
    expect(workshopInterestPerWaveNextMarginalCoins(98)).toBe(252_470)
    expect(workshopInterestPerWaveNextMarginalCoins(99)).toBeUndefined()
  })

  it('max level is 99', () => {
    expect(WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL).toBe(99)
  })
})
