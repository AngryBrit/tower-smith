import { describe, expect, it } from 'vitest'
import { WORKSHOP_EP_UPGRADE_KEYS, workshopUpgradeIdFromSheetName } from './workshopSheetNames'

describe('workshopUpgradeIdFromSheetName', () => {
  it('maps EP workshop labels to persisted upgrade keys', () => {
    expect(workshopUpgradeIdFromSheetName('Damage')).toBe('damageLevel')
    expect(workshopUpgradeIdFromSheetName('Critical Chance')).toBe('critChanceLevel')
    expect(workshopUpgradeIdFromSheetName('Range')).toBe('attackRangeLevel')
    expect(workshopUpgradeIdFromSheetName('Damage - Meter')).toBe('damagePerMeterLevel')
    expect(workshopUpgradeIdFromSheetName('Thorns')).toBe('thornDamageLevel')
    expect(workshopUpgradeIdFromSheetName('Coins - Kill Bonus')).toBe('coinsKillBonusLevel')
  })

  it('accepts calculator slash aliases', () => {
    expect(workshopUpgradeIdFromSheetName('Cash/Wave')).toBe('cashPerWaveLevel')
    expect(workshopUpgradeIdFromSheetName('Crit Chance')).toBe('critChanceLevel')
    expect(workshopUpgradeIdFromSheetName('Thorn Damage')).toBe('thornDamageLevel')
  })

  it('maps Effective Paths v3.x Master Sheet spellings', () => {
    expect(workshopUpgradeIdFromSheetName('Super Critical Chance')).toBe('superCritChanceLevel')
    expect(workshopUpgradeIdFromSheetName('Super Critical Mult')).toBe('superCritMultLevel')
    expect(workshopUpgradeIdFromSheetName('Coin / Kill Bonus')).toBe('coinsKillBonusLevel')
    expect(workshopUpgradeIdFromSheetName('Coin / Wave')).toBe('coinsWaveLevel')
    expect(workshopUpgradeIdFromSheetName('Max Amount')).toBe('maxRecoveryLevel')
  })

  it('covers every basic workshop upgrade key', () => {
    expect(WORKSHOP_EP_UPGRADE_KEYS.length).toBe(48)
    for (const key of WORKSHOP_EP_UPGRADE_KEYS) {
      const name =
        key === 'damageLevel'
          ? 'Damage'
          : key === 'critChanceLevel'
            ? 'Critical Chance'
            : key === 'thornDamageLevel'
              ? 'Thorns'
              : null
      if (name) expect(workshopUpgradeIdFromSheetName(name)).toBe(key)
    }
  })
})
