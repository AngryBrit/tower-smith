import { describe, expect, it } from 'vitest'
import { loadResearchFixture } from '../test/researchFixture'
import { buildLabSheetNameIndex } from './labSheetNames'
import {
  detectLabSheetBlocks,
  LAB_SHEET_GRID_COLUMNS,
  LAB_SHEET_GRID_ROWS,
  parseLabSheetRowsWithLayout,
} from './labSheetLayout'

function emptyGrid(): string[][] {
  return Array.from({ length: LAB_SHEET_GRID_ROWS }, () =>
    Array(LAB_SHEET_GRID_COLUMNS).fill(''),
  )
}

describe('labSheetLayout', () => {
  it('detects Labs | Level blocks and maps BOTS rows', () => {
    const grid = emptyGrid()
    const col = 36
    grid[1]![col] = 'Labs'
    grid[1]![col + 1] = 'Level'
    grid[1]![col + 2] = 'Target'
    grid[1]![col + 3] = 'Max'
    grid[2]![col] = 'Flame Bot - Cooldown'
    grid[2]![col + 1] = '0'
    grid[3]![col] = 'Gold Bot - Cooldown'
    grid[3]![col + 1] = '3'

    const blocks = detectLabSheetBlocks(grid)
    expect(blocks.length).toBeGreaterThanOrEqual(1)

    const data = loadResearchFixture()
    const index = buildLabSheetNameIndex(data)
    const rows = parseLabSheetRowsWithLayout(grid, blocks, index)
    expect(rows.map((r) => r.name)).toEqual(
      expect.arrayContaining(['Flame Bot - Cooldown', 'Golden Bot - Cooldown']),
    )
    expect(rows.find((r) => r.name === 'Golden Bot - Cooldown')?.rowIndex).toBe(4)
  })
})
