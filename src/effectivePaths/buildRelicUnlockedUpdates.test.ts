import { describe, expect, it } from 'vitest'
import {
  buildRelicUnlockedUpdates,
  parseRelicRowsFromSheetValues,
} from './buildRelicUnlockedUpdates'

describe('parseRelicRowsFromSheetValues', () => {
  it('skips header and unmapped relic names', () => {
    const rows = parseRelicRowsFromSheetValues([
      ['Rarity', 'x', 'y', 'FALSE'],
      ['Copper Badge', 'a', 'b', 'FALSE'],
      ['Not A Real Relic', 'c', 'd', 'FALSE'],
    ])
    expect(rows).toEqual([{ rowIndex: 2, name: 'Copper Badge' }])
  })
})

describe('buildRelicUnlockedUpdates', () => {
  it('writes TRUE/FALSE per row with non-contiguous indices', () => {
    const updates = buildRelicUnlockedUpdates(
      'Relics',
      [
        { rowIndex: 2, name: 'Copper Badge' },
        { rowIndex: 5, name: 'Silver Badge' },
      ],
      new Set(['copper_badge']),
    )
    expect(updates).toEqual([
      { range: "'Relics'!F2", values: [['TRUE']] },
      { range: "'Relics'!F5", values: [['FALSE']] },
    ])
  })

  it('escapes sheet titles with quotes', () => {
    const updates = buildRelicUnlockedUpdates(
      "Player's Relics",
      [{ rowIndex: 3, name: 'Copper Badge' }],
      new Set(['copper_badge']),
    )
    expect(updates[0]?.range).toBe("'Player''s Relics'!F3")
  })
})
