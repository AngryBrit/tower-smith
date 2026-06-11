import { describe, expect, it } from 'vitest'
import {
  buildThemeSheetGridFromBlockRanges,
  detectThemeSheetLayout,
  parseThemeRowsWithLayout,
} from './themeSheetLayout'
import { themeOwnedIdsFromSheetRows } from './themeOwnedIdsFromSheet'

describe('themeOwnedIdsFromSheetRows', () => {
  it('reads owned milestone tower ids from L/M block-range grid', () => {
    const grid = buildThemeSheetGridFromBlockRanges([
      {
        range: "'Themes & Songs'!B1:S8",
        values: [
          [
            'Tower Skin',
            '',
            '',
            '',
            'Background Skin',
            '',
            '',
            '',
            '',
            '',
            'Milestone Skin',
          ],
        ],
      },
      {
        range: "'Themes & Songs'!B1:B120",
        values: [[], ['TRUE']],
      },
      {
        range: "'Themes & Songs'!C1:C120",
        values: [[], ['Star']],
      },
      {
        range: "'Themes & Songs'!L1:L120",
        values: [[], ['TRUE'], ['FALSE'], ['TRUE'], ['TRUE']],
      },
      {
        range: "'Themes & Songs'!M1:M120",
        values: [['Milestone Skin'], ['Sheep'], ['Fried Egg'], ['Mush-mush'], ['Turtle']],
      },
    ])
    const layout = detectThemeSheetLayout(grid)
    expect(layout).not.toBeNull()
    const rows = parseThemeRowsWithLayout(grid, layout!)
    const owned = themeOwnedIdsFromSheetRows(rows, grid)
    expect(owned).toEqual(
      expect.arrayContaining([
        'tower-event-star',
        'tower-sheep',
        'tower-mush-mush',
        'tower-turtle',
      ]),
    )
    expect(owned).not.toContain('tower-fried-egg')
  })

  it('reads milestone ids when names are in L and owned in K', () => {
    const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    rows[1]![11] = 'Milestone Skin'
    rows[2]![10] = 'TRUE'
    rows[2]![11] = 'Shuriken'
    rows[2]![12] = 'Tier 1'
    rows[3]![10] = 'TRUE'
    rows[3]![11] = 'Donut'
    rows[3]![12] = 'Tier 2'
    const layout = detectThemeSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseThemeRowsWithLayout(rows, layout!)
    const owned = themeOwnedIdsFromSheetRows(parsed, rows)
    expect(owned).toEqual(expect.arrayContaining(['tower-shuriken', 'tower-donut']))
  })
})
