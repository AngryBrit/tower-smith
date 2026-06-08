import { describe, expect, it } from 'vitest'
import { cardMasteryLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

const CARD_MASTERY_NAMES = [
  'Damage Mastery',
  'Attack Speed Mastery',
  'Health Mastery',
  'Health Regen Mastery',
  'Range Mastery',
  'Cash Mastery',
  'Coins Mastery',
  'Slow Aura Mastery',
  'Critical Chance Mastery',
  'Enemy Balance Mastery',
  'Extra Defense Mastery',
  'Fortress Mastery',
  'Free Upgrades Mastery',
  'Extra Orb Mastery',
  'Plasma Cannon Mastery',
  'Critical Coin Mastery',
  'Wave Skip Mastery',
  'Intro Sprint Mastery',
  'Land Mine Stun Mastery',
  'Recovery Package Chance Mastery',
  'Death Ray Mastery',
  'Energy Net Mastery',
  'Super Tower Mastery',
  'Second Wind Mastery',
  'Demon Mode Mastery',
  'Energy Shield Mastery',
  'Wave Accelerator Mastery',
  'Berserker Mastery',
  'Ultimate Crit Mastery',
  'Nuke Mastery',
] as const

function cardMasteryResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'CARD MASTERY',
        sectionSlug: 'card-mastery',
        items: CARD_MASTERY_NAMES.map((name) => ({
          name,
          level: '0',
          benefit: '',
          time: '',
          cost: '',
          state: 'default' as const,
        })),
      },
    ],
  }
}

describe('gameCardMasteryResearchMapping', () => {
  it('maps card mastery labs from researchLevel ids 160–189 (UI order)', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[160] = 9
    researchLevel[163] = 9
    researchLevel[166] = 9
    researchLevel[173] = 9
    researchLevel[177] = 9
    researchLevel[181] = 9
    researchLevel[182] = 9
    researchLevel[183] = 9
    researchLevel[184] = 9
    researchLevel[186] = 9
    const overrides = cardMasteryLabsToOverrides(cardMasteryResearchData(), researchLevel)
    expect(overrides['0-0']).toBe(9)
    expect(overrides['0-3']).toBe(9)
    expect(overrides['0-6']).toBe(9)
    expect(overrides['0-13']).toBe(9)
    expect(overrides['0-17']).toBe(9)
    expect(overrides['0-21']).toBe(9)
    expect(overrides['0-22']).toBe(9)
    expect(overrides['0-23']).toBe(9)
    expect(overrides['0-24']).toBe(9)
    expect(overrides['0-26']).toBe(9)
    expect(overrides['0-27']).toBeUndefined()
  })
})
