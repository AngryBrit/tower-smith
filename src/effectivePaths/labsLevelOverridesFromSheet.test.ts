import { describe, expect, it } from 'vitest'
import { labsLevelOverridesFromSheetRows } from './labsLevelOverridesFromSheet'
import type { EffectivePathsLabSheetRow } from './labSheetLayout'

describe('labsLevelOverridesFromSheetRows', () => {
  it('maps sheet level cells to section-item override keys', () => {
    const grid = Array.from({ length: 5 }, () => Array(8).fill(''))
    grid[2]![2] = 'Flame Bot - Cooldown'
    grid[2]![3] = 25
    grid[3]![2] = 'Damage'
    grid[3]![3] = '7'

    const labRows: EffectivePathsLabSheetRow[] = [
      {
        rowIndex: 3,
        name: 'Flame Bot - Cooldown',
        levelCol: 3,
        itemRef: { sectionIndex: 4, itemIndex: 0, canonicalName: 'Flame Bot - Cooldown' },
      },
      {
        rowIndex: 4,
        name: 'Damage',
        levelCol: 3,
        itemRef: { sectionIndex: 0, itemIndex: 0, canonicalName: 'Damage' },
      },
    ]

    expect(labsLevelOverridesFromSheetRows(labRows, grid)).toEqual({
      '4-0': 25,
      '0-0': 7,
    })
  })

  it('treats blank level cells as zero', () => {
    const grid = [['', '', 'Defense', '']]
    const labRows: EffectivePathsLabSheetRow[] = [
      {
        rowIndex: 1,
        name: 'Defense',
        levelCol: 3,
        itemRef: { sectionIndex: 2, itemIndex: 1, canonicalName: 'Defense' },
      },
    ]
    expect(labsLevelOverridesFromSheetRows(labRows, grid)).toEqual({ '2-1': 0 })
  })
})
