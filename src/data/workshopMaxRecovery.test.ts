import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_MAX_RECOVERY_MAX_LEVEL,
  workshopMaxRecoveryNextMarginalCoins,
  workshopMaxRecoveryStatDisplay,
  workshopMaxRecoveryStatMultiplier,
} from './workshopMaxRecovery'

describe('workshopMaxRecovery', () => {
  it('uses wiki milestone Value and shared marginal Cost', () => {
    expect(workshopMaxRecoveryStatMultiplier(0)).toBe(1.5)
    expect(workshopMaxRecoveryStatMultiplier(1)).toBe(1.53)
    expect(workshopMaxRecoveryStatMultiplier(10)).toBe(1.8)
    expect(workshopMaxRecoveryStatMultiplier(300)).toBe(10.5)
    expect(workshopMaxRecoveryStatMultiplier(500)).toBe(16.5)
    expect(workshopMaxRecoveryStatDisplay(0)).toBe('x1.50')
    expect(workshopMaxRecoveryStatDisplay(1)).toBe('x1.53')
    expect(workshopMaxRecoveryStatDisplay(500)).toBe('x16.50')

    expect(workshopMaxRecoveryNextMarginalCoins(0)).toBe(1000)
    expect(workshopMaxRecoveryNextMarginalCoins(9)).toBe(20_900)
    expect(workshopMaxRecoveryNextMarginalCoins(499)).toBe(151_170_000_000)
    expect(workshopMaxRecoveryNextMarginalCoins(500)).toBeUndefined()
  })

  it('max level is 500', () => {
    expect(WORKSHOP_MAX_RECOVERY_MAX_LEVEL).toBe(500)
  })
})
