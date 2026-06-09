import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL,
  workshopShockwaveFrequencyNextMarginalCoins,
  workshopShockwaveFrequencyStatDisplay,
  workshopShockwaveFrequencyStatSeconds,
} from './workshopShockwaveFrequency'

describe('workshopShockwaveFrequency', () => {
  it('has 40 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL; k += 1) {
      const c = workshopShockwaveFrequencyNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(973_754)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopShockwaveFrequencyStatSeconds(0)).toBeCloseTo(20)
    expect(workshopShockwaveFrequencyStatDisplay(0)).toBe('20.00s')
    expect(workshopShockwaveFrequencyStatDisplay(1)).toBe('19.85s')
    expect(workshopShockwaveFrequencyStatDisplay(40)).toBe('14.00s')
    expect(workshopShockwaveFrequencyNextMarginalCoins(0)).toBe(250)
    expect(workshopShockwaveFrequencyNextMarginalCoins(39)).toBe(85_600)
    expect(workshopShockwaveFrequencyNextMarginalCoins(40)).toBeUndefined()
  })
})
