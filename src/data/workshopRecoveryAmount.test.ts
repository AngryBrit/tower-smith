import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_DISPLAYED_RECOVERY_AMOUNT_FREE_UPGRADES_ENHANCE_EXCESS_FRACTION,
  workshopDisplayedRecoveryAmountEnhancementMultiplier,
} from './workshopRecoveryAmount'
import { workshopEnhanceTier400Multiplier } from './workshopEnhanceTier400Ladder'
import { workshopEnhanceFreeUpgradesMultiplier } from './workshopEnhanceFreeUpgrades'

describe('workshopDisplayedRecoveryAmountEnhancementMultiplier', () => {
  it('combines Recovery Package+ tier with partial Free Upgrades+ excess', () => {
    const recoveryMult = workshopEnhanceTier400Multiplier(40, 'Recovery Package +')
    const freeMult = workshopEnhanceFreeUpgradesMultiplier(10)
    const enhance = workshopDisplayedRecoveryAmountEnhancementMultiplier(40, 10, true)
    expect(recoveryMult).toBe(1.4)
    expect(freeMult).toBe(1.1)
    expect(enhance).toBeCloseTo(
      recoveryMult +
        (freeMult - 1) * WORKSHOP_DISPLAYED_RECOVERY_AMOUNT_FREE_UPGRADES_ENHANCE_EXCESS_FRACTION,
      12,
    )
    expect(152 * enhance).toBeCloseTo(220.86, 2)
    expect(`${(152 * enhance).toFixed(2)}%`).toBe('220.86%')
  })

  it('returns 1 when enhancements lab is locked or Recovery Package+ is 0', () => {
    expect(workshopDisplayedRecoveryAmountEnhancementMultiplier(40, 10, false)).toBe(1)
    expect(workshopDisplayedRecoveryAmountEnhancementMultiplier(0, 10, true)).toBe(1)
  })

  it('uses Recovery Package+ alone when Free Upgrades+ is 0', () => {
    expect(workshopDisplayedRecoveryAmountEnhancementMultiplier(40, 0, true)).toBe(1.4)
  })
})
