import { describe, expect, it } from 'vitest'
import { attackLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function attackResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'ATTACK RESEARCH',
        sectionSlug: 'attack-research',
        items: [
          { name: 'Damage', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Attack Speed', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Critical Factor', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Range', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Damage / Meter', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Super Crit Chance', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Super Crit Multi', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Max Rend Armor Multiplier',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          { name: 'Light Speed Shots', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

/** Sample save: researchLevel[0..4] match attack UI order; id 10 is defense Health (80). */
const SAMPLE_ATTACK_LEVELS: Record<number, number> = {
  0: 46,
  1: 84,
  2: 16,
  4: 14,
  150: 1,
}

describe('attackLabsToOverrides', () => {
  it('maps confirmed attack labs from researchLevel ids', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    for (const [id, level] of Object.entries(SAMPLE_ATTACK_LEVELS)) {
      researchLevel[Number(id)] = level
    }
    const overrides = attackLabsToOverrides(attackResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(46)
    expect(overrides['0-1']).toBe(84)
    expect(overrides['0-2']).toBe(16)
    expect(overrides['0-3']).toBeUndefined()
    expect(overrides['0-4']).toBe(14)
    expect(overrides['0-7']).toBeUndefined()
    expect(overrides['0-8']).toBe(1)
  })
})
