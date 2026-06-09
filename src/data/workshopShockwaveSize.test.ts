import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL,
  workshopShockwaveSizeNextMarginalCoins,
  workshopShockwaveSizeStatDisplay,
  workshopShockwaveSizeStatMultiplier,
} from './workshopShockwaveSize'

describe('workshopShockwaveSize', () => {
  it('has 35 marginal costs matching wiki total spend', () => {
    let sum = 0
    for (let k = 0; k < WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL; k += 1) {
      const c = workshopShockwaveSizeNextMarginalCoins(k)
      expect(c).toBeDefined()
      sum += c!
    }
    expect(sum).toBe(600_134)
  })

  it('matches wiki Value and Cost spot checks', () => {
    expect(workshopShockwaveSizeStatMultiplier(0)).toBe(0.6)
    expect(workshopShockwaveSizeStatDisplay(0)).toBe('0.60')
    expect(workshopShockwaveSizeStatDisplay(1)).toBe('0.65')
    expect(workshopShockwaveSizeStatDisplay(35)).toBe('2.35')
    expect(workshopShockwaveSizeNextMarginalCoins(0)).toBe(250)
    expect(workshopShockwaveSizeNextMarginalCoins(34)).toBe(59_600)
    expect(workshopShockwaveSizeNextMarginalCoins(35)).toBeUndefined()
  })
})
