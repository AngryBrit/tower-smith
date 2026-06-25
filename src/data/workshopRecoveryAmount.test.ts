import { describe, expect, it } from 'vitest'
import { workshopDisplayedRecoveryAmountEnhancementMultiplier } from './workshopRecoveryAmount'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'

describe('workshopDisplayedRecoveryAmountEnhancementMultiplier', () => {
  it('returns the Recovery Package+ tier multiplier (no Free Upgrades+ involvement)', () => {
    const recoveryMult = workshopEnhanceTier400Multiplier(40, 'Recovery Package +')
    const enhance = workshopDisplayedRecoveryAmountEnhancementMultiplier(40, true)
    expect(recoveryMult).toBe(1.4)
    expect(enhance).toBe(1.4)
    // Game formula: (134 base + 2 lab) × 1.4 (Recovery Package+) × 1.16 (recovery relic) = 220.86%.
    expect(`${((134 + 2) * enhance * 1.16).toFixed(2)}%`).toBe('220.86%')
  })

  it('returns 1 when enhancements lab is locked or Recovery Package+ is 0', () => {
    expect(workshopDisplayedRecoveryAmountEnhancementMultiplier(40, false)).toBe(1)
    expect(workshopDisplayedRecoveryAmountEnhancementMultiplier(0, true)).toBe(1)
  })
})
