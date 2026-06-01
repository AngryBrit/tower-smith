import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import { workshopUtilityStatDisplay } from './workshopUtility'
import { workshopCriticalFactorStatDisplay } from './workshopCriticalFactor'
import { workshopOrbSpeedStatMultiplier } from './workshopOrbSpeed'

describe('workshop lab display wiring', () => {
  it('adds Orbs Speed lab bonus to workshop orb speed', () => {
    const level = 5
    expect(workshopDefenseStatDisplay('orbSpeedLevel', level, { orbSpeedLabPlus: 0.5 })).toBe(
      (workshopOrbSpeedStatMultiplier(level) + 0.5).toFixed(2),
    )
  })

  it('multiplies utility cash bonus by lab', () => {
    expect(workshopUtilityStatDisplay('cashBonusLevel', 10, { cashBonusLabMultiplier: 2 })).toBe(
      'x2.20',
    )
  })

  it('multiplies critical factor by lab', () => {
    expect(workshopCriticalFactorStatDisplay(0, 1.3)).toBe('×1.56')
  })
})
