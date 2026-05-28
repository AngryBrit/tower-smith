import { describe, expect, it } from 'vitest'
import { defenseLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function defenseResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'DEFENSE RESEARCH',
        sectionSlug: 'defense-research',
        items: [
          { name: 'Health', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Health Regen', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Defense Absolute', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Defense %', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Orbs Speed', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Land Mine Damage', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Land Mine Decay', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Shockwave Size', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Orb Boss Hit', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Wall Health', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Wall Rebuild', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Wall Regen', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Wall Thorns', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Garlic Thorns', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

/** Sample save: ids 10–18 (first nine defense labs) and 126–129 (wall block). */
const SAMPLE_DEFENSE_LEVELS: Record<number, number> = {
  10: 80,
  11: 62,
  12: 11,
  13: 32,
  14: 20,
  18: 10,
  126: 50,
  127: 5,
  128: 18,
  129: 16,
  193: 10,
}

describe('defenseLabsToOverrides', () => {
  it('maps confirmed defense labs from researchLevel ids', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    for (const [id, level] of Object.entries(SAMPLE_DEFENSE_LEVELS)) {
      researchLevel[Number(id)] = level
    }
    const overrides = defenseLabsToOverrides(defenseResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(80)
    expect(overrides['0-1']).toBe(62)
    expect(overrides['0-2']).toBe(11)
    expect(overrides['0-3']).toBe(32)
    expect(overrides['0-4']).toBe(20)
    expect(overrides['0-5']).toBeUndefined()
    expect(overrides['0-8']).toBe(10)
    expect(overrides['0-9']).toBe(50)
    expect(overrides['0-10']).toBe(5)
    expect(overrides['0-11']).toBe(18)
    expect(overrides['0-12']).toBe(16)
    expect(overrides['0-13']).toBe(10)
  })
})
