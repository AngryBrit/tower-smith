import { describe, expect, it } from 'vitest'
import { modulesLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function modulesResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'MODULES',
        sectionSlug: 'modules',
        items: [
          { name: 'Common Drop Chance', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Reroll Shards', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Daily Mission Shards', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Module Shards Cost', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Module Coin Cost', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Rare Drop Chance', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

describe('modulesLabsToOverrides', () => {
  it('maps confirmed module labs from researchLevel ids 139–143', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[139] = 31
    researchLevel[140] = 17
    researchLevel[143] = 2
    const overrides = modulesLabsToOverrides(modulesResearchData(), researchLevel)
    expect(overrides['0-1']).toBe(31)
    expect(overrides['0-2']).toBe(17)
    expect(overrides['0-3']).toBeUndefined()
    expect(overrides['0-4']).toBeUndefined()
    expect(overrides['0-5']).toBe(2)
  })
})
