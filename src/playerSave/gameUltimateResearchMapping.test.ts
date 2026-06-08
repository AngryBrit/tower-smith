import { describe, expect, it } from 'vitest'
import { ultimateLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function ultimateResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'ULTIMATE WEAPON RESEARCH',
        sectionSlug: 'ultimate-weapon-research',
        items: Array.from({ length: 10 }, (_, i) => ({
          name: `Placeholder ${i}`,
          level: '0',
          benefit: '',
          time: '',
          cost: '',
          state: 'default' as const,
        })).concat([
          { name: 'Golden Tower Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Golden Tower Duration', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Chain Lightning Shock', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Shock Chance', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Shock Multiplier', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Death Wave Health', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Death Wave Coin Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Black Hole Damage', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Extra Black Hole', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Black Hole Coin Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Spotlight Coin Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Spotlight Missiles', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ]),
      },
    ],
  }
}

const SAMPLE_ULTIMATE_LEVELS: Record<number, number> = {
  60: 25,
  61: 10,
  62: 1,
  65: 17,
  66: 20,
  94: 10,
  95: 1,
  96: 20,
  97: 20,
  98: 2,
}

describe('ultimateLabsToOverrides', () => {
  it('maps golden tower and death wave labs from researchLevel ids 60–66', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    for (const [id, level] of Object.entries(SAMPLE_ULTIMATE_LEVELS)) {
      researchLevel[Number(id)] = level
    }
    const overrides = ultimateLabsToOverrides(ultimateResearchData(), researchLevel)
    expect(overrides['0-10']).toBe(25)
    expect(overrides['0-11']).toBe(10)
    expect(overrides['0-12']).toBe(1)
    expect(overrides['0-13']).toBeUndefined()
    expect(overrides['0-15']).toBe(17)
    expect(overrides['0-16']).toBe(20)
    expect(overrides['0-21']).toBe(2)
  })

  it('maps Chain Thunder and Lightning Amplifier - Scatter from researchLevel ids 158–159', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[158] = 6
    researchLevel[159] = 12
    const data: ResearchData = {
      sections: [
        {
          title: 'ULTIMATE WEAPON RESEARCH',
          sectionSlug: 'ultimate-weapon-research',
          items: [
            {
              name: 'Chain Thunder',
              level: '0',
              benefit: '',
              time: '',
              cost: '',
              state: 'default',
            },
            {
              name: 'Lightning Amplifier - Scatter',
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
    const overrides = ultimateLabsToOverrides(data, researchLevel)
    expect(overrides['0-0']).toBe(6)
    expect(overrides['0-1']).toBe(12)
  })

  it('maps Death Wave Damage Amplifier and Armor Stripping from researchLevel ids 191–192', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[191] = 13
    researchLevel[192] = 10
    const data: ResearchData = {
      sections: [
        {
          title: 'ULTIMATE WEAPON RESEARCH',
          sectionSlug: 'ultimate-weapon-research',
          items: [
            {
              name: 'Death Wave Damage Amplifier',
              level: '0',
              benefit: '',
              time: '',
              cost: '',
              state: 'default',
            },
            {
              name: 'Death Wave Armor Stripping',
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
    const overrides = ultimateLabsToOverrides(data, researchLevel)
    expect(overrides['0-0']).toBe(13)
    expect(overrides['0-1']).toBe(10)
  })

  it('maps Death Wave Cells Bonus from researchLevel id 190', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[190] = 20
    const data: ResearchData = {
      sections: [
        {
          title: 'ULTIMATE WEAPON RESEARCH',
          sectionSlug: 'ultimate-weapon-research',
          items: [
            {
              name: 'Death Wave Cells Bonus',
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
    expect(ultimateLabsToOverrides(data, researchLevel)['0-0']).toBe(20)
  })
})
