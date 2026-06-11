import { describe, expect, it } from 'vitest'
import {
  buildWorkshopEnhanceSheetUpdates,
  buildWorkshopSheetUpdates,
} from './buildWorkshopSheetUpdates'

const workshopLayout = {
  unlockedCol: 1,
  nameCol: 2,
  levelCol: 3,
  startRow: 5,
  endRow: 9,
}

describe('buildWorkshopSheetUpdates', () => {
  it('writes unlocked (B) and farming level (D) for workshop rows', () => {
    const batch = buildWorkshopSheetUpdates(
      'Master Sheet',
      [
        { rowIndex: 6, name: 'Damage', upgradeId: 'damageLevel' },
        { rowIndex: 7, name: 'Coins - Kill Bonus', upgradeId: 'coinsKillBonusLevel' },
        { rowIndex: 8, name: 'Interest - Wave', upgradeId: 'interestPerWaveLevel' },
      ],
      {
        damageLevel: 5640,
        coinsKillBonusLevel: 0,
        interestPerWaveLevel: 12,
      },
      workshopLayout,
    )
    expect(batch).toEqual(
      expect.arrayContaining([
        { range: "'Master Sheet'!D6", values: [['5640']] },
        { range: "'Master Sheet'!B7", values: [['FALSE']] },
        { range: "'Master Sheet'!D7", values: [['0']] },
        { range: "'Master Sheet'!B8", values: [['TRUE']] },
        { range: "'Master Sheet'!D8", values: [['12']] },
      ]),
    )
    expect(batch.some((entry) => entry.range === "'Master Sheet'!B6")).toBe(false)
  })

  it('skips column B for always-unlocked basics (Health / Health Regen)', () => {
    const batch = buildWorkshopSheetUpdates(
      'Master Sheet',
      [
        { rowIndex: 20, name: 'Health', upgradeId: 'healthLevel' },
        { rowIndex: 21, name: 'Health Regen', upgradeId: 'healthRegenLevel' },
      ],
      { healthLevel: 120, healthRegenLevel: 45 },
      workshopLayout,
    )
    expect(batch).toEqual([
      { range: "'Master Sheet'!D20", values: [['120']] },
      { range: "'Master Sheet'!D21", values: [['45']] },
    ])
  })

  it('writes enhancement farming levels to column R', () => {
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
