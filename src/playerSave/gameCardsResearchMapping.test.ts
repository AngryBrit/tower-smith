import { describe, expect, it } from 'vitest'
import { cardsLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

function cardsResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'CARDS RESEARCH',
        sectionSlug: 'cards-research',
        items: [
          { name: 'Second Wind Blast', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Double Death Ray', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Extra Orb Adjuster', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Extra Extra Orbs', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Energy Shield Extra Hit', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Super Tower Bonus', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Recharge Second Wind', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Recharge Demon Mode', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Recharge Nuke', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

describe('gameCardsResearchMapping', () => {
  it('maps confirmed cards labs from researchLevel ids 70–75', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[70] = 4
    researchLevel[71] = 9
    researchLevel[72] = 1
    researchLevel[73] = 2
    researchLevel[74] = 2
    researchLevel[75] = 2
    const overrides = cardsLabsToOverrides(cardsResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(4)
    expect(overrides['0-1']).toBe(9)
    expect(overrides['0-2']).toBe(1)
    expect(overrides['0-3']).toBe(2)
    expect(overrides['0-4']).toBe(2)
    expect(overrides['0-5']).toBe(2)
  })

  it('maps recharge cards labs from researchLevel ids 76–78', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[76] = 3
    researchLevel[77] = 5
    researchLevel[78] = 1
    const overrides = cardsLabsToOverrides(cardsResearchData(), researchLevel)
    expect(overrides['0-6']).toBe(3)
    expect(overrides['0-7']).toBe(5)
    expect(overrides['0-8']).toBe(1)
  })

  it('skips recharge cards labs when researchLevel is zero', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    const overrides = cardsLabsToOverrides(cardsResearchData(), researchLevel)
    expect(overrides['0-6']).toBeUndefined()
    expect(overrides['0-7']).toBeUndefined()
    expect(overrides['0-8']).toBeUndefined()
  })
})
