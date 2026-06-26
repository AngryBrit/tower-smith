import { describe, expect, it } from 'vitest'
import { workshopDefenseStatDisplay } from './workshopDefense'
import {
  computeWorkshopDisplayedHealthRegen,
  workshopDisplayedHealthRegenEnhancementMultiplier,
  workshopDisplayedHealthRegenStatDisplay,
} from './workshopDisplayedHealthRegen'
import { workshopHealthRegenStatValue } from './workshopHealthRegen'

describe('workshopDisplayedHealthRegen', () => {
  it('wiki formula: Workshop × Lab × Card × (1+Relics) × Enhancement', () => {
    const workshop = 1000
    const opts = {
      healthRegenCardMultiplier: 1.5,
      relicsBonus: 0.1,
      healthRegenEnhancementsMultiplier: 1.25,
    }
    expect(computeWorkshopDisplayedHealthRegen(workshop, opts)).toBe(
      workshop * 1.5 * 1.1 * 1.25,
    )
  })

  it('uses partial Health Regen+ excess for the enhancement term', () => {
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(61, true)).toBeCloseTo(
      1.49723,
      3,
    )
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(0, true)).toBe(1)
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(61, false)).toBe(1)
  })

  it('matches player save overlays at workshop L5830 (game 47.47B/sec)', () => {
    expect(workshopHealthRegenStatValue(5830)).toBeCloseTo(6_190_000_000, -6)
    const enhance = workshopDisplayedHealthRegenEnhancementMultiplier(61, true)
    expect(enhance).toBeCloseTo(1.49723, 3)
    expect(
      workshopDisplayedHealthRegenStatDisplay(5830, {
        healthRegenCardMultiplier: 2.6,
        relicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('47.47B/sec')
    expect(
      workshopDefenseStatDisplay('healthRegenLevel', 5830, {
        healthRegenCardMultiplier: 2.6,
        healthRegenRelicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('47.47B/sec')
  })
})
