import { describe, expect, it } from 'vitest'
import { battleConditionLabsToOverrides } from './mapPlayerDataToTower'
import type { ResearchData } from '../types/research'

describe('gameBattleConditionResearchMapping', () => {
  it('maps Battle Condition Reduction from researchLevel id 152', () => {
    const researchLevel = Array.from({ length: 250 }, () => 0)
    researchLevel[152] = 5
    const data: ResearchData = {
      sections: [
        {
          title: 'BATTLE CONDITION',
          sectionSlug: 'battle-condition',
          items: [
            {
              name: 'Battle Condition Reduction',
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
    expect(battleConditionLabsToOverrides(data, researchLevel)['0-0']).toBe(5)
  })
})
