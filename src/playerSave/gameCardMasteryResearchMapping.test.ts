import { describe, expect, it } from 'vitest'
import { cardMasteryLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function cardMasteryResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'CARD MASTERY',
        sectionSlug: 'card-mastery',
        items: [
          { name: 'Land Mine Stun Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Recovery Package Chance Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Death Ray Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Energy Net Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Super Tower Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Second Wind Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Demon Mode Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Energy Shield Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Berserker Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Ultimate Crit Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Nuke Mastery', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

describe('gameCardMasteryResearchMapping', () => {
  it('maps workshop card mastery block from researchLevel ids 178–188', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[181] = 9
    researchLevel[182] = 9
    researchLevel[183] = 9
    researchLevel[184] = 9
    researchLevel[186] = 9
    const overrides = cardMasteryLabsToOverrides(cardMasteryResearchData(), researchLevel)
    expect(overrides['0-3']).toBe(9)
    expect(overrides['0-4']).toBe(9)
    expect(overrides['0-5']).toBe(9)
    expect(overrides['0-6']).toBe(9)
    expect(overrides['0-8']).toBe(9)
  })
})
