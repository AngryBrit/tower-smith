import { describe, expect, it } from 'vitest'
import type { EffectivePathsWorkshopSheetRow } from './workshopSheetLayout'
import { workshopLevelsFromSheetRows } from './workshopLevelsFromSheet'

describe('workshopLevelsFromSheetRows', () => {
  const layout = {
    unlockedCol: 1,
    nameCol: 2,
    levelCol: 3,
    startRow: 0,
    endRow: 2,
  }

  const enhanceLayout = {
    nameCol: 15,
    levelCol: 17,
    startRow: 0,
    endRow: 2,
  }

  it('maps upgrade and enhancement level cells to workshop keys', () => {
    const grid = Array.from({ length: 3 }, () => Array(18).fill(''))
    grid[0]![2] = 'Damage'
    grid[0]![3] = 12
    grid[1]![15] = 'Damage +'
    grid[1]![17] = 3

    const workshopRows: EffectivePathsWorkshopSheetRow[] = [
      { rowIndex: 1, name: 'Damage' },
    ]
    const enhanceRows: EffectivePathsWorkshopSheetRow[] = [
      { rowIndex: 2, name: 'Damage +' },
    ]

    expect(
      workshopLevelsFromSheetRows(workshopRows, enhanceRows, grid, layout, enhanceLayout),
    ).toEqual({
      damageLevel: 12,
      enhanceDamageLevel: 3,
    })
  })

  it('treats blank level cells as zero', () => {
    const grid = [['', '', 'Range', '']]
    const workshopRows: EffectivePathsWorkshopSheetRow[] = [{ rowIndex: 1, name: 'Range' }]
    expect(workshopLevelsFromSheetRows(workshopRows, [], grid, layout, null)).toEqual({
      attackRangeLevel: 0,
    })
  })
})
