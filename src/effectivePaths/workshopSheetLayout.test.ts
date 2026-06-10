import { describe, expect, it } from 'vitest'
import {
  buildWorkshopSheetGridFromColumnRanges,
  detectWorkshopEnhanceSheetLayout,
  detectWorkshopSheetLayout,
  parseWorkshopEnhanceSheetRowsWithLayout,
  parseWorkshopSheetRowsWithLayout,
  WORKSHOP_ENHANCE_NAME_COL,
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

  it('merges enhancement columns P and R', () => {
    const grid = buildWorkshopSheetGridFromColumnRanges([
      { range: "'Master Sheet'!P1:P2", values: [['Damage +'], ['Health +']] },
      { range: "'Master Sheet'!R1:R2", values: [[12], [8]] },
    ])
    expect(grid[0]![15]).toBe('Damage +')
    expect(grid[1]![17]).toBe('8')
  })

  it('detects Workshop v3.x Master Sheet block', () => {
    const rows = Array.from({ length: 70 }, () => Array<string>(24).fill(''))
    rows[5]![2] = 'Damage'
    rows[6]![2] = 'Attack Speed'
    rows[7]![2] = 'Critical Chance'
    const layout = detectWorkshopSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseWorkshopSheetRowsWithLayout(rows, layout!)
    expect(parsed[0]).toEqual({ rowIndex: 6, name: 'Damage' })
    expect(parsed[1]).toEqual({ rowIndex: 7, name: 'Attack Speed' })
  })

  it('detects Workshop Enhancements block in columns P/R', () => {
    const rows = Array.from({ length: 70 }, () => Array<string>(24).fill(''))
    rows[5]![WORKSHOP_ENHANCE_NAME_COL] = 'Damage +'
    rows[6]![WORKSHOP_ENHANCE_NAME_COL] = 'Health +'
    rows[7]![WORKSHOP_ENHANCE_NAME_COL] = 'Cash Bonus +'
    const layout = detectWorkshopEnhanceSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseWorkshopEnhanceSheetRowsWithLayout(rows, layout!)
    expect(parsed[0]).toEqual({ rowIndex: 6, name: 'Damage +' })
    expect(parsed[1]).toEqual({ rowIndex: 7, name: 'Health +' })
  })
})
