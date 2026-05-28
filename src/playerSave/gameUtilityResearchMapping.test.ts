import { describe, expect, it } from 'vitest'
import { utilityLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function utilityResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'UTILITY RESEARCH',
        sectionSlug: 'utility-research',
        items: [
          { name: 'Cash Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Cash / Wave', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Coins / Kill Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Coins / Wave', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Interest', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Max Interest', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Package After Boss', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Recovery Package Amount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          { name: 'Recovery Package Max', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Recovery Package Chance',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Enemy Attack Level Skip',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Enemy Health Level Skip',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
        ],
      },
    ],
  }
}

/** Sample save: researchLevel[20..29] match first ten utility labs (UI order). */
const SAMPLE_UTILITY_LEVELS: Record<number, number> = {
  20: 27,
  21: 5,
  22: 89,
  23: 26,
  26: 1,
  124: 20,
  125: 19,
}

describe('utilityLabsToOverrides', () => {
  it('maps confirmed utility labs from researchLevel ids', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    for (const [id, level] of Object.entries(SAMPLE_UTILITY_LEVELS)) {
      researchLevel[Number(id)] = level
    }
    const overrides = utilityLabsToOverrides(utilityResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(27)
    expect(overrides['0-1']).toBe(5)
    expect(overrides['0-2']).toBe(89)
    expect(overrides['0-3']).toBe(26)
    expect(overrides['0-4']).toBeUndefined()
    expect(overrides['0-6']).toBe(1)
    expect(overrides['0-10']).toBe(20)
    expect(overrides['0-11']).toBe(19)
  })
})
