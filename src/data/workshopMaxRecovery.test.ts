import { describe, expect, it } from 'vitest'
import { workshopDisplayedMaxRecoveryEnhancementMultiplier } from './workshopMaxRecovery'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

describe('workshopDisplayedMaxRecoveryEnhancementMultiplier', () => {
  it('uses Recovery Package+ tier when enhancements lab is unlocked', () => {
    expect(workshopDisplayedMaxRecoveryEnhancementMultiplier(40, true)).toBe(
      workshopEnhanceTier400Multiplier(40, 'Recovery Package +'),
    )
    expect(16.5 * workshopDisplayedMaxRecoveryEnhancementMultiplier(40, true)).toBeCloseTo(
      23.1,
      6,
    )
  })

  it('returns 1 when enhancements lab is locked or Recovery Package+ is 0', () => {
    expect(workshopDisplayedMaxRecoveryEnhancementMultiplier(40, false)).toBe(1)
    expect(workshopDisplayedMaxRecoveryEnhancementMultiplier(0, true)).toBe(1)
  })
})
