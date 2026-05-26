import { describe, expect, it } from 'vitest'
import relicRows from './workshopRelics.generated.json'
import {
  formatRelicStatValue,
  parseWorkshopRelicEffect,
  workshopRelicsActiveBonusPercent,
  workshopRelicsBonusTable,
} from './workshopRelicStats'

describe('workshopRelicStats', () => {
  it('parses common relic effect lines', () => {
    expect(parseWorkshopRelicEffect('Increase lab speed by 1.5%')).toEqual({
      statId: 'labSpeed',
      value: 1.5,
      unit: 'percent',
      sign: 1,
    })
    expect(parseWorkshopRelicEffect('Increase bot range by 2m')).toEqual({
      statId: 'botRange',
      value: 2,
      unit: 'meters',
      sign: 1,
    })
    expect(parseWorkshopRelicEffect('Decrease Wall Rebuild Time by 2s')).toEqual({
      statId: 'wallRebuild',
      value: 2,
      unit: 'seconds',
      sign: -1,
    })
  })

  it('parses every catalog relic description', () => {
    const unparsed: string[] = []
    for (const row of relicRows) {
      if (!parseWorkshopRelicEffect(row.description)) {
        unparsed.push(row.description)
      }
    }
    expect(unparsed).toEqual([])
  })

  it('sums owned health bonuses', () => {
    expect(workshopRelicsActiveBonusPercent(new Set(['t_ix_fusion']), 'health')).toBe(5)
    expect(workshopRelicsActiveBonusPercent(new Set(['t_ix_fusion']), 'damage')).toBe(0)
  })

  it('aggregates owned bonuses by stat', () => {
    const table = workshopRelicsBonusTable(new Set(['t_iv_harmonic', 't_viii_graviton']))
    const damage = table
      .flatMap((g) => g.rows)
      .find((row) => row.stat.id === 'damage')!
    const dpm = table
      .flatMap((g) => g.rows)
      .find((row) => row.stat.id === 'damagePerMeter')!
    expect(damage.active).toBe(2)
    expect(dpm.active).toBe(5)
    expect(damage.activeCount).toBe(1)
    expect(dpm.activeCount).toBe(1)
  })

  it('formats units', () => {
    expect(formatRelicStatValue(2, 'meters')).toBe('2m')
    expect(formatRelicStatValue(-2, 'seconds')).toBe('-2s')
    expect(formatRelicStatValue(12.34, 'percent')).toBe('12.3%')
  })
})
