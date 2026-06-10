import { describe, expect, it } from 'vitest'
import {
  buildCardSheetGridFromColumnRanges,
  detectCardSheetLayout,
  parseCardSheetRowsWithLayout,
} from './cardSheetLayout'

function buildV304CardRows(): string[][] {
  const rows = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
  rows[4]![1] = 'Card Slot (Gems)'
  rows[4]![2] = '18'
  rows[5]![1] = 'Damage'
  rows[5]![2] = '7'
  rows[6]![1] = 'Attack Speed'
  rows[6]![2] = '5'
  rows[35]![1] = 'Area of Effect'
  rows[35]![2] = 'Locked'
  return rows
}

describe('cardSheetLayout', () => {
  it('merges single-column B/C/D ranges', () => {
    const grid = buildCardSheetGridFromColumnRanges([
      { range: "'Master Sheet'!B1:B60", values: [[], ['Damage'], ['Attack Speed']] },
      { range: "'Master Sheet'!C1:C60", values: [[], ['7'], ['5']] },
      { range: "'Master Sheet'!D1:D60", values: [[], ['TRUE'], ['FALSE']] },
    ])
    expect(grid[1]![1]).toBe('Damage')
    expect(grid[1]![2]).toBe('7')
    expect(grid[1]![3]).toBe('TRUE')
    expect(grid[2]![1]).toBe('Attack Speed')
  })

  it('detects Cards v3.x Master Sheet card block', () => {
    const rows = buildV304CardRows()
    const layout = detectCardSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseCardSheetRowsWithLayout(rows, layout!)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Card Slot (Gems)', kind: 'equip_slots', rowIndex: 5 }),
        expect.objectContaining({ name: 'Damage', kind: 'card', rowIndex: 6 }),
        expect.objectContaining({ name: 'Attack Speed', kind: 'card', rowIndex: 7 }),
        expect.objectContaining({ name: 'Area of Effect', kind: 'card', rowIndex: 36 }),
      ]),
    )
  })
})
