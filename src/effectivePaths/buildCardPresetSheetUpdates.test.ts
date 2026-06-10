import { describe, expect, it } from 'vitest'
import {
  effectivePathsCardPresetDropdownLabels,
  mergeEffectivePathsCardSheetLabels,
} from './cardSheetNames'
import { buildCardPresetSheetUpdates } from './buildCardPresetSheetUpdates'
import { parseCardPresetSlotsWithLayout } from './cardPresetSheetLayout'
import { detectCardPresetSheetLayout } from './cardPresetSheetLayout'

describe('buildCardPresetSheetUpdates', () => {
  it('writes preset loadouts to Card Preset name columns', () => {
    const rows = Array.from({ length: 50 }, () => Array<string>(24).fill(''))
    rows[3]![3] = 'Farming'
    rows[3]![7] = 'Tourney'
    const layout = detectCardPresetSheetLayout(rows)!
    const slots = parseCardPresetSlotsWithLayout(layout)
    const batch = buildCardPresetSheetUpdates('Card Preset', slots, [
      ['freeUpgrades', 'coins'],
      ['health', 'extraDefense'],
      [],
      [],
      [],
    ])
    expect(batch).toEqual(
      expect.arrayContaining([
        { range: "'Card Preset'!D5", values: [['Free Upgrades']] },
        { range: "'Card Preset'!D6", values: [['Coins']] },
        { range: "'Card Preset'!D7", values: [['']] },
        { range: "'Card Preset'!H5", values: [['Health']] },
        { range: "'Card Preset'!H6", values: [['Extra Defense']] },
      ]),
    )
  })

  it('writes workbook dropdown spellings when sheet labels are provided', () => {
    const rows = Array.from({ length: 50 }, () => Array<string>(24).fill(''))
    rows[3]![3] = 'Farming'
    rows[3]![7] = 'Tourney'
    const layout = detectCardPresetSheetLayout(rows)!
    const slots = parseCardPresetSlotsWithLayout(layout).slice(0, 1)
    const labels = mergeEffectivePathsCardSheetLabels(
      new Map([['landMineStun', 'Landmine Stun']] as const),
      effectivePathsCardPresetDropdownLabels(),
    )
    const batch = buildCardPresetSheetUpdates(
      'Card Preset',
      slots,
      [['landMineStun']],
      labels,
    )
    expect(batch[0]?.values[0]?.[0]).toBe('Land Mine Stun')
    expect(batch[0]?.values[0]?.[0]).not.toBe('Landmine Stun')
  })
})
