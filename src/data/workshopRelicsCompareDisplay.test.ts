import { describe, expect, it } from 'vitest'
import {
  formatRelicOwnedIdsCompareCell,
  relicOwnedIdsCompareKey,
  relicDisplayName,
} from './workshopRelics'

describe('workshopRelics compare display', () => {
  it('maps relic ids to catalog display names', () => {
    expect(relicDisplayName('copper_badge')).toBe('Copper Badge')
    expect(relicDisplayName('t_iv_harmonic')).toBe('T:IV Harmonic')
  })

  it('summarizes long owned-relic lists for compare cells', () => {
    const ids = [
      'copper_badge',
      'silver_badge',
      'gold_badge',
      'platinum_badge',
      't_i_flux',
      't_iv_harmonic',
    ]
    const cell = formatRelicOwnedIdsCompareCell(ids)
    expect(cell.display).toMatch(/^6 relics \(.+, …\)$/)
    expect(cell.display).toContain('Copper Badge')
    expect(cell.title).toContain('T:IV Harmonic')
    expect(cell.title).not.toContain('copper_badge')
  })

  it('uses order-independent compare keys', () => {
    expect(relicOwnedIdsCompareKey(['a', 'b'])).toBe(relicOwnedIdsCompareKey(['b', 'a']))
  })
})
