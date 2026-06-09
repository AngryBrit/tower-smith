import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { formatCoinAbbrev } from '../labCosts'
import { workshopDamageStatAtLevel } from './workshopDamage'
import {
  computeWorkshopDisplayedDamage,
  computeWorkshopDisplayedDamagePreBerserker,
  workshopDamageDisplayOptsFromPersisted,
  workshopDisplayedDamageFromWorkshopLevel,
  workshopDisplayedDamagePerkMultiplier,
} from './workshopDisplayedDamage'
import { workshopBerserkerDisplayedDamageAdd } from './workshopSimCards'
import { workshopDamageStatDisplay } from './workshopDamage'
import {
  WORKSHOP_DISPLAYED_DAMAGE_DPM_LAB_EXCESS_FRACTION,
  attackResearchDisplayedDamageDpmLabMultiplier,
} from '../types/research'

describe('workshopDisplayedDamage', () => {
  it('matches wiki product at max workshop + ×3 lab (213.33 M)', () => {
    const workshop = workshopDamageStatAtLevel(6000)
    expect(workshop).toBeCloseTo(71.11e6, -3)
    const displayed = computeWorkshopDisplayedDamage(workshop, { labMultiplier: 3 })
    expect(displayed).toBeCloseTo(213.33e6, -3)
    expect(formatCoinAbbrev(displayed)).toBe('213.33M')
  })

  it('wiki formula: Workshop × Lab × Card × (1+Relics) × (1+Cannon%) × Enhancements × Perk + Berserker', () => {
    const workshop = 1000
    const opts = {
      labMultiplier: 2,
      damageCardMultiplier: 1.5,
      relicsBonus: 0.1,
      cannonModulePercent: 0.2,
      enhancementsMultiplier: 1.01,
      perkDamageQuantity: 2,
      standardPerkBonus: 0.25,
      berserkerDamageAdd: 500,
    }
    const perk = workshopDisplayedDamagePerkMultiplier(opts)
    expect(perk).toBe(1.625)
    const pre = computeWorkshopDisplayedDamagePreBerserker(workshop, opts)
    expect(pre).toBe(workshop * 2 * 1.5 * 1.1 * 1.2 * 1.01 * perk)
    expect(computeWorkshopDisplayedDamage(workshop, opts)).toBe(pre + 500)
  })

  it('folds cannon chassis Tower Damage into Workshop (no extra term)', () => {
    const workshop = 1000
    const pre = computeWorkshopDisplayedDamagePreBerserker(workshop, {
      chassisTowerDamageMultiplier: 2.27,
      labMultiplier: 2,
    })
    expect(pre).toBe(workshop * 2.27 * 2)
  })

  it('workshopDamageStatDisplay accepts legacy lab-only number', () => {
    const level = 1
    expect(workshopDamageStatDisplay(level, 1.02)).toBe(
      formatCoinAbbrev(workshopDamageStatAtLevel(level) * 1.02),
    )
  })

  it('workshopDisplayedDamageFromWorkshopLevel without opts uses neutral wiki factors', () => {
    const workshop = workshopDamageStatAtLevel(100)
    expect(workshopDisplayedDamageFromWorkshopLevel(100)).toBe(workshop)
    expect(workshopDisplayedDamageFromWorkshopLevel(100, {})).toBe(workshop)
  })

  it('applies Damage × partial DPM × Attack Speed labs from gameResearchLevel when research is null', () => {
    const ws = { ...defaultWorkshopPersisted(), damageLevel: 100 }
    const opts = workshopDamageDisplayOptsFromPersisted(ws, null, {}, [
      50,
      40,
      0,
      0,
      30,
    ])
    const dmg = 1 + 0.02 * 50
    const as = 1 + 0.02 * 40
    const dpmRaw = 1 + 0.02 * 30
    const dpm = 1 + (dpmRaw - 1) * WORKSHOP_DISPLAYED_DAMAGE_DPM_LAB_EXCESS_FRACTION
    expect(opts.labMultiplier).toBeCloseTo(dmg * as * dpm, 6)
    expect(opts.labDamageMultiplier).toBeCloseTo(dmg, 6)
    expect(opts.labDamagePerMeterMultiplier).toBeCloseTo(dpm, 6)
    expect(opts.labAttackSpeedMultiplier).toBeCloseTo(as, 6)
  })

  it('workshopDamageDisplayOptsFromPersisted always includes full wiki factors', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      damageLevel: 100,
      simPerkDamageQuantity: 2,
      simRelicsBonusFraction: 0.1,
    }
    const opts = workshopDamageDisplayOptsFromPersisted(ws, null, {})
    expect(opts.labMultiplier).toBe(1)
    expect(opts.perkDamageQuantity).toBe(2)
    expect(opts.relicsBonus).toBe(0.1)
    const workshop = workshopDamageStatAtLevel(100)
    expect(computeWorkshopDisplayedDamage(workshop, opts)).toBeGreaterThan(workshop)
  })

  it('partial DPM lab at ×1.28 contributes ×1.231 to displayed-damage Lab', () => {
    expect(attackResearchDisplayedDamageDpmLabMultiplier(1.28)).toBeCloseTo(1.231, 6)
  })

  it('in-game displayed damage at workshop L5500 with typical endgame overlays', () => {
    const workshop = workshopDamageStatAtLevel(5500)
    expect(workshop).toBe(47_060_000)
    const dpm = attackResearchDisplayedDamageDpmLabMultiplier(1.28)
    const lab = 1.92 * dpm * 2.68
    const opts = {
      chassisTowerDamageMultiplier: 2.46,
      labMultiplier: lab,
      labDamageMultiplier: 1.92,
      labDamagePerMeterMultiplier: dpm,
      labAttackSpeedMultiplier: 2.68,
      damageCardMultiplier: 4,
      relicsBonus: 0.95,
      enhancementsMultiplier: 1.4,
      perkDamageQuantity: 1,
      standardPerkBonus: 0.0174,
    }
    expect(workshopDamageStatDisplay(5500, opts)).toBe('9.37B')
  })

  it('wiki berserker: product 1000 + capped add 7000', () => {
    const pre = computeWorkshopDisplayedDamagePreBerserker(1000, {
      labMultiplier: 1,
      perkDamageQuantity: 0,
    })
    const add = workshopBerserkerDisplayedDamageAdd(pre, 1_000_000, 1)
    expect(add).toBe(7000)
    expect(computeWorkshopDisplayedDamage(1000, { berserkerDamageAdd: add })).toBe(
      8000,
    )
  })
})
