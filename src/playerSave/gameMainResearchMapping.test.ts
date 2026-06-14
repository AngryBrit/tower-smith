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
          { name: 'Reroll Daily Mission', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Workshop Enhancements', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          {
            name: 'Enhancement Attack - Coin Discount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Enhancement Defense - Coin Discount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Enhancement Utility - Coin Discount',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Dissonant Echo - Attack',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Dissonant Echo - Defense',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Dissonant Echo - Utility',
            level: '0',
            benefit: '',
            time: '',
            cost: '',
            state: 'default',
          },
          {
            name: 'Dissonant Echo - Ultimate Weapons',
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

  it('maps Reroll Daily Mission from researchLevel id 148', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[148] = 1
    const overrides = mainLabsToOverrides(mainResearchData(), researchLevel)
    expect(overrides['0-12']).toBe(1)
  })

  it('leaves Reroll Daily Mission unmapped when researchLevel[148] is 0', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[151] = 1
    const overrides = mainLabsToOverrides(mainResearchData(), researchLevel)
    expect(overrides['0-12']).toBeUndefined()
  })

  it('maps Workshop Enhancements from researchLevel id 133', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[133] = 1
    const overrides = mainLabsToOverrides(mainResearchData(), researchLevel)
    expect(overrides['0-13']).toBe(1)
  })

  it('maps Enhancement coin discount labs from researchLevel ids 154, 135, and 227', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[154] = 2
    researchLevel[135] = 34
    researchLevel[227] = 5
    const overrides = mainLabsToOverrides(mainResearchData(), researchLevel)
    expect(overrides['0-14']).toBe(2)
    expect(overrides['0-15']).toBe(34)
    expect(overrides['0-16']).toBe(5)
  })

  it('maps Dissonant Echo Attack/Utility from swapped researchLevel ids 240/238', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[240] = 3
    researchLevel[238] = 7
    const overrides = mainLabsToOverrides(mainResearchData(), researchLevel)
    expect(overrides['0-17']).toBe(3)
    expect(overrides['0-19']).toBe(7)
  })
})
