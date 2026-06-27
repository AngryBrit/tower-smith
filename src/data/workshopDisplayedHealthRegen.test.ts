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

  it('uses a near-constant Health Regen+ excess term across observed tiers', () => {
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(61, true)).toBeCloseTo(
      1.49745,
      4,
    )
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(0, true)).toBe(1)
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(61, false)).toBe(1)
  })

  // Game values 46.10/47.47/48.88B/sec across L5820/5830/5840 with full-precision GOD base.
  it('matches player save overlays at workshop L5840', () => {
    expect(workshopHealthRegenStatValue(5840)).toBeCloseTo(6_373_117_241.88547, 0)
    const enhance = workshopDisplayedHealthRegenEnhancementMultiplier(61, true)
    expect(enhance).toBeCloseTo(1.49745, 4)
    expect(
      workshopDisplayedHealthRegenStatDisplay(5840, {
        healthRegenCardMultiplier: 2.6,
        relicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('48.88B/sec')
    expect(
      workshopDefenseStatDisplay('healthRegenLevel', 5840, {
        healthRegenCardMultiplier: 2.6,
        healthRegenRelicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('48.88B/sec')
  })
})
