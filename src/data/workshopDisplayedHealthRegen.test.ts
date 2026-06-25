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
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(60, true)).toBeCloseTo(
      1.49757,
      3,
    )
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(0, true)).toBe(1)
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(60, false)).toBe(1)
  })

  it('matches player save overlays at workshop L5820 (game 46.10B/sec)', () => {
    expect(workshopHealthRegenStatValue(5820)).toBeCloseTo(6_010_000_000, -6)
    const enhance = workshopDisplayedHealthRegenEnhancementMultiplier(60, true)
    expect(enhance).toBeCloseTo(1.49757, 3)
    expect(
      workshopDisplayedHealthRegenStatDisplay(5820, {
        healthRegenCardMultiplier: 2.6,
        relicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('46.10B/sec')
    expect(
      workshopDefenseStatDisplay('healthRegenLevel', 5820, {
        healthRegenCardMultiplier: 2.6,
        healthRegenRelicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('46.10B/sec')
  })
})
