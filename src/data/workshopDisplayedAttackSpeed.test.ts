import { describe, expect, it } from 'vitest'
import { workshopAttackSpeedStatValue } from './workshopAttackSpeed'
import {
  computeWorkshopDisplayedAttackSpeed,
  workshopDisplayedAttackSpeedFromWorkshopLevel,
} from './workshopDisplayedAttackSpeed'
import { workshopAttackSpeedCardMultiplier } from './workshopSimCards'
import { workshopAttackSpeedStatDisplay } from './workshopAttackSpeed'
import { workshopEnhanceAttackSpeedMultiplier } from './workshopEnhanceAttack'
import {
  WORKSHOP_DISPLAYED_ATTACK_SPEED_DPM_RELIC_SHARE,
  workshopRelicsDisplayedAttackSpeedRelicMultiplier,
} from './workshopRelicStats'

describe('workshopDisplayedAttackSpeed', () => {
  it('matches wiki formula order: (W×L×C + sub) × enh', () => {
    const workshop = 10
    const v = computeWorkshopDisplayedAttackSpeed(workshop, {
      labMultiplier: 2,
      attackSpeedCardMultiplier: 1.5,
      moduleSubEffect: 0.7,
      enhancementsMultiplier: 1.01,
    })
    expect(v).toBe((workshop * 2 * 1.5 + 0.7) * 1.01)
  })

  it('workshop base is not rounded before formula', () => {
    expect(workshopAttackSpeedStatValue(1)).toBeCloseTo(1.05, 2)
    expect(workshopAttackSpeedStatValue(3)).toBeCloseTo(1.15, 2)
  })

  it('attack speed card stars match wiki multipliers', () => {
    expect(workshopAttackSpeedCardMultiplier(0)).toBe(1)
    expect(workshopAttackSpeedCardMultiplier(1)).toBe(1.25)
    expect(workshopAttackSpeedCardMultiplier(7)).toBe(2.15)
  })

  it('max workshop + lab + card with ancestral submodule and max enhance', () => {
    const workshop = workshopAttackSpeedStatValue(99)
    expect(workshop).toBeCloseTo(5.95, 2)
    const v = computeWorkshopDisplayedAttackSpeed(workshop, {
      labMultiplier: 2.98,
      attackSpeedCardMultiplier: 2.15,
      moduleSubEffect: 5,
      enhancementsMultiplier: workshopEnhanceAttackSpeedMultiplier(75),
    })
    expect(v).toBeCloseTo((workshop * 2.98 * 2.15 + 5) * 1.75, 1)
  })

  it('relic multiplier uses attack-speed relics only (not damage/meter)', () => {
    expect(WORKSHOP_DISPLAYED_ATTACK_SPEED_DPM_RELIC_SHARE).toBe(0)
    expect(10 + 45 * WORKSHOP_DISPLAYED_ATTACK_SPEED_DPM_RELIC_SHARE).toBe(10)
    expect(workshopRelicsDisplayedAttackSpeedRelicMultiplier(new Set())).toBe(1)
    const workshop = 5.95
    const v = computeWorkshopDisplayedAttackSpeed(workshop, {
      labMultiplier: 2.68,
      attackSpeedCardMultiplier: 2.15,
      relicMultiplier: 1.14,
      moduleSubEffect: 0,
      enhancementsMultiplier: 1,
    })
    expect(v).toBeCloseTo(39.08, 2)
  })

  it('workshopAttackSpeedStatDisplay uses formula when opts passed', () => {
    const level = 10
    const opts = { labMultiplier: 1.02 }
    expect(workshopAttackSpeedStatDisplay(level, opts)).toBe(
      workshopDisplayedAttackSpeedFromWorkshopLevel(level, opts).toFixed(2),
    )
  })
})
