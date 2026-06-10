import { describe, expect, it } from 'vitest'
import {
  BOT_ATTRIBUTE_COL,
  BOT_SHEET_GRID_COLUMNS,
  BOT_SHEET_GRID_ROWS,
  buildBotSheetGridFromBlockRange,
  buildBotSheetGridFromColumnRanges,
  detectBotSheetLayout,
  parseBotHeaderRowsWithLayout,
  parseBotLabRowsWithLayout,
  parseBotStatRowsWithLayout,
  resolveBotSheetLayout,
} from './botSheetLayout'

function emptyGrid(): string[][] {
  return Array.from({ length: BOT_SHEET_GRID_ROWS }, () =>
    Array(BOT_SHEET_GRID_COLUMNS).fill(''),
  )
}

/** Bots v3.1: G3–7 Flame, G8–12 Thunder; D=Locked, E=attribute. */
function fillFlameThunderBlock(grid: string[][]) {
  grid[2]![3] = 'Locked'
  grid[2]![4] = 'Damage R.'
  grid[3]![4] = 'Cooldown'
  grid[4]![4] = 'Damage'
  grid[5]![4] = 'Range'
  grid[6]![4] = 'Wildfire'
  grid[7]![3] = 'Locked'
  grid[7]![4] = 'Duration'
  grid[8]![4] = 'Cooldown'
  grid[2]![19] = 'Flame Bot - Cooldown'
  grid[2]![23] = '25'
}

describe('botSheetLayout', () => {
  it('detects and parses Bots v3.1 when attributes are in column E', () => {
    const grid = emptyGrid()
    fillFlameThunderBlock(grid)

    const layout = detectBotSheetLayout(grid)
    expect(layout).not.toBeNull()
    expect(layout!.attributeCol).toBe(BOT_ATTRIBUTE_COL)
    expect(layout!.labLevelCol).toBe(23)

    const statRows = parseBotStatRowsWithLayout(grid, layout!)
    expect(statRows.map((row) => row.attribute)).toEqual([
      'Damage R.',
      'Cooldown',
      'Damage',
      'Range',
      'Wildfire',
      'Duration',
      'Cooldown',
    ])

    const headerRows = parseBotHeaderRowsWithLayout(grid, layout!)
    expect(headerRows.map((row) => row.botId)).toEqual(['flame', 'thunder'])

    const labRows = parseBotLabRowsWithLayout(grid, layout!)
    expect(labRows).toEqual([{ rowIndex: 3, name: 'Flame Bot - Cooldown' }])
  })

  it('ignores Locked in column D when column E has the attribute', () => {
    const grid = emptyGrid()
    grid[2]![3] = 'Locked'
    grid[2]![4] = 'Damage R.'
    const layout = resolveBotSheetLayout(grid)
    expect(layout).not.toBeNull()
    const statRows = parseBotStatRowsWithLayout(grid, layout!)
    expect(statRows).toEqual([
      expect.objectContaining({ rowIndex: 3, attribute: 'Damage R.', levelKey: 'flameBotDamageReductionLevel' }),
    ])
  })

  it('merges single-column API ranges into a grid with row offset', () => {
    const grid = buildBotSheetGridFromColumnRanges([
      {
        range: "'Master Sheet'!E3:E5",
        values: [['Damage R.'], ['Cooldown'], ['Range']],
      },
    ])
    expect(grid[2]![4]).toBe('Damage R.')
    expect(grid[4]![4]).toBe('Range')
  })

  it('merges sparse B:X block reads using API range offset', () => {
    const grid = buildBotSheetGridFromBlockRange(
      "'Master Sheet'!B3:X10",
      [
        ['', '', 'Locked', 'Damage R.', '', '06'],
        ['', '', '', 'Cooldown', '', '03'],
      ],
      BOT_SHEET_GRID_ROWS,
    )
    expect(grid[2]![4]).toBe('Damage R.')
    expect(grid[2]![6]).toBe('06')
    expect(resolveBotSheetLayout(grid)).not.toBeNull()
  })
})
