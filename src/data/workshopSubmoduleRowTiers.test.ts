import { describe, expect, it } from 'vitest'
import { WORKSHOP_SUBMODULE_SECTIONS } from './workshopSubmoduleCatalog'
import { conceptualTierFromEnd, wikiTiersPresent } from './workshopSubmoduleRowTiers'

function row(slot: keyof typeof WORKSHOP_SUBMODULE_SECTIONS, label: string) {
  const found = WORKSHOP_SUBMODULE_SECTIONS[slot].rows.find((r) => r.label === label)
  if (!found) throw new Error(`missing row ${label}`)
  return found
}

describe('workshopSubmoduleRowTiers', () => {
  it('lists present wiki tiers in common → ancestral order', () => {
    expect(wikiTiersPresent(row('cannon', 'Attack Speed'))).toEqual([
      'common',
      'rare',
      'epic',
      'legendary',
      'mythic',
      'ancestral',
    ])
    expect(wikiTiersPresent(row('cannon', 'Multishot Chance [%]'))).toEqual([
      'rare',
      'epic',
      'legendary',
      'mythic',
      'ancestral',
    ])
    expect(wikiTiersPresent(row('armor', 'Orbs'))).toEqual(['mythic', 'ancestral'])
    expect(wikiTiersPresent(row('generator', 'Package Chance [%]'))).toEqual([
      'epic',
      'legendary',
      'mythic',
      'ancestral',
    ])
  })

  it('anchors conceptual tiers from the highest present wiki column backward', () => {
    const multishot = row('cannon', 'Multishot Chance [%]')
    expect(conceptualTierFromEnd(multishot, 0)).toBe('ancestral')
    expect(conceptualTierFromEnd(multishot, 1)).toBe('mythic')
    expect(conceptualTierFromEnd(multishot, 4)).toBe('rare')

    const orbs = row('armor', 'Orbs')
    expect(conceptualTierFromEnd(orbs, 0)).toBe('ancestral')
    expect(conceptualTierFromEnd(orbs, 1)).toBe('mythic')
  })
})
