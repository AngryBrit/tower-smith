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
          { name: 'Unmerge Module', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

describe('modulesLabsToOverrides', () => {
  it('maps Common Drop Chance from researchLevel id 134', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[134] = 10
    const overrides = modulesLabsToOverrides(modulesResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(10)
  })

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

  it('maps Unmerge Module from researchLevel id 151', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[151] = 1
    const overrides = modulesLabsToOverrides(modulesResearchData(), researchLevel)
    expect(overrides['0-6']).toBe(1)
  })

  it('maps Shatter Shards from researchLevel id 152', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[152] = 5
    const data: ResearchData = {
      sections: [
        {
          title: 'MODULES',
          sectionSlug: 'modules',
          items: [
            {
              name: 'Shatter Shards',
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
    expect(modulesLabsToOverrides(data, researchLevel)['0-0']).toBe(5)
  })
})
