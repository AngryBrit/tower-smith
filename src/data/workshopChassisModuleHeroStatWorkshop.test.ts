import { describe, expect, it } from 'vitest'
import { formatCoinAbbrev } from '../labCosts'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { workshopChassisModuleHeroStatMultiplier } from './workshopChassisModuleHeroStatWorkshop'
import { computeWorkshopDisplayedDamagePreBerserker } from './workshopDisplayedDamage'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { workshopCashBonusStatMultiplier } from './workshopCashBonus'
import { workshopHealthStatValue } from './workshopHealth'

describe('workshopChassisModuleHeroStatWorkshop', () => {
  it('returns 1 with no chassis equipped', () => {
    const ws = defaultWorkshopPersisted()
    expect(workshopChassisModuleHeroStatMultiplier(ws, 'cannon')).toBe(1)
    expect(workshopChassisModuleHeroStatMultiplier(ws, 'armor')).toBe(1)
    expect(workshopChassisModuleHeroStatMultiplier(ws, 'generator')).toBe(1)
    expect(workshopChassisModuleHeroStatMultiplier(ws, 'core')).toBe(1)
  })

  it('matches picker hero stat for legendary cannon L100', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonChassisModuleId: 'astralDeliverance',
      simCannonChassisModuleRarity: 'legendary',
      simCannonChassisModuleLevel: 100,
    }
    expect(workshopChassisModuleHeroStatMultiplier(ws, 'cannon')).toBeCloseTo(2.27, 3)
  })

  it('scales displayed damage via Workshop × chassis tower damage', () => {
    const workshop = 1000
    const chassis = 2.27
    expect(
      computeWorkshopDisplayedDamagePreBerserker(workshop, {
        chassisTowerDamageMultiplier: chassis,
      }),
    ).toBe(workshop * chassis)
  })

  it('scales health display by armor chassis mult', () => {
    const level = 50
    const chassis = 2.27
    const base = workshopHealthStatValue(level)
    const label = workshopDefenseStatDisplay('healthLevel', level, {
      armorTowerHealthMultiplier: chassis,
    })
    expect(label).toBe(formatCoinAbbrev(Math.round(base * chassis)))
  })

  it('does not apply generator Coin Bonus chassis to Cash Bonus (it boosts coins, not cash)', () => {
    const level = 10
    const base = workshopCashBonusStatMultiplier(level)
    // No lab/enhance opts → falls back to the plain workshop cash bonus display.
    const label = workshopUtilityStatDisplay('cashBonusLevel', level)
    expect(label).toBe(`x${base.toFixed(2)}`)
  })

})
