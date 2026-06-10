import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_EP_ENHANCE_KEYS,
  WORKSHOP_EP_UPGRADE_KEYS,
  workshopEnhanceIdFromSheetName,
  workshopUpgradeIdFromSheetName,
} from './workshopSheetNames'

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

  it('maps workshop enhancement labels', () => {
    expect(workshopEnhanceIdFromSheetName('Damage +')).toBe('enhanceDamageLevel')
    expect(workshopEnhanceIdFromSheetName('Rend Armor Max')).toBe('enhanceRendArmorLevel')
    expect(workshopEnhanceIdFromSheetName('Coin Bonus +')).toBe('enhanceCoinBonusLevel')
    expect(workshopEnhanceIdFromSheetName('Enemy Level Skip +')).toBe('enhanceEnemyLevelSkipLevel')
  })

  it('maps Effective Paths enhancement and unlock-gate spellings', () => {
    expect(workshopEnhanceIdFromSheetName('Rend Armor Mult +')).toBe('enhanceRendArmorLevel')
    expect(workshopEnhanceIdFromSheetName('Damage / Meter +')).toBe('enhanceDamagePerMeterLevel')
    expect(workshopEnhanceIdFromSheetName('Unlock SCM + (35.52 T)')).toBe('enhanceSuperCritMultLevel')
    expect(workshopEnhanceIdFromSheetName('Unlock ASPD + (485.52 T)')).toBe('enhanceAttackSpeedLevel')
    expect(workshopEnhanceIdFromSheetName('Unlock Orb Size + (426.78 T)')).toBe('enhanceOrbSizeLevel')
    expect(workshopEnhanceIdFromSheetName('Super Crit Multi +')).toBe('enhanceSuperCritMultLevel')
    expect(workshopEnhanceIdFromSheetName('Orb Size +')).toBe('enhanceOrbSizeLevel')
  })

  it('covers every basic workshop upgrade key', () => {
    expect(WORKSHOP_EP_UPGRADE_KEYS.length).toBe(48)
    expect(WORKSHOP_EP_ENHANCE_KEYS.length).toBe(18)
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
