import { describe, expect, it } from 'vitest'
import {
  buildWorkshopEnhanceSheetUpdates,
  buildWorkshopSheetUpdates,
} from './buildWorkshopSheetUpdates'

describe('buildWorkshopSheetUpdates', () => {
  it('writes unlocked and level cells for workshop rows', () => {
    const batch = buildWorkshopSheetUpdates(
      'Master Sheet',
      [
        { rowIndex: 6, name: 'Damage' },
        { rowIndex: 7, name: 'Coins - Kill Bonus' },
        { rowIndex: 8, name: 'Interest - Wave' },
      ],
      {
        damageLevel: 5640,
        coinsKillBonusLevel: 0,
        interestPerWaveLevel: 12,
      },
    )
    expect(batch).toEqual(
      expect.arrayContaining([
        { range: "'Master Sheet'!B6", values: [['TRUE']] },
        { range: "'Master Sheet'!D6", values: [['5640']] },
        { range: "'Master Sheet'!B7", values: [['FALSE']] },
        { range: "'Master Sheet'!D7", values: [['0']] },
        { range: "'Master Sheet'!B8", values: [['TRUE']] },
        { range: "'Master Sheet'!D8", values: [['12']] },
      ]),
    )
  })

  it('writes enhancement levels to column R', () => {
    const batch = buildWorkshopEnhanceSheetUpdates(
      'Master Sheet',
      [
        { rowIndex: 6, name: 'Damage +' },
        { rowIndex: 7, name: 'Health +' },
      ],
      { enhanceDamageLevel: 40, enhanceHealthLevel: 25 },
      { nameCol: 15, levelCol: 17, startRow: 5, endRow: 8 },
    )
    expect(batch).toEqual([
      { range: "'Master Sheet'!R6", values: [['40']] },
      { range: "'Master Sheet'!R7", values: [['25']] },
    ])
  })
})
