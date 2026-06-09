import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import {
  computeWorkshopDisplayedHealth,
  workshopDisplayedHealthEnhancementMultiplier,
  workshopDisplayedHealthStatDisplay,
} from './workshopDisplayedHealth'
import { workshopHealthStatValue } from './workshopHealth'
import { workshopRelicsDisplayedHealthBonusFraction } from './workshopRelicStats'

describe('workshopDisplayedHealth', () => {
  it('wiki formula: Workshop × Lab × Card × (1+Relics) × Enhancement', () => {
    const workshop = 1000
    const opts = {
      healthLabMultiplier: 2,
      healthCardMultiplier: 1.5,
      relicsBonus: 0.1,
      healthEnhancementsMultiplier: 1.25,
    }
    expect(computeWorkshopDisplayedHealth(workshop, opts)).toBe(
      workshop * 2 * 1.5 * 1.1 * 1.25,
    )
  })

  it('adds partial Health Regen+ excess to Health+ enhancement tier', () => {
    expect(workshopDisplayedHealthEnhancementMultiplier(50, 60, true)).toBeCloseTo(
      1.687,
      3,
    )
    expect(workshopDisplayedHealthEnhancementMultiplier(50, 0, true)).toBe(1.5)
    expect(workshopDisplayedHealthEnhancementMultiplier(0, 60, true)).toBeCloseTo(
      1 + 0.6 * (0.18675 / 0.6),
      3,
    )
  })

  it('enhancement is ×1 when the Workshop Enhancements lab is locked', () => {
    expect(workshopDisplayedHealthEnhancementMultiplier(99, 99, false)).toBe(1)
    expect(workshopDisplayedHealthEnhancementMultiplier(0, 0, true)).toBe(1)
  })

  it('sums health and health regen relic % into (1 + Relics)', () => {
    const owned = new Set(['t_ix_fusion', 't_viii_graviton'])
    expect(workshopRelicsDisplayedHealthBonusFraction(owned)).toBeCloseTo(0.05)
  })

  it('matches player save overlays at workshop L5500', () => {
    expect(workshopHealthStatValue(5500)).toBe(2_500_000_000)
    const enhance = workshopDisplayedHealthEnhancementMultiplier(50, 60, true)
    expect(enhance).toBeCloseTo(1.687, 3)
    expect(
      workshopDisplayedHealthStatDisplay(5500, {
        armorTowerHealthMultiplier: 2.27,
        healthLabMultiplier: 3.4,
        healthCardMultiplier: 4,
        relicsBonus: 0.97,
        healthEnhancementsMultiplier: enhance,
      }),
    ).toBe('256.46B')
    expect(
      workshopDefenseStatDisplay('healthLevel', 5500, {
        armorTowerHealthMultiplier: 2.27,
        healthLabMultiplier: 3.4,
        healthCardMultiplier: 4,
        healthRelicsBonus: 0.97,
        healthEnhancementsMultiplier: enhance,
      }),
    ).toBe('256.46B')
  })
})
