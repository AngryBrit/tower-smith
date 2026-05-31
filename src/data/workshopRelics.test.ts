import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_RELIC_COUNT,
  parseRelicOwnedIdsJson,
  parseRelicOwnedIdsCell,
  sanitizeRelicOwnedIds,
  workshopRelicDef,
  workshopRelicsDamageBonusFraction,
  workshopRelicsDamageBonusPercent,
  workshopRelicsForUnlockGroup,
  workshopRelicsGroupedByRarity,
} from './workshopRelics'

describe('workshopRelics', () => {
  it('loads wiki catalog', () => {
    expect(WORKSHOP_RELIC_COUNT).toBeGreaterThan(200)
    expect(workshopRelicDef('t_xiv_arcane')?.damagePercent).toBe(10)
  })

  it('sums owned damage relic bonuses', () => {
    const owned = new Set(['t_iv_harmonic', 't_xiv_arcane'])
    expect(workshopRelicsDamageBonusPercent(owned)).toBe(12)
    expect(workshopRelicsDamageBonusFraction(owned)).toBeCloseTo(0.12)
  })

  it('sanitizeRelicOwnedIds drops unknown ids', () => {
    expect(sanitizeRelicOwnedIds(['t_iv_harmonic', 'bogus', 't_iv_harmonic'])).toEqual([
      't_iv_harmonic',
    ])
  })

  it('parseRelicOwnedIdsCell accepts JSON strings and legacy bracket lists', () => {
    expect(parseRelicOwnedIdsJson('["t_iv_harmonic","t_xiv_arcane"]')).toEqual([
      't_iv_harmonic',
      't_xiv_arcane',
    ])
    expect(parseRelicOwnedIdsCell('[t_iv_harmonic,t_xiv_arcane]')).toEqual([
      't_iv_harmonic',
      't_xiv_arcane',
    ])
  })

  it('groups filtered relics by rarity in tier order', () => {
    const milestone = workshopRelicsForUnlockGroup('milestone')
    const groups = workshopRelicsGroupedByRarity(milestone)
    expect(groups.map((g) => g.rarity)).toEqual(['rare', 'epic', 'legendary'])
    expect(groups[0]!.relics.every((r) => r.rarity === 'rare')).toBe(true)
  })

})
