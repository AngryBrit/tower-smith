import { describe, expect, it } from 'vitest'
import {
  buildWorkshopSheetGridFromColumnRanges,
  detectWorkshopSheetLayout,
  parseWorkshopSheetRowsWithLayout,
} from './workshopSheetLayout'

describe('workshopSheetLayout', () => {
  it('merges single-column workshop ranges', () => {
    const grid = buildWorkshopSheetGridFromColumnRanges([
      { range: "'Master Sheet'!C1:C3", values: [['Damage'], ['Attack Speed'], ['Critical Chance']] },
      { range: "'Master Sheet'!D1:D2", values: [[5640], [99]] },
      { range: "'Master Sheet'!B1:B2", values: [['TRUE'], ['TRUE']] },
    ])
    expect(grid[0]![2]).toBe('Damage')
    expect(grid[1]![2]).toBe('Attack Speed')
    expect(grid[0]![3]).toBe('5640')
    expect(grid[0]![1]).toBe('TRUE')
  })

  it('detects Workshop v3.x Master Sheet block', () => {
    const rows = Array.from({ length: 70 }, () => Array<string>(8).fill(''))
    rows[5]![2] = 'Damage'
    rows[6]![2] = 'Attack Speed'
    rows[7]![2] = 'Critical Chance'
    const layout = detectWorkshopSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseWorkshopSheetRowsWithLayout(rows, layout!)
    expect(parsed[0]).toEqual({ rowIndex: 6, name: 'Damage' })
    expect(parsed[1]).toEqual({ rowIndex: 7, name: 'Attack Speed' })
  })
})
