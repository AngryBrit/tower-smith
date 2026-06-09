import { describe, expect, it } from 'vitest'
import { workshopBotStatDisplay } from './workshopBots'
import { researchTimeForNextUpgrade } from '../types/research'
import type { ResearchItem } from '../types/research'
import {
  combinedLabsSpeedMultiplier,
  enrichAttackLabDisplayOpts,
  enrichBotLabDisplayOpts,
  enrichDefenseStatDisplayOpts,
  workshopRelicsLabSpeedMultiplier,
} from './workshopRelicWorkshopDisplay'
import { workshopDamagePerMeterStatDisplay } from './workshopDamagePerMeter'
import {
  workshopRelicsDisplayedAttackSpeedBonusPercent,
  workshopRelicsDisplayedAttackSpeedRelicMultiplier,
  workshopRelicsDisplayedDamageBonusFraction,
} from './workshopRelicStats'
import { workshopRelicsDamageBonusFraction } from './workshopRelics'

describe('workshopRelicWorkshopDisplay', () => {
  it('does not merge health relic % into defense lab health multiplier', () => {
    const owned = new Set(['t_ix_fusion'])
    const opts = enrichDefenseStatDisplayOpts({ healthLabMultiplier: 2 }, owned)
    expect(opts?.healthLabMultiplier).toBeCloseTo(2)
  })

  it('does not merge health regen relic % into defense lab regen multiplier', () => {
    const owned = new Set(['t_viii_graviton'])
    const opts = enrichDefenseStatDisplayOpts({ healthRegenLabMultiplier: 2 }, owned)
    expect(opts?.healthRegenLabMultiplier).toBeCloseTo(2)
  })

  it('puts thorns relic % on thornDamageRelicsPercentPoints only', () => {
    const owned = new Set(['angler_fish'])
    const opts = enrichDefenseStatDisplayOpts(undefined, owned)
    expect(opts?.thornDamageRelicsPercentPoints).toBe(2)
  })

  it('stacks owned lab-speed relic % as a labs multiplier', () => {
    expect(workshopRelicsLabSpeedMultiplier(new Set(['t_xii_chrono']))).toBeCloseTo(1.1)
    expect(
      workshopRelicsLabSpeedMultiplier(new Set(['t_xii_chrono', 't_ii_lumin'])),
    ).toBeCloseTo(1.115)
  })

  it('wiki lab speed: research × relics (e.g. ×2.98 × ×1.25 = ×3.725)', () => {
    const researchMult = 2.98
    const relicMult = 1.25
    expect(researchMult * relicMult).toBeCloseTo(3.725, 3)
    expect(combinedLabsSpeedMultiplier(researchMult, new Set())).toBeCloseTo(2.98)
    const owned = new Set(['t_xii_chrono', 't_xviii_singularity', 't_xxi_eclipse'])
    expect(workshopRelicsLabSpeedMultiplier(owned)).toBeCloseTo(1.3)
    expect(combinedLabsSpeedMultiplier(researchMult, owned)).toBeCloseTo(2.98 * 1.3, 3)

    const workshopItem: ResearchItem = {
      name: 'Workshop Attack Discount',
      level: 'Lv.0',
      benefit: '',
      time: '—',
      cost: '—',
      state: 'default',
    }
    const max = 99
    const timeResearchOnly = researchTimeForNextUpgrade(workshopItem, 1, max, researchMult)
    const timeCombined = researchTimeForNextUpgrade(
      workshopItem,
      1,
      max,
      researchMult * relicMult,
    )
    expect(timeCombined).not.toBe(timeResearchOnly)
  })

  it('applies owned bot-range relic meters to all bot range rows', () => {
    const opts = enrichBotLabDisplayOpts(undefined, new Set(['plasma_globe']))
    expect(opts?.botRangeRelicMeters).toBe(1)
    expect(workshopBotStatDisplay('goldenBotRangeLevel', 20, opts)).toBe('61.00m')
    expect(workshopBotStatDisplay('flameBotRangeLevel', 16, opts)).toBe('91.00m')
  })

  it('keeps displayed-damage relic fraction in sync with parsed bonuses', () => {
    const owned = new Set(['t_iv_harmonic', 't_viii_graviton'])
    expect(workshopRelicsDisplayedDamageBonusFraction(owned)).toBeCloseTo(0.07)
    expect(workshopRelicsDamageBonusFraction(owned)).toBeCloseTo(0.07)
  })

  it('does not merge damage/meter relic % into the workshop ×/m card (lab only)', () => {
    const labOnly = enrichAttackLabDisplayOpts(
      { damagePerMeterLabMultiplier: 1.1 },
      new Set(),
    )
    const withRelic = enrichAttackLabDisplayOpts(
      { damagePerMeterLabMultiplier: 1.1 },
      new Set(['t_viii_graviton']),
    )
    expect(labOnly?.damagePerMeterLabMultiplier).toBeCloseTo(1.1)
    expect(withRelic?.damagePerMeterLabMultiplier).toBeCloseTo(1.1)
    const label = workshopDamagePerMeterStatDisplay(
      180,
      withRelic?.damagePerMeterLabMultiplier,
    )
    expect(label).toBe(workshopDamagePerMeterStatDisplay(180, 1.1))
    expect(label).not.toBe(workshopDamagePerMeterStatDisplay(180, 1.1 * 1.05))
  })

  it('adds partial damage/meter relic % to displayed attack speed relic term', () => {
    expect(10 + 45 * (0.28 / 45)).toBeCloseTo(10.28, 4)
    const owned = new Set(['t_iv_harmonic', 't_viii_graviton'])
    expect(workshopRelicsDisplayedAttackSpeedBonusPercent(owned)).toBeGreaterThan(0)
    expect(workshopRelicsDisplayedAttackSpeedRelicMultiplier(owned)).toBeGreaterThan(1)
  })
})
