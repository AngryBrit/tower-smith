import { describe, expect, it } from 'vitest'
import { buildRelicUnlockedUpdates } from './buildRelicUnlockedUpdates'
import {
  detectRelicSheetLayout,
  padSheetRowsToWidth,
  parseRelicRowsWithLayout,
} from './relicSheetLayout'

describe('detectRelicSheetLayout', () => {
  it('detects standard Effective Paths layout (name C, Unlocked F)', () => {
    const rows = [
      ['Rarity', 'Order', 'Relic Name', 'Bonus', 'Type', 'Unlocked'],
      ['1-Rare', '1', 'Copper Badge', 'Damage', 'Tournament', 'TRUE'],
      ['1-Rare', '2', 'Silver Badge', 'Coins', 'Tournament', 'FALSE'],
      ['1-Rare', '3', 'T:I Flux', 'Coins', 'Milestone', 'TRUE'],
    ]
    const layout = detectRelicSheetLayout(rows)
    expect(layout).toEqual({ nameCol: 2, unlockedCol: 5, startRow: 1 })
    const relicRows = parseRelicRowsWithLayout(rows, layout!)
    expect(relicRows.length).toBeGreaterThanOrEqual(3)
    const updates = buildRelicUnlockedUpdates('Relics', relicRows, new Set(['copper_badge']), 5)
    expect(updates[0]?.range).toBe("'Relics'!F2")
  })

  it('parses relic rows when Unlocked cells are blank', () => {
    const rows = padSheetRowsToWidth(
      [
        ['Rarity', 'Order', 'Relic Name', 'Bonus', 'Type', 'Unlocked'],
        ['1-Rare', '1', 'Copper Badge', 'Damage', 'Tournament'],
        ['1-Rare', '2', 'Silver Badge', 'Coins', 'Tournament'],
      ],
      6,
    )
    const layout = detectRelicSheetLayout(rows)
    expect(layout).not.toBeNull()
    const relicRows = parseRelicRowsWithLayout(rows, layout!)
    expect(relicRows.map((row) => row.name)).toEqual(['Copper Badge', 'Silver Badge'])
  })

  it('Relics tab layout: Unlocked column F, not Unlocked by column G', () => {
    const rows = padSheetRowsToWidth(
      [
        ['Rarity', '', 'Relic Name', 'Bonus Type', 'Value', 'Unlocked', 'Unlocked by', 'Type'],
        ['1-Rare', '1', 'Copper Badge', 'Damage', '3%', true, 'Finish P4 in Copper', 'Tournament'],
        ['1-Rare', '2', 'Silver Badge', 'Coins', '5%', false, 'Finish P4 in Silver', 'Tournament'],
      ],
      8,
    )
    const layout = detectRelicSheetLayout(rows)
    expect(layout).toEqual({ nameCol: 2, unlockedCol: 5, startRow: 1 })
    const relicRows = parseRelicRowsWithLayout(rows, layout!)
    expect(relicRows).toHaveLength(2)
    const updates = buildRelicUnlockedUpdates('Relics', relicRows, new Set(['copper_badge']), 5)
    expect(updates[0]?.range).toBe("'Relics'!F2")
    expect(updates[1]?.range).toBe("'Relics'!F3")
  })

  it('keeps column alignment when middle cells are omitted by the Sheets API', () => {
    const sparse = [
      ['1-Rare', '1', 'Copper Badge', 'Damage', 'Tournament'],
      ['1-Rare', '2', 'Silver Badge'],
    ]
    const rows = padSheetRowsToWidth(sparse, 6)
    const layout = detectRelicSheetLayout(rows)
    expect(layout?.nameCol).toBe(2)
    const relicRows = parseRelicRowsWithLayout(rows, layout!)
    expect(relicRows).toHaveLength(2)
  })
})
