import { describe, expect, it } from 'vitest'
import { mainLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function mainResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'MAIN RESEARCH',
        sectionSlug: 'main-research',
        items: [
          { name: 'Game Speed', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Starting Cash', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Workshop Attack Discount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Workshop Defense Discount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Workshop Utility Discount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          { name: 'Labs Coin Discount', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Labs Speed', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Buy Multiplier', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'More Round Stats', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Target Priority', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Card Presets', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Workshop Respec', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

/** Sample save: researchLevel[30..41] match first twelve main labs (UI order). */
const SAMPLE_MAIN_LEVELS: Record<number, number> = {
  30: 7,
  32: 2,
  33: 2,
  34: 2,
  35: 4,
  36: 88,
  37: 2,
  38: 1,
  39: 1,
  40: 1,
  41: 1,
}

describe('mainLabsToOverrides', () => {
  it('maps confirmed main labs from researchLevel ids', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    for (const [id, level] of Object.entries(SAMPLE_MAIN_LEVELS)) {
      researchLevel[Number(id)] = level
    }
    const overrides = mainLabsToOverrides(mainResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(7)
    expect(overrides['0-1']).toBeUndefined()
    expect(overrides['0-2']).toBe(2)
    expect(overrides['0-5']).toBe(4)
    expect(overrides['0-6']).toBe(88)
    expect(overrides['0-11']).toBe(1)
  })
})
