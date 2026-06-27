import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import {
  computeWorkshopDisplayedHealth,
  workshopDisplayedHealthEnhancementMultiplier,
  workshopDisplayedHealthSubmoduleMultiplier,
  workshopDisplayedHealthStatDisplay,
} from './workshopDisplayedHealth'
import { workshopHealthStatValue } from './workshopHealth'
import { workshopRelicsDisplayedHealthBonusFraction } from './workshopRelicStats'

describe('workshopDisplayedHealth', () => {
  it('wiki formula: Workshop × Lab × Card × (1+Relics) × Enhancement × Submodule', () => {
    const workshop = 1000
    const opts = {
      healthLabMultiplier: 2,
      healthCardMultiplier: 1.5,
      relicsBonus: 0.1,
      healthEnhancementsMultiplier: 1.25,
      submoduleHealthRegenPercentBonus: 200,
    }
    const submodule = workshopDisplayedHealthSubmoduleMultiplier(
      opts.submoduleHealthRegenPercentBonus,
    )
    expect(computeWorkshopDisplayedHealth(workshop, opts)).toBe(
      workshop * 2 * 1.5 * 1.1 * 1.25 * submodule,
    )
  })

  it('uses Health+ only for the enhancement term (Health Regen+ omitted)', () => {
    expect(workshopDisplayedHealthEnhancementMultiplier(50, true)).toBeCloseTo(1.5, 3)
    expect(workshopDisplayedHealthEnhancementMultiplier(0, true)).toBe(1)
  })

  it('applies partial armor submodule Health Regen [%] to displayed health', () => {
    expect(workshopDisplayedHealthSubmoduleMultiplier(200)).toBeCloseTo(1.12622, 5)
    expect(workshopDisplayedHealthSubmoduleMultiplier(0)).toBe(1)
    expect(workshopDisplayedHealthSubmoduleMultiplier(undefined)).toBe(1)
  })

  it('enhancement is ×1 when the Workshop Enhancements lab is locked', () => {
    expect(workshopDisplayedHealthEnhancementMultiplier(99, false)).toBe(1)
    expect(workshopDisplayedHealthEnhancementMultiplier(0, true)).toBe(1)
  })

  it('sums health and health regen relic % into (1 + Relics)', () => {
    const owned = new Set(['t_ix_fusion', 't_viii_graviton'])
    expect(workshopRelicsDisplayedHealthBonusFraction(owned)).toBeCloseTo(0.05)
  })

  it('matches player save overlays at workshop L5600 (game 599.77B)', () => {
    expect(workshopHealthStatValue(5600)).toBeCloseTo(3_053_328_257.82416, -6)
    const enhance = workshopDisplayedHealthEnhancementMultiplier(50, true)
    expect(enhance).toBeCloseTo(1.5, 3)
    const submodule = workshopDisplayedHealthSubmoduleMultiplier(200)
    expect(submodule).toBeCloseTo(1.12622, 5)
    expect(
      workshopDisplayedHealthStatDisplay(5600, {
        armorTowerHealthMultiplier: 4.34,
        healthLabMultiplier: 3.4,
        healthCardMultiplier: 4,
        relicsBonus: 0.97,
        healthEnhancementsMultiplier: enhance,
        submoduleHealthRegenPercentBonus: 200,
      }),
    ).toBe('599.77B')
    expect(
      workshopDefenseStatDisplay('healthLevel', 5600, {
        armorTowerHealthMultiplier: 4.34,
        healthLabMultiplier: 3.4,
        healthCardMultiplier: 4,
        healthRelicsBonus: 0.97,
        healthEnhancementsMultiplier: enhance,
        submodule: { healthRegenPercentBonus: 200 },
      }),
    ).toBe('599.77B')
  })
})
