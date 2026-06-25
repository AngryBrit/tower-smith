import { describe, expect, it } from 'vitest'
import {
  workshopEnhanceFreeUpgradesMultiplier,
  workshopFreeUpgradeDisplayPercentPoints,
  workshopFreeUpgradesEnhancementMultiplier,
} from './workshopEnhanceFreeUpgrades'

describe('workshopFreeUpgradesEnhancementMultiplier', () => {
  it('is 1 when locked or level 0, else the current-level multiplier', () => {
    expect(workshopFreeUpgradesEnhancementMultiplier(13, false)).toBe(1)
    expect(workshopFreeUpgradesEnhancementMultiplier(0, true)).toBe(1)
    expect(workshopFreeUpgradesEnhancementMultiplier(13, true)).toBeCloseTo(
      workshopEnhanceFreeUpgradesMultiplier(13),
      8,
    )
  })
})

describe('workshopFreeUpgradeDisplayPercentPoints', () => {
  it('multiplies (workshop + card + submodule) by Free Upgrades+ then by (1 + relic%)', () => {
    // libil2cpp.so Main::GetOutOfRoundFree*UpgradeChance:
    // (49.5 + 10 + 6) × x1.13 (L13) × (1 + relic%).
    const attack = workshopFreeUpgradeDisplayPercentPoints(49.5, 10, 8, 6, 13, true)
    const utility = workshopFreeUpgradeDisplayPercentPoints(49.5, 10, 9, 6, 13, true)
    expect(attack.toFixed(2)).toBe('79.94')
    expect(utility.toFixed(2)).toBe('80.68')
  })

  it('applies no enhancement when locked (multiplier 1) but still stacks relic multiplicatively', () => {
    const value = workshopFreeUpgradeDisplayPercentPoints(49.5, 10, 8, 6, 13, false)
    expect(value).toBeCloseTo((49.5 + 10 + 6) * 1.08, 6)
  })
})
