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
      1.4977,
      3,
    )
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(0, true)).toBe(1)
    expect(workshopDisplayedHealthRegenEnhancementMultiplier(61, false)).toBe(1)
  })

  // Game values 46.10/47.47/48.88B/sec across L5820/5830/5840. The base-regen GOD table is
  // stored to 2 decimals while the game multiplies at full precision, so same-tier points
  // disagree by ~0.0009 in the implied enhance term; the calibrated constant lands every point
  // within 0.01B/sec (the 2-decimal display floor).
  it('matches player save overlays at workshop L5840 within the rounding floor', () => {
    expect(workshopHealthRegenStatValue(5840)).toBeCloseTo(6_370_000_000, -6)
    const enhance = workshopDisplayedHealthRegenEnhancementMultiplier(61, true)
    expect(enhance).toBeCloseTo(1.4977, 3)
    expect(
      workshopDisplayedHealthRegenStatDisplay(5840, {
        healthRegenCardMultiplier: 2.6,
        relicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('48.87B/sec')
    expect(
      workshopDefenseStatDisplay('healthRegenLevel', 5840, {
        healthRegenCardMultiplier: 2.6,
        healthRegenRelicsBonus: 0.97,
        healthRegenEnhancementsMultiplier: enhance,
      }),
    ).toBe('48.87B/sec')
  })
})
