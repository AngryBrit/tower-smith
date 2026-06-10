import { describe, expect, it } from 'vitest'
import {
  alignThemeSheetRowsToColumnA,
  buildThemeSheetGridFromBlockRanges,
  detectThemeSheetLayout,
  parseThemeRowsWithLayout,
  themeSheetFetchRangesForGrid,
  unmappedThemeNamesWithLayout,
} from './themeSheetLayout'

/** Minimal Themes & Songs v3.0.5-style grid (columns B/C, E/F, M/N, Q/R). */
function buildV305Rows(): string[][] {
  const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))

  rows[1]![1] = 'Tower Skin'
  rows[1]![4] = 'Background Skin'
  rows[1]![12] = 'Milestone Skin'
  rows[1]![16] = 'Menu'

  rows[2]![1] = 'TRUE'
  rows[2]![2] = 'Star'
  rows[2]![4] = 'FALSE'
  rows[2]![5] = 'Interstellar'
  rows[2]![12] = 'TRUE'
  rows[2]![13] = 'Shuriken'
  rows[2]![16] = 'TRUE'
  rows[2]![17] = 'Mech World'

  rows[3]![1] = 'FALSE'
  rows[3]![2] = 'Plasma Ball'
  rows[3]![4] = 'TRUE'
  rows[3]![5] = 'Volcano'
  rows[3]![12] = 'FALSE'
  rows[3]![13] = 'Donut'
  rows[3]![16] = 'FALSE'
  rows[3]![17] = 'Party'

  rows[10]![12] = 'Songs'
  rows[11]![12] = 'TRUE'
  rows[11]![13] = 'Krisu - Oceans Sings'

  rows[14]![12] = 'Guardians'
  rows[15]![12] = 'TRUE'
  rows[15]![13] = 'Finn'

  rows[18]![16] = 'Profile Banner'
  rows[19]![16] = 'TRUE'
  rows[19]![17] = 'Mech World'

  return rows
}

describe('themeSheetLayout', () => {
  it('clips fetch ranges to tab grid size and skips out-of-bounds columns', () => {
    const narrow = themeSheetFetchRangesForGrid(55, 11)
    expect(narrow).toContain('B1:B55')
    expect(narrow).not.toContain('M1:M55')
    const clipped = themeSheetFetchRangesForGrid(55, 26)
    expect(clipped).toContain('M1:M55')
    expect(clipped).not.toContain('M1:M120')
  })

  it('merges single-column API ranges without pair drift when owned cells are empty', () => {
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
        range: "'Themes & Songs'!M1:M120",
        values: [[], ['TRUE'], ['FALSE'], ['TRUE']],
      },
      {
        range: "'Themes & Songs'!N1:N120",
        values: [['Milestone Skin'], ['Sheep'], ['Fried Egg'], ['Mush-mush']],
      },
    ])
    const layout = detectThemeSheetLayout(grid)
    const parsed = parseThemeRowsWithLayout(grid, layout!)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Star', section: 'tower-event', ownedCol: 1 }),
        expect.objectContaining({ name: 'Sheep', section: 'tower-milestone', ownedCol: 12 }),
        expect.objectContaining({ name: 'Fried Egg', section: 'tower-milestone', ownedCol: 12 }),
        expect.objectContaining({ name: 'Mush-mush', section: 'tower-milestone', ownedCol: 12 }),
      ]),
    )
  })

  it('re-aligns API rows when leading column A is omitted', () => {
    const apiRows = [
      ['Tower Skin', '', '+0.4%', 'Background Skin'],
      ['TRUE', 'Star', '', 'FALSE', 'Interstellar'],
    ]
    const aligned = alignThemeSheetRowsToColumnA(apiRows)
    expect(aligned[1]![1]).toBe('TRUE')
    expect(aligned[1]![2]).toBe('Star')
    expect(aligned[1]![4]).toBe('FALSE')
    expect(aligned[1]![5]).toBe('Interstellar')
    const layout = detectThemeSheetLayout(aligned)
    const parsed = parseThemeRowsWithLayout(aligned, layout!)
    expect(parsed.map((row) => row.name)).toEqual(expect.arrayContaining(['Star', 'Interstellar']))
  })

  it('detects Themes & Songs v3.0.5 section blocks', () => {
    const rows = buildV305Rows()
    const layout = detectThemeSheetLayout(rows)
    expect(layout).not.toBeNull()
    expect(layout!.sections.map((section) => section.section)).toEqual(
      expect.arrayContaining([
        'tower-event',
        'background',
        'tower-milestone',
        'music',
        'guardian',
        'menus',
        'banners',
      ]),
    )
  })

  it('ignores IDS workbook category labels such as Player & Stuff', () => {
    const rows = buildV305Rows()
    rows[5]![2] = 'Player & Stuff'
    const layout = detectThemeSheetLayout(rows)!
    expect(unmappedThemeNamesWithLayout(rows, layout)).not.toContain('Player & Stuff')
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).not.toContain(
      'Player & Stuff',
    )
  })

  it('does not stop tower skins at a Total Bonuses summary row', () => {
    const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    rows[0]![1] = 'Tower Skin'
    rows[0]![4] = 'Background Skin'
    rows[0]![12] = 'Milestone Skin'
    rows[1]![1] = 'TRUE'
    rows[1]![2] = 'Star'
    rows[2]![12] = 'TRUE'
    rows[2]![13] = 'Sheep'
    rows[17]![1] = 'Total Bonuses'
    rows[18]![1] = 'TRUE'
    rows[18]![2] = 'Bee'
    const layout = detectThemeSheetLayout(rows)!
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).toContain('Bee')
  })

  it('parses tower skins that appear below the Songs header row in column M', () => {
    const rows = buildV305Rows()
    rows[15]![1] = 'TRUE'
    rows[15]![2] = 'Bee'
    const layout = detectThemeSheetLayout(rows)!
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).toContain('Bee')
  })

  it('parses tower skins after tier gaps with empty name rows', () => {
    const rows = buildV305Rows()
    rows[6]![2] = ''
    rows[7]![2] = ''
    rows[8]![2] = ''
    rows[9]![1] = 'TRUE'
    rows[9]![2] = 'Bee'
    const layout = detectThemeSheetLayout(rows)!
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).toContain('Bee')
  })

  it('parses owned columns B, E, M, and Q', () => {
    const rows = buildV305Rows()
    const layout = detectThemeSheetLayout(rows)!
    const parsed = parseThemeRowsWithLayout(rows, layout)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Star', section: 'tower-event', ownedCol: 1, rowIndex: 3 }),
        expect.objectContaining({
          name: 'Interstellar',
          section: 'background',
          ownedCol: 4,
          rowIndex: 3,
        }),
        expect.objectContaining({
          name: 'Shuriken',
          section: 'tower-milestone',
          ownedCol: 12,
          rowIndex: 3,
        }),
        expect.objectContaining({
          name: 'Krisu - Oceans Sings',
          section: 'music',
          ownedCol: 12,
          rowIndex: 12,
        }),
        expect.objectContaining({ name: 'Finn', section: 'guardian', ownedCol: 12, rowIndex: 16 }),
        expect.objectContaining({ name: 'Mech World', section: 'menus', ownedCol: 16, rowIndex: 3 }),
        expect.objectContaining({
          name: 'Mech World',
          section: 'banners',
          ownedCol: 16,
          rowIndex: 20,
        }),
      ]),
    )
  })
})
