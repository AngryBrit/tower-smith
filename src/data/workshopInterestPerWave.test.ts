import { describe, expect, it } from 'vitest'
import type { ResearchData } from '../types/research'
import {
  WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL,
  WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS,
  workshopInterestPerWaveLabDisplayMultiplier,
  workshopInterestPerWaveNextMarginalCoins,
  workshopInterestPerWaveStatDisplay,
  workshopInterestPerWaveStatPercentPoints,
} from './workshopInterestPerWave'

const utilityResearchFixture = (): ResearchData => ({
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
      ],
    },
  ],
})

describe('workshopInterestPerWave', () => {
  it('uses exact +0.06% per level and wiki marginal Cost', () => {
    expect(WORKSHOP_INTEREST_PER_WAVE_UNLOCK_COINS).toBe(5000)
    expect(workshopInterestPerWaveStatPercentPoints(0)).toBe(0)
    expect(workshopInterestPerWaveStatPercentPoints(1)).toBe(0.06)
    expect(workshopInterestPerWaveStatPercentPoints(99)).toBe(5.94)
    expect(workshopInterestPerWaveStatDisplay(0)).toBe('0.00%')
    expect(workshopInterestPerWaveStatDisplay(1)).toBe('0.06%')
    expect(workshopInterestPerWaveStatDisplay(99)).toBe('5.94%')

    expect(workshopInterestPerWaveNextMarginalCoins(0)).toBe(125)
    expect(workshopInterestPerWaveNextMarginalCoins(9)).toBe(1320)
    expect(workshopInterestPerWaveNextMarginalCoins(98)).toBe(252_470)
    expect(workshopInterestPerWaveNextMarginalCoins(99)).toBeUndefined()
  })

  it('max level is 99', () => {
    expect(WORKSHOP_INTEREST_PER_WAVE_MAX_LEVEL).toBe(99)
  })

  it('combines Interest and Cash / Wave labs on workshop card display', () => {
    const data = utilityResearchFixture()
    expect(
      workshopInterestPerWaveLabDisplayMultiplier(data, { '0-1': 5 }),
    ).toBeCloseTo(1.1, 6)
    expect(
      workshopInterestPerWaveLabDisplayMultiplier(data, { '0-4': 5, '0-1': 5 }),
    ).toBeCloseTo(1.21, 6)
  })
})
