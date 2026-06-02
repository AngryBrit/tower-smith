import { describe, expect, it } from 'vitest'
import { perksLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function perksResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'PERKS RESEARCH',
        sectionSlug: 'perks-research',
        items: [
          { name: 'Unlock Perks', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Waves Required', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Auto Pick Perks', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Standard Perks Bonus',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Perk Option Quantity',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          { name: 'First Perk Choice', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Ban Perks', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Improve Trade-off Perks',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          { name: 'Auto Pick Ranking', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

/** Sample save perk slots (player-save-field-dump.json). */
const SAMPLE_PERKS_LEVELS: Record<number, number> = {
  80: 1,
  81: 19,
  82: 1,
  83: 17,
  84: 2,
  85: 1,
  87: 4,
  88: 10,
  153: 5,
}

describe('perksLabsToOverrides', () => {
  it('maps confirmed perks labs from researchLevel ids', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    for (const [id, level] of Object.entries(SAMPLE_PERKS_LEVELS)) {
      researchLevel[Number(id)] = level
    }
    const overrides = perksLabsToOverrides(perksResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(1)
    expect(overrides['0-1']).toBe(19)
    expect(overrides['0-2']).toBe(1)
    expect(overrides['0-3']).toBe(17)
    expect(overrides['0-4']).toBe(2)
    expect(overrides['0-5']).toBe(1)
    expect(overrides['0-6']).toBe(4)
    expect(overrides['0-7']).toBe(10)
    expect(overrides['0-8']).toBe(5)
  })
})
