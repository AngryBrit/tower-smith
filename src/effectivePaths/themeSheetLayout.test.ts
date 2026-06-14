import { describe, expect, it } from 'vitest'
import {
  alignThemeSheetRowsToColumnA,
  buildThemeSheetGridFromBlockRanges,
  detectThemeSheetLayout,
  parseThemeRowsWithLayout,
  themeSheetFetchRangesForGrid,
  unmappedThemeNamesWithLayout,
} from './themeSheetLayout'
import { themeOwnedIdsFromSheetRows } from './themeOwnedIdsFromSheet'

/** Themes & Songs v3.0.5 input tab: B/C, E/F, L/M, Q/R. */
function buildInputTabRows(): string[][] {
  const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))

  rows[1]![1] = 'Tower Skin'
  rows[1]![4] = 'Background Skin'
  rows[1]![11] = 'Milestone Skin'
  rows[1]![16] = 'Menu'

  rows[2]![1] = 'TRUE'
  rows[2]![2] = 'Star'
  rows[2]![4] = 'FALSE'
  rows[2]![5] = 'Interstellar'
  rows[2]![11] = 'TRUE'
  rows[2]![12] = 'Shuriken'
  rows[2]![16] = 'TRUE'
  rows[2]![17] = 'Mech World'

  rows[3]![1] = 'FALSE'
  rows[3]![2] = 'Plasma Ball'
  rows[3]![4] = 'TRUE'
  rows[3]![5] = 'Volcano'
  rows[3]![11] = 'FALSE'
  rows[3]![12] = 'Donut'
  rows[3]![16] = 'FALSE'
  rows[3]![17] = 'Party'

  rows[10]![11] = 'Songs'
  rows[11]![11] = 'TRUE'
  rows[11]![12] = 'Krisu - Oceans Sings'

  rows[14]![11] = 'Guardians'
  rows[15]![11] = 'TRUE'
  rows[15]![12] = 'Finn'

  rows[18]![16] = 'Profile Banner'
  rows[19]![16] = 'TRUE'
  rows[19]![17] = 'Mech World'

  return rows
}

/**
 * Catalog tab: same columns; milestone names in L with tier labels in M.
 * https://docs.google.com/spreadsheets/d/1Xlh6e2PUEtt-Wx7_FdJt_eL-G8FKgVWpQOAFPCvy9oo/
 */
function buildCatalogV305Rows(): string[][] {
  const rows = Array.from({ length: 60 }, () => Array<string>(26).fill(''))

  rows[1]![1] = 'Tower Skin'
  rows[1]![4] = 'Background Skin'
  rows[1]![11] = 'Milestone Skin'
  rows[1]![12] = 'Tier Unlocked'

  rows[2]![1] = 'TRUE'
  rows[2]![2] = 'Star'
  rows[2]![4] = 'TRUE'
  rows[2]![5] = 'Interstellar'
  rows[2]![10] = 'TRUE'
  rows[2]![11] = 'Shuriken'
  rows[2]![12] = 'Tier 1'

  rows[3]![1] = 'FALSE'
  rows[3]![2] = 'Plasma Ball'
  rows[3]![4] = 'TRUE'
  rows[3]![5] = 'Volcano'
  rows[3]![10] = 'FALSE'
  rows[3]![11] = 'Donut'
  rows[3]![12] = 'Tier 2'

  rows[7]![10] = 'TRUE'
  rows[7]![11] = 'Sheep'
  rows[7]![12] = 'Tier 6'

  rows[8]![10] = 'TRUE'
  rows[8]![11] = 'Fried Egg'
  rows[8]![12] = 'Tier 7'

  rows[9]![10] = 'TRUE'
  rows[9]![11] = 'Mush-mush'
  rows[9]![12] = 'Tier 8'

  rows[24]![11] = 'Songs'
  rows[24]![16] = 'Menu'
  rows[25]![10] = 'TRUE'
  rows[25]![11] = 'Krisu - Oceans Sings'
  rows[25]![16] = 'TRUE'
  rows[25]![17] = 'Dark Being'

  rows[29]![11] = 'Guardians'
  rows[30]![10] = 'TRUE'
  rows[30]![11] = 'Butter'
  rows[30]![16] = 'TRUE'
  rows[30]![17] = 'Cosy Cosmos'

  rows[35]![16] = 'Profile Banner'
  rows[36]![16] = 'TRUE'
  rows[36]![17] = 'Mech World'

  return rows
}

describe('themeSheetLayout', () => {
  it('clips fetch ranges to tab grid size and skips out-of-bounds columns', () => {
    const narrow = themeSheetFetchRangesForGrid(55, 10)
    expect(narrow).toContain('B1:B55')
    expect(narrow).not.toContain('K1:K55')
    const clipped = themeSheetFetchRangesForGrid(55, 26)
    expect(clipped).toContain('K1:K55')
    expect(clipped).toContain('L1:L55')
    expect(clipped).not.toContain('K1:K120')
  })

  it('merges single-column API ranges for L/M milestone block', () => {
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
        values: [[], ['TRUE'], ['FALSE'], ['TRUE']],
      },
      {
        range: "'Themes & Songs'!M1:M120",
        values: [['Milestone Skin'], ['Sheep'], ['Fried Egg'], ['Mush-mush']],
      },
    ])
    const layout = detectThemeSheetLayout(grid)
    const parsed = parseThemeRowsWithLayout(grid, layout!)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Star', section: 'tower-event', ownedCol: 1 }),
        expect.objectContaining({ name: 'Sheep', section: 'tower-milestone', ownedCol: 11 }),
        expect.objectContaining({ name: 'Fried Egg', section: 'tower-milestone', ownedCol: 11 }),
        expect.objectContaining({ name: 'Mush-mush', section: 'tower-milestone', ownedCol: 11 }),
      ]),
    )
  })

  it('does not treat N-column summary labels Menus / Profile Banners as section headers', () => {
    const rows = Array.from({ length: 50 }, () => Array<string>(26).fill(''))
    rows[1]![1] = 'Tower Skin'
    rows[1]![4] = 'Background Skin'
    rows[1]![11] = 'Milestone Skin'
    rows[7]![14] = 'Menus'
    rows[8]![14] = 'Profile Banners'
    rows[24]![11] = 'Songs'
    rows[24]![16] = 'Menu'
    rows[25]![16] = 'TRUE'
    rows[25]![17] = 'Dark Being'
    rows[29]![11] = 'Guardians'
    rows[35]![11] = 'Glenn'
    rows[35]![16] = 'Profile Banner'
    rows[36]![16] = 'TRUE'
    rows[36]![17] = 'Mech World'
    const layout = detectThemeSheetLayout(rows)!
    const parsed = parseThemeRowsWithLayout(rows, layout)
    const owned = themeOwnedIdsFromSheetRows(parsed, rows)
    expect(layout.sections.map((section) => section.section)).toEqual(
      expect.arrayContaining(['menus', 'banners']),
    )
    expect(owned).toEqual(expect.arrayContaining(['menu-dark-being', 'banner-mech']))
  })

  it('does not truncate milestone block at Songs labels in column N', () => {
    const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    rows[1]![11] = 'Milestone Skin'
    rows[2]![10] = 'TRUE'
    rows[2]![11] = 'Shuriken'
    rows[2]![12] = 'Tier 1'
    rows[6]![10] = 'TRUE'
    rows[6]![11] = 'Sheep'
    rows[6]![12] = 'Tier 6'
    rows[6]![13] = 'Songs'
    rows[7]![10] = 'TRUE'
    rows[7]![11] = 'Fried Egg'
    rows[7]![12] = 'Tier 7'
    rows[24]![11] = 'Songs'
    rows[25]![10] = 'TRUE'
    rows[25]![11] = 'Krisu - Oceans Sings'
    const layout = detectThemeSheetLayout(rows)!
    const parsed = parseThemeRowsWithLayout(rows, layout)
    const unmapped = unmappedThemeNamesWithLayout(rows, layout)
    expect(parsed.map((row) => row.name)).toEqual(
      expect.arrayContaining(['Shuriken', 'Sheep', 'Fried Egg', 'Krisu - Oceans Sings']),
    )
    expect(unmapped).not.toContain('Sheep')
    expect(unmapped).not.toContain('Fried Egg')
  })

  it('parses menu names from column O on the catalog tab', () => {
    const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    rows[1]![1] = 'Tower Skin'
    rows[1]![4] = 'Background Skin'
    rows[24]![11] = 'Songs'
    rows[24]![14] = 'Menu'
    rows[25]![10] = 'TRUE'
    rows[25]![11] = 'Krisu - Oceans Sings'
    rows[25]![13] = 'TRUE'
    rows[25]![14] = 'Dark Being'
    const layout = detectThemeSheetLayout(rows)!
    const parsed = parseThemeRowsWithLayout(rows, layout)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Dark Being', section: 'menus', ownedCol: 13 }),
      ]),
    )
  })

  it('reads menu owned checkboxes from column Q when names are in column O', () => {
    const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    rows[1]![1] = 'Tower Skin'
    rows[1]![4] = 'Background Skin'
    rows[24]![11] = 'Songs'
    rows[24]![14] = 'Menu'
    rows[25]![10] = 'TRUE'
    rows[25]![11] = 'Krisu - Oceans Sings'
    rows[25]![14] = 'Dark Being'
    rows[25]![16] = 'TRUE'
    const layout = detectThemeSheetLayout(rows)!
    const parsed = parseThemeRowsWithLayout(rows, layout)
    const owned = themeOwnedIdsFromSheetRows(parsed, rows)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Dark Being', section: 'menus', ownedCol: 16 }),
      ]),
    )
    expect(owned).toContain('menu-dark-being')
  })

  it('starts the banner block after Glenn when the Profile Banner label is missing', () => {
    const rows = Array.from({ length: 45 }, () => Array<string>(26).fill(''))
    rows[1]![1] = 'Tower Skin'
    rows[1]![4] = 'Background Skin'
    rows[24]![11] = 'Songs'
    rows[24]![16] = 'Menu'
    rows[25]![16] = 'TRUE'
    rows[25]![17] = 'Dark Being'
    rows[29]![11] = 'Guardians'
    rows[35]![11] = 'Glenn'
    rows[36]![16] = 'TRUE'
    rows[36]![17] = 'Mech World'
    rows[37]![16] = 'TRUE'
    rows[37]![17] = 'Party'
    const layout = detectThemeSheetLayout(rows)!
    const parsed = parseThemeRowsWithLayout(rows, layout)
    const owned = themeOwnedIdsFromSheetRows(parsed, rows)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Mech World', section: 'banners', ownedCol: 16 }),
        expect.objectContaining({ name: 'Party', section: 'banners', ownedCol: 16 }),
      ]),
    )
    expect(owned).toEqual(expect.arrayContaining(['banner-mech', 'banner-party']))
  })

  it('parses catalog tab when milestone names are in L and tier labels in M', () => {
    const rows = buildCatalogV305Rows()
    const layout = detectThemeSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseThemeRowsWithLayout(rows, layout!)
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Star', section: 'tower-event', ownedCol: 1 }),
        expect.objectContaining({ name: 'Shuriken', section: 'tower-milestone', ownedCol: 10 }),
        expect.objectContaining({ name: 'Sheep', section: 'tower-milestone', ownedCol: 10 }),
        expect.objectContaining({ name: 'Fried Egg', section: 'tower-milestone', ownedCol: 10 }),
        expect.objectContaining({ name: 'Mush-mush', section: 'tower-milestone', ownedCol: 10 }),
        expect.objectContaining({ name: 'Krisu - Oceans Sings', section: 'music', ownedCol: 10 }),
        expect.objectContaining({ name: 'Butter', section: 'guardian', ownedCol: 10 }),
        expect.objectContaining({ name: 'Dark Being', section: 'menus', ownedCol: 16 }),
        expect.objectContaining({ name: 'Mech World', section: 'banners', ownedCol: 16 }),
      ]),
    )
    const owned = themeOwnedIdsFromSheetRows(parsed, rows)
    expect(owned).toEqual(
      expect.arrayContaining([
        'tower-event-star',
        'tower-shuriken',
        'tower-sheep',
        'tower-fried-egg',
        'tower-mush-mush',
        'music-krisu-oceans-sings',
        'guardian-butter',
        'menu-dark-being',
        'banner-mech',
      ]),
    )
    expect(owned).not.toContain('tower-donut')
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

  it('detects v3.0.5 section blocks', () => {
    const rows = buildInputTabRows()
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

  it('maps shortened Plasma labels on tower and background rows', () => {
    const rows = buildInputTabRows()
    rows[3]![2] = 'Plasma'
    rows[3]![5] = 'Plasma'
    const layout = detectThemeSheetLayout(rows)!
    expect(unmappedThemeNamesWithLayout(rows, layout)).toEqual([])
  })

  it('ignores IDS workbook category labels such as Player & Stuff', () => {
    const rows = buildInputTabRows()
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
    rows[0]![11] = 'Milestone Skin'
    rows[1]![1] = 'TRUE'
    rows[1]![2] = 'Star'
    rows[2]![11] = 'TRUE'
    rows[2]![12] = 'Sheep'
    rows[17]![1] = 'Total Bonuses'
    rows[18]![1] = 'TRUE'
    rows[18]![2] = 'Bee'
    const layout = detectThemeSheetLayout(rows)!
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).toContain('Bee')
  })

  it('parses tower skins that appear below the Songs header row in column L', () => {
    const rows = buildInputTabRows()
    rows[15]![1] = 'TRUE'
    rows[15]![2] = 'Bee'
    const layout = detectThemeSheetLayout(rows)!
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).toContain('Bee')
  })

  it('parses tower skins after tier gaps with empty name rows', () => {
    const rows = buildInputTabRows()
    rows[6]![2] = ''
    rows[7]![2] = ''
    rows[8]![2] = ''
    rows[9]![1] = 'TRUE'
    rows[9]![2] = 'Bee'
    const layout = detectThemeSheetLayout(rows)!
    expect(parseThemeRowsWithLayout(rows, layout).map((row) => row.name)).toContain('Bee')
  })

  it('parses owned columns B, E, L, and Q', () => {
    const rows = buildInputTabRows()
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
          ownedCol: 11,
          rowIndex: 3,
        }),
        expect.objectContaining({
          name: 'Krisu - Oceans Sings',
          section: 'music',
          ownedCol: 11,
          rowIndex: 12,
        }),
        expect.objectContaining({ name: 'Finn', section: 'guardian', ownedCol: 11, rowIndex: 16 }),
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
