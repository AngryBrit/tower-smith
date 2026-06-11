import { describe, expect, it } from 'vitest'
import {
  isWorkshopUnlockGateSheetLabel,
  workshopUpgradeIdFromSheetLabel,
  workshopUpgradeIdFromUnlockGateLabel,
} from './workshopSheetUnlockGates'

describe('workshopSheetUnlockGates', () => {
  it('detects unlock-gate labels', () => {
    expect(isWorkshopUnlockGateSheetLabel('Unlock Range (50 ¢)')).toBe(true)
    expect(isWorkshopUnlockGateSheetLabel('Damage')).toBe(false)
  })

  it('maps duplicate unlock-gate rows using max column hints', () => {
    expect(
      workshopUpgradeIdFromUnlockGateLabel('Unlock Range (50 ¢)', { maxLevelHint: 79 }),
    ).toBe('attackRangeLevel')
    expect(
      workshopUpgradeIdFromUnlockGateLabel('Unlock Range (50 ¢)', { maxLevelHint: 200 }),
    ).toBe('damagePerMeterLevel')
    expect(
      workshopUpgradeIdFromUnlockGateLabel('Unlock Multishot (400 ¢)', { maxLevelHint: 99 }),
    ).toBe('multishotChanceLevel')
    expect(
      workshopUpgradeIdFromUnlockGateLabel('Unlock Multishot (400 ¢)', { maxLevelHint: 7 }),
    ).toBe('multishotTargetsLevel')
  })

  it('resolves canonical and unlock-gate labels through one helper', () => {
    expect(workshopUpgradeIdFromSheetLabel('Attack Speed')).toBe('attackSpeedLevel')
    expect(
      workshopUpgradeIdFromSheetLabel('Unlock Super Critical Hits (100M ¢)', {
        maxLevelHint: 120,
      }),
    ).toBe('superCritMultLevel')
  })
})
